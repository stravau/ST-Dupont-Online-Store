import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const STAFF_ROLES = new Set(["ADMIN", "LOJA_LIS", "LOJA_VNG"]);

// Diagnostic endpoint — never throws. Public callers (uptime monitors) get a
// bare liveness `{ ok: true }`; the env-presence booleans, product count and
// DB error detail are staff-only, so the endpoint stops advertising the app's
// internals to anonymous visitors.
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!role || !STAFF_ROLES.has(role)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    AUTH_URL: Boolean(process.env.AUTH_URL),
    NODE_ENV: process.env.NODE_ENV ?? null,
  };

  let db: { ok: boolean; productCount?: number; error?: string } = { ok: false };
  try {
    const productCount = await prisma.product.count();
    db = { ok: true, productCount };
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    // Remove any user:password@ that might appear in a connection error
    db = { ok: false, error: msg.replace(/\/\/[^@\s]*@/g, "//***@").slice(0, 600) };
  }

  return NextResponse.json({ env, db }, { status: 200 });
}
