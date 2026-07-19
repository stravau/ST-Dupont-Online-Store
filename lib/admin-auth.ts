import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface StaffIdentity {
  email: string;
  id: string | null;
  role: string | null;
}

// Resolves the acting staff member's CURRENT role from the database rather than
// the session JWT. The JWT captures the role at login time and keeps it for the
// token's life, so a role change (e.g. demoting a boss account to a store
// login) wouldn't take effect until the user logged out and back in. Reading
// the DB here makes the change apply on the very next request.
//
// Deliberately NOT used in proxy.ts (which runs on every request, storefront
// included) — only in the low-traffic /admin pages + admin API, where one extra
// indexed lookup is negligible.
export async function currentStaff(): Promise<StaffIdentity | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  const u = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  return { email, id: u?.id ?? null, role: u?.role ?? null };
}

// Gate for catalogue-mutation routes: returns { userId } for an ADMIN, or a
// ready 403 Response for anyone else. IMPORTANT: proxy.ts admits the store
// logins (LOJA_LIS/LOJA_VNG) into /api/admin/* because they need the POS, so it
// does NOT enforce ADMIN-only — every route that writes to the catalogue MUST
// call this itself. Role comes from the DB (not the possibly-stale JWT).
export async function requireAdmin(): Promise<
  { ok: true; userId: string | null } | { ok: false; response: NextResponse }
> {
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "apenas o administrador pode fazer esta operação" }, { status: 403 }),
    };
  }
  return { ok: true, userId: staff.id };
}
