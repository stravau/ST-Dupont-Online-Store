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
