// Core in-store sale logic, separated from the HTTP handler so it can be unit-
// tested and reused by a server action from the terminal UI. Resolves each
// scanned line to a catalogue variant, computes gross/net/ECI-commission
// (mirrors the ECI Excel), then writes the Sale + lines + signed stock
// movements + stock-cache update + audit row in ONE transaction.
import { prisma } from "@/lib/prisma";
import {
  lineGrossCents,
  netFromGross,
  eciCommissionCents,
  stockColumnFor,
  type BoutiqueCode,
} from "@/lib/pos";

export interface SaleLineInput {
  ean?: string;
  sku?: string;
  quantity: number;
  unitPriceCents?: number; // optional override; defaults to the variant PVP
  discountPct?: number; // 0..1
}

export interface CreateSaleInput {
  boutique: BoutiqueCode;
  operatorInitials: string;
  type: "VENDA" | "DEVOLUCAO";
  items: SaleLineInput[];
  note?: string | null;
  originalSaleId?: string | null;
  userId?: string | null; // acting staff User.id for the audit row
}

// Typed error carrying an HTTP status so the route can map it cleanly.
export class PosError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "PosError";
  }
}

export async function createSale(input: CreateSaleInput) {
  const { boutique, type } = input;
  const initials = input.operatorInitials.trim().toUpperCase();

  const operator = await prisma.operator.findUnique({
    where: { boutique_initials: { boutique, initials } },
  });
  if (!operator || !operator.active) {
    throw new PosError(400, `operador "${initials}" inválido para ${boutique}`);
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new PosError(400, "no items");
  }

  // A resolved line is either a Dupont catalogue variant or an OtherBrandItem
  // (VNG only). Discriminated by `source`; stock lives in different tables.
  type ResolvedLine = {
    source: "DUPONT" | "OTHER_BRAND";
    variantId: string | null;
    otherBrandItemId: string | null;
    sku: string;
    ean: string | null;
    brand: string;
    desc: string;
    stockLis: number; // Dupont only
    stockVng: number; // Dupont only
    otherStock: number; // OtherBrandItem only
    quantity: number;
    unitPriceCents: number;
    discountPct: number;
    grossCents: number;
    netCents: number;
  };

  // Resolve + price every line before opening the transaction.
  const resolved: ResolvedLine[] = [];
  for (const it of input.items) {
    const q = Number(it.quantity);
    if (!Number.isInteger(q) || q <= 0) throw new PosError(400, "quantity must be a positive integer");
    const disc =
      typeof it.discountPct === "number" && it.discountPct >= 0 && it.discountPct < 1 ? it.discountPct : 0;
    const eanKey = typeof it.ean === "string" && it.ean.trim() ? it.ean.trim() : null;
    const skuKey = typeof it.sku === "string" && it.sku.trim() ? it.sku.trim() : null;
    if (!eanKey && !skuKey) throw new PosError(400, "each item needs an ean or sku");
    const key = eanKey ? { ean: eanKey } : { sku: skuKey! };

    // 1) Try the Dupont catalogue first.
    const v = await prisma.productVariant.findFirst({
      where: key,
      select: {
        id: true, sku: true, ean: true, name: true, priceCents: true,
        stockLis: true, stockVng: true, product: { select: { name: true } },
      },
    });

    if (v) {
      const unit =
        typeof it.unitPriceCents === "number" && Number.isFinite(it.unitPriceCents) && it.unitPriceCents >= 0
          ? Math.round(it.unitPriceCents)
          : v.priceCents;
      const gross = lineGrossCents(q, unit, disc);
      const vName = (v.name as { pt?: string; en?: string } | null) ?? {};
      const pName = (v.product?.name as { pt?: string; en?: string } | null) ?? {};
      const desc = `${pName.pt ?? pName.en ?? ""} ${vName.pt ?? vName.en ?? ""}`.trim() || v.sku;
      resolved.push({
        source: "DUPONT", variantId: v.id, otherBrandItemId: null, brand: "S.T. Dupont",
        sku: v.sku, ean: v.ean, desc, stockLis: v.stockLis, stockVng: v.stockVng, otherStock: 0,
        quantity: q, unitPriceCents: unit, discountPct: disc, grossCents: gross, netCents: netFromGross(gross),
      });
      continue;
    }

    // 2) Fall back to the other-brand master — VNG only. Selling an
    // other-brand line anywhere else would leak into another store's numbers.
    if (boutique !== "VNG") {
      throw new PosError(404, `artigo não encontrado: ${JSON.stringify(key)}`);
    }
    const ob = await prisma.otherBrandItem.findFirst({
      where: { ...key, active: true },
      select: { id: true, sku: true, ean: true, brand: true, descricao: true, pvpCents: true, stock: true },
    });
    if (!ob) throw new PosError(404, `artigo não encontrado: ${JSON.stringify(key)}`);

    // Other-brand PVP can be null in the Excel — then the till MUST send a
    // price (unitPriceCents), otherwise we can't ring it up.
    const overridePrice =
      typeof it.unitPriceCents === "number" && Number.isFinite(it.unitPriceCents) && it.unitPriceCents >= 0
        ? Math.round(it.unitPriceCents)
        : null;
    const unit = overridePrice ?? ob.pvpCents;
    if (unit == null) {
      throw new PosError(400, `"${ob.sku}" (${ob.brand}) não tem PVP — indica o preço no terminal`);
    }
    const gross = lineGrossCents(q, unit, disc);
    resolved.push({
      source: "OTHER_BRAND", variantId: null, otherBrandItemId: ob.id, brand: ob.brand,
      sku: ob.sku, ean: ob.ean, desc: ob.descricao || ob.sku, stockLis: 0, stockVng: 0, otherStock: ob.stock,
      quantity: q, unitPriceCents: unit, discountPct: disc, grossCents: gross, netCents: netFromGross(gross),
    });
  }

  const grossTotal = resolved.reduce((s, r) => s + r.grossCents, 0);
  const netTotal = resolved.reduce((s, r) => s + r.netCents, 0);
  const eci = eciCommissionCents(netTotal, boutique);
  const sign = type === "DEVOLUCAO" ? 1 : -1; // a return puts stock back
  const col = stockColumnFor(boutique);

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        boutique,
        operatorId: operator.id,
        type,
        grossCents: grossTotal,
        netCents: netTotal,
        eciCommissionCents: eci,
        note: typeof input.note === "string" ? input.note.slice(0, 500) : null,
        originalSaleId: input.originalSaleId ?? null,
      },
    });

    for (const r of resolved) {
      const item = await tx.saleItem.create({
        data: {
          saleId: sale.id, source: r.source, variantId: r.variantId, otherBrandItemId: r.otherBrandItemId,
          sku: r.sku, ean: r.ean, descSnapshot: r.desc, brand: r.brand,
          quantity: r.quantity, unitPriceCents: r.unitPriceCents,
          discountPct: r.discountPct, grossCents: r.grossCents, netCents: r.netCents,
        },
      });

      if (r.source === "OTHER_BRAND") {
        // Other-brand stock is a single flat counter — no per-store split and
        // no StockMovement ledger (that's Dupont-specific). Just move the count.
        await tx.otherBrandItem.update({
          where: { id: r.otherBrandItemId! },
          data: { stock: r.otherStock + sign * r.quantity },
        });
        continue;
      }

      // Dupont line — signed movement + per-store stock cache update.
      await tx.stockMovement.create({
        data: {
          boutique, variantId: r.variantId, sku: r.sku, ean: r.ean, type,
          quantity: sign * r.quantity, operatorId: operator.id, saleItemId: item.id,
        },
      });
      const nextCol = (col === "stockLis" ? r.stockLis : r.stockVng) + sign * r.quantity;
      const nextLis = col === "stockLis" ? nextCol : r.stockLis;
      const nextVng = col === "stockVng" ? nextCol : r.stockVng;
      await tx.productVariant.update({
        where: { id: r.variantId! },
        data: { [col]: nextCol, stock: nextLis + nextVng },
      });
    }

    await tx.adminAction.create({
      data: {
        userId: input.userId ?? null,
        entityType: "SALE",
        action: "CREATE",
        entityId: sale.id,
        after: {
          boutique, type, operator: initials, lines: resolved.length,
          grossCents: grossTotal, netCents: netTotal, eciCommissionCents: eci,
        },
      },
    });

    return sale;
  });
}
