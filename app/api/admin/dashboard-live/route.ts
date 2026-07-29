import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/admin-api";
import { getTickerRows } from "@/lib/dashboard-data";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

// GET /api/admin/dashboard-live  — endpoint leve para o LiveTicker.
// Só devolve as últimas N vendas por boutique (10 por defeito), não
// os totais/KPIs. Chamado a cada 30s pelo componente cliente.
// Rate-limit generoso (240/min por sessão) — polling a cada 30s dá 2/min,
// deixa margem para múltiplos separadores abertos + Ctrl+R eventuais.
export async function GET(req: Request) {
  const staff = await currentStaff();
  if (!staff) return NextResponse.json({ ok: false }, { status: 401 });
  const rl = await assertRateLimit(req, "dashboard-live", 240, 60_000);
  if (rl) return rl;

  const url = new URL(req.url);
  const perBoutique = Math.min(20, Math.max(1, Number(url.searchParams.get("n") ?? 10)));

  const role = staff.role;
  const boutiques: BoutiqueCode[] =
    role === "LOJA_LIS" ? ["LIS"] :
    role === "LOJA_VNG" ? ["VNG"] :
    ["LIS", "VNG"];

  const ticker = await getTickerRows(boutiques, perBoutique);
  return NextResponse.json({ ok: true, ticker, at: Date.now() });
}
