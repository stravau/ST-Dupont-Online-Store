import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/admin-api";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

// GET /api/admin/dashboard  — snapshot completo para os widgets do
// /admin (BigKPIs + BoutiqueSplit + tickers). Usado pela tranche B
// (LiveTicker) via polling silencioso a cada 30s. Actualmente o SSR do
// dashboard chama directamente getDashboardSnapshot(); este endpoint
// existe para o refresh sem reload da página.
export async function GET(req: Request) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ ok: false }, { status: 401 });
  const rl = await assertRateLimit(req, "admin-dashboard", 60, 60_000);
  if (rl) return rl;

  const role = staff.role;
  const boutiques: BoutiqueCode[] =
    role === "LOJA_LIS" ? ["LIS"] :
    role === "LOJA_VNG" ? ["VNG"] :
    ["LIS", "VNG"];

  const snapshot = await getDashboardSnapshot(boutiques);
  return NextResponse.json({ ok: true, snapshot });
}
