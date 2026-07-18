// Reporting over the in-store sales — mirrors the Excel's Estat_Calc / Vend_Dia
// summaries. Returns (venda − devolução) figures per store plus best-sellers
// and per-operator totals for a window. Empty-safe: with no sales yet every
// number is 0 and lists are empty.
import { prisma } from "@/lib/prisma";
import { eciCommissionCents, type BoutiqueCode } from "@/lib/pos";

export interface StoreTotals {
  boutique: BoutiqueCode;
  grossCents: number; // venda − devolução (incl. VAT)
  netCents: number; // ex-VAT
  eciCommissionCents: number; // net × 0.19 (fee owed to ECI)
  sales: number; // # VENDA
  returns: number; // # DEVOLUCAO
}

export interface BestSeller {
  sku: string;
  desc: string;
  units: number;
  grossCents: number;
}

export interface OperatorTotals {
  initials: string;
  boutique: BoutiqueCode;
  grossCents: number;
  sales: number;
}

const signed = (type: string, n: number) => (type === "DEVOLUCAO" ? -n : n);

export async function salesByStore(
  boutiques: BoutiqueCode[],
  from: Date,
  to: Date,
): Promise<StoreTotals[]> {
  const rows = await prisma.sale.groupBy({
    by: ["boutique", "type"],
    where: { boutique: { in: boutiques }, soldAt: { gte: from, lte: to } },
    _sum: { grossCents: true, netCents: true },
    _count: { _all: true },
  });

  const map = new Map<BoutiqueCode, StoreTotals>();
  for (const b of boutiques) {
    map.set(b, { boutique: b, grossCents: 0, netCents: 0, eciCommissionCents: 0, sales: 0, returns: 0 });
  }
  for (const r of rows) {
    const t = map.get(r.boutique as BoutiqueCode)!;
    t.grossCents += signed(r.type, r._sum.grossCents ?? 0);
    t.netCents += signed(r.type, r._sum.netCents ?? 0);
    if (r.type === "DEVOLUCAO") t.returns += r._count._all;
    else t.sales += r._count._all;
  }
  for (const t of map.values()) t.eciCommissionCents = eciCommissionCents(t.netCents);
  return [...map.values()];
}

export async function bestSellers(
  boutiques: BoutiqueCode[],
  from: Date,
  to: Date,
  limit = 10,
): Promise<BestSeller[]> {
  const rows = await prisma.saleItem.groupBy({
    by: ["sku", "descSnapshot"],
    where: { sale: { boutique: { in: boutiques }, soldAt: { gte: from, lte: to }, type: "VENDA" } },
    _sum: { quantity: true, grossCents: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({
    sku: r.sku,
    desc: r.descSnapshot,
    units: r._sum.quantity ?? 0,
    grossCents: r._sum.grossCents ?? 0,
  }));
}

export async function topOperators(
  boutiques: BoutiqueCode[],
  from: Date,
  to: Date,
): Promise<OperatorTotals[]> {
  const rows = await prisma.sale.groupBy({
    by: ["operatorId"],
    where: { boutique: { in: boutiques }, soldAt: { gte: from, lte: to }, type: "VENDA" },
    _sum: { grossCents: true },
    _count: { _all: true },
  });
  if (rows.length === 0) return [];
  const ops = await prisma.operator.findMany({
    where: { id: { in: rows.map((r) => r.operatorId) } },
    select: { id: true, initials: true, boutique: true },
  });
  const byId = new Map(ops.map((o) => [o.id, o]));
  return rows
    .map((r) => {
      const o = byId.get(r.operatorId);
      return {
        initials: o?.initials ?? "?",
        boutique: (o?.boutique ?? "LIS") as BoutiqueCode,
        grossCents: r._sum.grossCents ?? 0,
        sales: r._count._all,
      };
    })
    .sort((a, b) => b.grossCents - a.grossCents);
}

// Convenience window: the current calendar month [1st 00:00, now].
export function monthWindow(now: Date): { from: Date; to: Date } {
  const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  return { from, to: now };
}
