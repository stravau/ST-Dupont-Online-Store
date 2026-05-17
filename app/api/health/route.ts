import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Diagnostic endpoint — never throws. Reports env-var presence (booleans
// only, no values) and a live DB connectivity test, with the password
// stripped from any error message. Visit /api/health and read the JSON.
export async function GET() {
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
