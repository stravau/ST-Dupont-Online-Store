// Brute-force shield for /admin/login.
//
// Counts failed credential attempts per email within a sliding window
// (LOCKOUT_WINDOW_MIN) and refuses further attempts for LOCKOUT_MIN
// once the threshold is hit. Successful logins clear the failure count
// for that email. IPs are recorded for incident review only — they
// don't gate the lockout (NAT'd boutique IPs would lock out the whole
// store on a single user's typo).

import { prisma } from "@/lib/prisma";

const LOCKOUT_THRESHOLD = 5;             // failures in the window…
const LOCKOUT_WINDOW_MIN = 10;            // …measured over 10 minutes
const LOCKOUT_DURATION_MIN = 15;          // lock for 15 minutes once tripped

// Returns null when the email is free to attempt login, or a Date when
// the lockout expires.
export async function lockoutExpiresAt(email: string): Promise<Date | null> {
  if (!email) return null;
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MIN * 60_000);
  const recent = await prisma.loginAttempt.findMany({
    where: { email, createdAt: { gte: windowStart } },
    orderBy: { createdAt: "desc" },
    select: { success: true, createdAt: true },
  });
  // Walk from newest backwards counting consecutive failures, breaking
  // on the first success — a successful login resets the window.
  let failures = 0;
  let lastFailureAt: Date | null = null;
  for (const a of recent) {
    if (a.success) break;
    failures++;
    if (!lastFailureAt) lastFailureAt = a.createdAt;
  }
  if (failures < LOCKOUT_THRESHOLD || !lastFailureAt) return null;
  const expiresAt = new Date(lastFailureAt.getTime() + LOCKOUT_DURATION_MIN * 60_000);
  if (expiresAt < new Date()) return null;
  return expiresAt;
}

export async function recordAttempt(email: string, success: boolean, ip?: string | null): Promise<void> {
  if (!email) return;
  try {
    await prisma.loginAttempt.create({
      data: { email, success, ip: ip ?? null },
    });
  } catch {
    // Best-effort — if the LoginAttempt table doesn't exist yet
    // (pre-migration) we still let auth flow through. The migration
    // ships in the same commit, so this is just defence for the
    // deploy-window transient state.
  }
}

// Friendly remaining-time string for the lockout error toast.
export function formatLockoutRemaining(expiresAt: Date): string {
  const ms = expiresAt.getTime() - Date.now();
  const mins = Math.max(1, Math.ceil(ms / 60_000));
  return mins === 1 ? "1 minuto" : `${mins} minutos`;
}
