import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { boutiqueFromRole, isStaffRole, type BoutiqueCode } from "@/lib/pos";
import { createSale, PosError, type SaleLineInput } from "@/lib/pos-service";

export const dynamic = "force-dynamic";

// POST /api/admin/pos/sale — register an in-store sale (or return). Body:
//   { boutique?, operatorInitials, type?, items: [{ ean|sku, quantity, unitPriceCents?, discountPct? }], note?, originalSaleId? }
// LOJA_* are pinned to their boutique; ADMIN (the boss) must name it. The heavy
// lifting (resolve lines, compute gross/net/ECI fee, write Sale + lines + signed
// stock movements + stock-cache + audit in one transaction) lives in
// lib/pos-service so it can be tested and reused by the terminal UI.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "pos-sale", 120, 60_000);
  if (rl) return rl;

  const staff = await currentStaff();
  const userId = staff?.id ?? null;
  const role = staff?.role ?? null;
  if (!isStaffRole(role)) return NextResponse.json({ ok: false }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  // Boutique — role wins; ADMIN may name it; a LOJA_* posting the other store
  // is rejected.
  const roleBoutique = boutiqueFromRole(role);
  const reqBoutique =
    body.boutique === "LIS" || body.boutique === "VNG" ? (body.boutique as BoutiqueCode) : null;
  if (roleBoutique && reqBoutique && reqBoutique !== roleBoutique) {
    return NextResponse.json({ ok: false, error: `role restricted to ${roleBoutique}` }, { status: 403 });
  }
  const boutique = roleBoutique ?? reqBoutique;
  if (!boutique) return NextResponse.json({ ok: false, error: "boutique required" }, { status: 400 });

  try {
    const sale = await createSale({
      boutique,
      operatorInitials: typeof body.operatorInitials === "string" ? body.operatorInitials : "",
      type: body.type === "DEVOLUCAO" ? "DEVOLUCAO" : "VENDA",
      items: Array.isArray(body.items) ? (body.items as SaleLineInput[]) : [],
      note: typeof body.note === "string" ? body.note : null,
      originalSaleId: typeof body.originalSaleId === "string" ? body.originalSaleId : null,
      userId,
    });
    return NextResponse.json({ ok: true, sale });
  } catch (e) {
    if (e instanceof PosError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
    }
    return safeError(e);
  }
}
