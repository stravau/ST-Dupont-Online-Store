import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { boutiqueFromRole, isStaffRole } from "@/lib/pos";
import { voidSale, PosError } from "@/lib/pos-service";

export const dynamic = "force-dynamic";

// POST /api/admin/pos/void — anula uma venda mal registada.
// Body: { saleId, reason }
//
// Não apaga: marca voidedAt/voidedReason, repõe o stock, escreve movimentos
// de AJUSTE a espelhar a reposição e reabre a reparação se a venda tinha
// fechado uma. Tudo numa transacção (ver lib/pos-service).
//
// O motivo é obrigatório — uma anulação sem explicação é indistinguível de um
// erro, e é precisamente isto que se vai querer auditar mais tarde.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "pos-void", 30, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  const role = staff?.role ?? null;
  if (!isStaffRole(role)) return NextResponse.json({ ok: false }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const saleId = typeof body.saleId === "string" ? body.saleId.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!saleId) return NextResponse.json({ ok: false, error: "saleId em falta" }, { status: 400 });
  if (reason.length < 3) {
    return NextResponse.json({ ok: false, error: "explica o motivo da anulação" }, { status: 400 });
  }

  try {
    await voidSale({
      saleId,
      reason,
      userId: staff?.id ?? null,
      // Um LOJA_* só anula vendas da sua loja.
      restrictToBoutique: boutiqueFromRole(role),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof PosError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return safeError(e);
  }
}
