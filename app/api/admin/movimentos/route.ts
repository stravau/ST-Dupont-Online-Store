import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin-auth";
import { assertRateLimit, assertSameOrigin, safeError } from "@/lib/admin-api";
import { boutiqueFromRole, stockColumnFor, type BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

// POST /api/admin/movimentos — register a single stock in / out from the
// scan-at-a-time page. Body:
//   { boutique?, type: "ENTRADA"|"SAIDA", ean?|sku?, quantity? = 1, note? }
// Resolves the code to a Dupont variant (LIS/VNG) OR an OtherBrandItem (VNG
// only), writes the signed movement, updates the stock cache in one
// transaction, and returns the new stock levels + article snapshot.
//
// Same-origin + rate limit + role gate. LOJA_* are pinned to their boutique.
export async function POST(req: Request) {
  const csrf = assertSameOrigin(req);
  if (csrf) return csrf;
  const rl = await assertRateLimit(req, "movimentos", 240, 60_000);
  if (rl) return rl;

  const gate = await requireStaff();
  if (!gate.ok) return gate.response;
  const { userId, role } = gate;

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 }); }

  const rawType = body.type;
  if (rawType !== "ENTRADA" && rawType !== "SAIDA") {
    return NextResponse.json({ ok: false, error: "type inválido (ENTRADA | SAIDA)" }, { status: 400 });
  }
  const type = rawType as "ENTRADA" | "SAIDA";

  const roleBoutique = boutiqueFromRole(role);
  const reqBoutique =
    body.boutique === "LIS" || body.boutique === "VNG" ? (body.boutique as BoutiqueCode) : null;
  if (roleBoutique && reqBoutique && reqBoutique !== roleBoutique) {
    return NextResponse.json({ ok: false, error: `role restricted to ${roleBoutique}` }, { status: 403 });
  }
  const boutique = roleBoutique ?? reqBoutique;
  if (!boutique) return NextResponse.json({ ok: false, error: "boutique required" }, { status: 400 });

  const ean = typeof body.ean === "string" && body.ean.trim() ? body.ean.trim() : null;
  const sku = typeof body.sku === "string" && body.sku.trim() ? body.sku.trim() : null;
  if (!ean && !sku) return NextResponse.json({ ok: false, error: "ean ou sku obrigatório" }, { status: 400 });

  const rawQty = Number(body.quantity ?? 1);
  if (!Number.isInteger(rawQty) || rawQty <= 0) {
    return NextResponse.json({ ok: false, error: "quantity tem de ser inteiro > 0" }, { status: 400 });
  }
  const qty = rawQty;
  const sign = type === "ENTRADA" ? 1 : -1;
  const noteRaw = typeof body.note === "string" ? body.note.slice(0, 300) : null;

  const where = ean ? { ean } : { sku: sku! };

  try {
    // Try Dupont catalogue first.
    const variant = await prisma.productVariant.findFirst({
      where,
      select: {
        id: true, sku: true, ean: true, name: true, priceCents: true,
        stockLis: true, stockVng: true, product: { select: { name: true } },
      },
    });

    if (variant) {
      const col = stockColumnFor(boutique);
      const current = col === "stockLis" ? variant.stockLis : variant.stockVng;
      const next = current + sign * qty;
      // Guard against negative stock on SAIDA — the operator probably
      // scanned by mistake. Refuse; the app should never lie about stock.
      if (next < 0) {
        return NextResponse.json({
          ok: false,
          error: `Saída de ${qty} deixaria stock negativo (${col === "stockLis" ? "Lisboa" : "Gaia"} tem ${current}).`,
        }, { status: 409 });
      }
      const nextLis = col === "stockLis" ? next : variant.stockLis;
      const nextVng = col === "stockVng" ? next : variant.stockVng;

      const movement = await prisma.$transaction(async (tx) => {
        const m = await tx.stockMovement.create({
          data: {
            boutique, variantId: variant.id, sku: variant.sku, ean: variant.ean,
            type, quantity: sign * qty, note: noteRaw,
          },
        });
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { [col]: next, stock: nextLis + nextVng },
        });
        await tx.adminAction.create({
          data: {
            userId: userId ?? null,
            entityType: "STOCK_MOVEMENT",
            action: "CREATE",
            entityId: m.id,
            after: { boutique, type, sku: variant.sku, quantity: sign * qty, newStock: next },
          },
        });
        return m;
      });

      const vName = (variant.name as { pt?: string; en?: string } | null) ?? {};
      const pName = (variant.product?.name as { pt?: string; en?: string } | null) ?? {};
      return NextResponse.json({
        ok: true,
        source: "DUPONT",
        movementId: movement.id,
        article: {
          sku: variant.sku,
          ean: variant.ean,
          desc: `${pName.pt ?? pName.en ?? ""} ${vName.pt ?? vName.en ?? ""}`.trim() || variant.sku,
          brand: "S.T. Dupont",
          priceCents: variant.priceCents,
        },
        stockBefore: current,
        stockAfter: next,
      });
    }

    // Fall back to the other-brand master — VNG only.
    if (boutique !== "VNG") {
      return NextResponse.json({ ok: false, error: `artigo não encontrado: ${ean ?? sku}` }, { status: 404 });
    }
    const ob = await prisma.otherBrandItem.findFirst({
      where: { ...where, active: true },
      select: { id: true, sku: true, ean: true, brand: true, descricao: true, pvpCents: true, stock: true },
    });
    if (!ob) return NextResponse.json({ ok: false, error: `artigo não encontrado: ${ean ?? sku}` }, { status: 404 });

    const nextStock = ob.stock + sign * qty;
    if (nextStock < 0) {
      return NextResponse.json({
        ok: false,
        error: `Saída de ${qty} deixaria stock negativo (${ob.brand} · ${ob.sku} tem ${ob.stock}).`,
      }, { status: 409 });
    }

    // OtherBrandItem has no StockMovement ledger (that's Dupont-only) — we
    // just move the flat counter and audit it as an admin action so the
    // movement is still traceable.
    const audited = await prisma.$transaction(async (tx) => {
      const updated = await tx.otherBrandItem.update({
        where: { id: ob.id },
        data: { stock: nextStock },
      });
      const a = await tx.adminAction.create({
        data: {
          userId: userId ?? null,
          entityType: "OTHER_BRAND_STOCK",
          action: type,
          entityId: ob.sku,
          before: { stock: ob.stock },
          after: { stock: nextStock, brand: ob.brand, quantity: sign * qty, note: noteRaw },
        },
      });
      return { updated, actionId: a.id };
    });

    return NextResponse.json({
      ok: true,
      source: "OTHER_BRAND",
      movementId: audited.actionId,
      article: {
        sku: ob.sku, ean: ob.ean, desc: ob.descricao || ob.sku,
        brand: ob.brand, priceCents: ob.pvpCents,
      },
      stockBefore: ob.stock,
      stockAfter: nextStock,
    });
  } catch (e) {
    return safeError(e);
  }
}
