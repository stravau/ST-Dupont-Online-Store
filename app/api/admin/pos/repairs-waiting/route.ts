import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentStaff } from "@/lib/admin-auth";
import { boutiqueFromRole, isStaffRole, type BoutiqueCode } from "@/lib/pos";
import { assertRateLimit } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

// GET /api/admin/pos/repairs-waiting?boutique=LIS&q=<name>
//   Lists Repair rows with status = AGUARDANDO_CLIENTE, filtered by boutique
//   (LOJA_* forced to their store; ADMIN passes it via query) and optionally
//   narrowed by a case-insensitive customerName substring. Response is a
//   trimmed shape suitable for the POS reparação picker — id, name,
//   reference, subject, first-visit date.
export async function GET(req: Request) {
  const rl = await assertRateLimit(req, "pos-repairs-waiting", 60, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  if (!isStaffRole(staff?.role ?? null)) return NextResponse.json({ ok: false }, { status: 403 });

  const url = new URL(req.url);
  const roleBoutique = boutiqueFromRole(staff?.role ?? null);
  const reqBoutique =
    url.searchParams.get("boutique") === "LIS" || url.searchParams.get("boutique") === "VNG"
      ? (url.searchParams.get("boutique") as BoutiqueCode)
      : null;
  if (roleBoutique && reqBoutique && reqBoutique !== roleBoutique) {
    return NextResponse.json({ ok: false, error: `role restricted to ${roleBoutique}` }, { status: 403 });
  }
  const boutique = roleBoutique ?? reqBoutique;
  if (!boutique) return NextResponse.json({ ok: false, error: "boutique required" }, { status: 400 });

  const q = (url.searchParams.get("q") ?? "").trim();
  const rows = await prisma.repair.findMany({
    where: {
      boutique,
      status: "AGUARDANDO_CLIENTE",
      ...(q ? { customerName: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { firstVisitAt: "desc" },
    take: 20,
    select: {
      id: true, customerName: true, reference: true, subject: true, firstVisitAt: true,
    },
  });

  return NextResponse.json({ ok: true, rows });
}
