// Lightweight sliding-window rate limiter for /api/admin/* mutating
// handlers. In-memory, per-key, no external infrastructure.
//
// Trade-off: in serverless deployments with multiple cold instances
// the limit is per-instance, not global. Admin traffic is single-digit
// users on a boutique laptop, so this is fine in practice — if we
// ever scale admin to multi-tenant we'd plug Upstash KV here. The
// public-facing surface is unaffected; we only call this from inside
// admin handlers.

interface Bucket { stamps: number[] }
const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT  = 30;       // requests…
const DEFAULT_WINDOW = 60_000;   // …per minute, per key

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function checkRateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  let b = buckets.get(key);
  if (!b) {
    b = { stamps: [] };
    buckets.set(key, b);
  }
  // Drop stamps outside the window.
  b.stamps = b.stamps.filter((t) => t > cutoff);
  if (b.stamps.length >= limit) {
    const oldest = b.stamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { ok: false, remaining: 0, retryAfterSec };
  }
  b.stamps.push(now);
  return { ok: true, remaining: limit - b.stamps.length, retryAfterSec: 0 };
}

// Periodic GC so the map doesn't grow without bound when keys go cold.
// Runs lazily on the first call after a 5-minute idle window.
let lastGc = Date.now();
const GC_INTERVAL = 5 * 60_000;
export function maybeGcRateLimitBuckets(): void {
  const now = Date.now();
  if (now - lastGc < GC_INTERVAL) return;
  lastGc = now;
  const cutoff = now - DEFAULT_WINDOW * 2;
  for (const [k, b] of buckets) {
    const fresh = b.stamps.filter((t) => t > cutoff);
    if (fresh.length === 0) buckets.delete(k);
    else b.stamps = fresh;
  }
}

// Client IP for public rate-limiting. Trusts the platform's x-forwarded-for
// (Vercel sets it); falls back to a shared "unknown" bucket so a missing
// header can't slip past the limit entirely.
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Public, IP-keyed guard for the unauthenticated API surface. Returns a ready
// 429 Response when the caller is over budget, or null to proceed. Same
// in-memory, per-instance trade-off as the admin limiter — limits are set
// generously so a real shopper (even several behind one boutique/NAT IP)
// never hits them, but a scripted flood does.
export function publicRateLimit(
  req: Request,
  name: string,
  limit: number,
  windowMs = DEFAULT_WINDOW,
): Response | null {
  maybeGcRateLimitBuckets();
  const res = checkRateLimit(`${name}:${clientIp(req)}`, limit, windowMs);
  if (res.ok) return null;
  return Response.json(
    { ok: false, error: "Too many requests" },
    { status: 429, headers: { "Retry-After": String(res.retryAfterSec) } },
  );
}
