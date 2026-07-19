// Shared security helpers for /api/admin/* handlers.
//
// Three things every admin mutating endpoint needs:
//   1. Same-origin check (CSRF defence-in-depth on top of SameSite=Lax)
//   2. A consistent way to fail without leaking Prisma error text
//   3. Audit-log helpers for image uploads
//
// proxy.ts gates /api/admin/* to STAFF only — but that includes the LOJA_*
// store logins (they need the POS), so it does NOT enforce ADMIN-only. Any
// route that WRITES to the catalogue (price, stock, promo, images, new
// articles) MUST gate itself with requireAdmin() from lib/admin-auth.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit, maybeGcRateLimitBuckets } from "@/lib/rate-limit";

// True when the request originated from the same host as the deploy.
// Browsers attach `Origin` to every fetch/XHR but NOT to top-level GETs,
// so we only enforce on mutating verbs. `Referer` is the fallback when
// Origin is missing (legacy clients) — both checked against the request
// host header.
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!host) return false;
  const expectedHttps = `https://${host}`;
  const expectedHttp  = `http://${host}`;
  if (origin) return origin === expectedHttps || origin === expectedHttp;
  if (referer) {
    try {
      const u = new URL(referer);
      return u.host === host;
    } catch {
      return false;
    }
  }
  // Neither header → likely a non-browser caller; reject by default.
  return false;
}

// Guard wrapper for mutating routes. Returns a 403 response when the
// caller isn't same-origin; returns null when the caller is OK to
// proceed (mirrors the early-return pattern of the existing handlers).
export function assertSameOrigin(req: Request): NextResponse | null {
  if (isSameOrigin(req)) return null;
  return NextResponse.json(
    { ok: false, error: "cross-origin request rejected" },
    { status: 403 },
  );
}

// Generic error response. Logs the real error to the server console
// (visible in Vercel function logs) but returns a stable message to
// the client so Prisma constraint names / table names / row values
// can't leak through error toasts.
export function safeError(e: unknown, fallback = "server error"): NextResponse {
  // eslint-disable-next-line no-console
  console.error("[admin-api]", e);
  return NextResponse.json({ ok: false, error: fallback }, { status: 500 });
}

// Per-admin rate limit. Returns a 429 response with Retry-After when
// the calling session is over its budget; null when the call should
// proceed. Keyed by user id (falls back to anonymous bucket — shouldn't
// happen post-proxy gate, but the safety net keeps the limiter honest
// if proxy.ts ever changes). Defaults: 30 requests / minute.
export async function assertRateLimit(
  req: Request,
  scope = "admin",
  limit?: number,
  windowMs?: number,
): Promise<NextResponse | null> {
  maybeGcRateLimitBuckets();
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "anon";
  const key = `${scope}:${userId}`;
  const r = checkRateLimit(key, limit, windowMs);
  if (r.ok) return null;
  return NextResponse.json(
    { ok: false, error: "rate limit exceeded" },
    { status: 429, headers: { "Retry-After": String(r.retryAfterSec) } },
  );
}

// ----- Image validation -----
//
// Hard cap blob uploads at 5 MB and the MIME allowlist below. The browser
// `accept="image/*"` attribute is cosmetic — anything can be POSTed with
// curl or a malicious site that already has an admin session.

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const IMAGE_ALLOWED_EXTS = /\.(jpe?g|png|webp|avif|gif)$/i;

export function validateImageUpload(file: File): { ok: true } | { ok: false; status: number; error: string } {
  if (file.size <= 0) return { ok: false, status: 400, error: "empty file" };
  if (file.size > IMAGE_MAX_BYTES) {
    return { ok: false, status: 413, error: `file too large (max ${IMAGE_MAX_BYTES / 1024 / 1024}MB)` };
  }
  if (!IMAGE_ALLOWED_MIMES.has(file.type)) {
    return { ok: false, status: 415, error: `unsupported MIME type (${file.type || "unknown"})` };
  }
  if (!IMAGE_ALLOWED_EXTS.test(file.name || "")) {
    return { ok: false, status: 415, error: "filename must end in .jpg/.png/.webp/.avif/.gif" };
  }
  return { ok: true };
}

// Validates a URL persisted to ProductVariant.images[]. Two forms are
// accepted: absolute https:// URLs (CDN-hosted images) and root-relative
// /products/... paths (bundled in /public). Everything else — `http:`,
// `javascript:`, `data:`, `file:`, protocol-relative `//evil` — is
// rejected. Empty strings fail too.
export function isValidImageUrl(s: unknown): s is string {
  if (typeof s !== "string") return false;
  const trimmed = s.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

// ----- EAN validation -----
//
// EAN-8 is 8 digits, EAN-13 is 13. We don't verify the checksum (some
// internal SKUs use the EAN field as a free-form barcode and may not be
// real EANs) but we DO reject anything that isn't pure digits of the
// right length, to keep the unique index clean.
export function isValidEan(s: string | null | undefined): boolean {
  if (s == null) return true; // null/undefined = clearing the field
  if (typeof s !== "string") return false;
  const trimmed = s.trim();
  if (!trimmed) return true;  // empty string = clearing the field
  return /^\d{8}$|^\d{13}$/.test(trimmed);
}
