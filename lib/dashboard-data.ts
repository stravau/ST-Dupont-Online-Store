// Composição de dados para o dashboard executivo do /admin.
// Uma função `getDashboardSnapshot(role)` que devolve tudo o que os
// widgets precisam num só round-trip: totais de hoje + mês + os mesmos
// períodos do mês passado para os deltas %.
//
// Isto vive em lib/ (não em pos-reports.ts) porque combina múltiplas
// queries de forma específica ao dashboard e envolve lógica de janelas
// "mesmo período do mês anterior". Nada que sirva outro report.
import { salesByStore, dayWindow, monthWindow, type StoreTotals } from "@/lib/pos-reports";
import { prisma } from "@/lib/prisma";
import type { BoutiqueCode } from "@/lib/pos";

export interface KpiValue {
  grossCents: number;
  netCents: number;
  sales: number;
  returns: number;
  eciCommissionCents: number;
}

export interface KpiWithDelta {
  now: KpiValue;
  previous: KpiValue;
  deltaGrossPct: number | null; // null quando previous é 0 (não faz sentido dividir)
  deltaSalesPct: number | null;
}

export interface DashboardSnapshot {
  today: KpiWithDelta;
  month: KpiWithDelta;
  boutiques: { boutique: BoutiqueCode; today: StoreTotals; month: StoreTotals }[];
  monthName: string;
  generatedAt: string;
}

function summarize(rows: StoreTotals[]): KpiValue {
  return rows.reduce(
    (a, s) => ({
      grossCents: a.grossCents + s.grossCents,
      netCents: a.netCents + s.netCents,
      eciCommissionCents: a.eciCommissionCents + s.eciCommissionCents,
      sales: a.sales + s.sales,
      returns: a.returns + s.returns,
    }),
    { grossCents: 0, netCents: 0, eciCommissionCents: 0, sales: 0, returns: 0 },
  );
}

function pctDelta(now: number, prev: number): number | null {
  if (prev === 0) return null; // sem base para %
  return ((now - prev) / prev) * 100;
}

// "Mesmo dia do mês passado" para o KPI de HOJE.
// Se hoje é 31 e o mês passado só tinha 30 dias, tomamos o dia 30
// (fallback comum). Zona horária local (Europe/Lisbon é a operação).
function sameDayLastMonth(d: Date): { from: Date; to: Date } {
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  // Último dia do mês anterior (0-indexed month === m, day 0 = last day of m-1)
  const lastDayPrevMonth = new Date(y, m, 0).getDate();
  const targetDay = Math.min(day, lastDayPrevMonth);
  const from = new Date(y, m - 1, targetDay, 0, 0, 0, 0);
  const to = new Date(y, m - 1, targetDay, 23, 59, 59, 999);
  return { from, to };
}

// "Mesmo intervalo do mês passado" para o KPI DO MÊS até hoje.
// Ex.: hoje = 27/07 → mês actual = 1-27/07, comparar com 1-27/06.
// Ajusta ao número de dias do mês anterior se o intervalo passar do fim.
function samePeriodLastMonth(d: Date): { from: Date; to: Date } {
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  const lastDayPrevMonth = new Date(y, m, 0).getDate();
  const targetDay = Math.min(day, lastDayPrevMonth);
  const from = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const to = new Date(y, m - 1, targetDay, 23, 59, 59, 999);
  return { from, to };
}

// Live ticker rows — as últimas N vendas por boutique. Cada linha traz o
// que precisamos para render sem re-fetch: hora, operador, descrição
// concatenada dos artigos, gross, tipo. Ordenado por soldAt desc.
// Devoluções e reparações também entram (badge diferente na UI).
export interface TickerRow {
  id: string;
  boutique: BoutiqueCode;
  soldAt: string; // ISO
  operator: string;
  type: "VENDA" | "DEVOLUCAO" | "REPARACAO";
  grossCents: number;
  itemsSummary: string; // "1× Ligne 2 Palladium · 2× Recarga Gas"
}

export async function getTickerRows(
  boutiques: BoutiqueCode[],
  perBoutiqueLimit: number = 10,
): Promise<Record<BoutiqueCode, TickerRow[]>> {
  // Uma query por boutique para poder aplicar limit isoladamente
  // (evita puxar 20 de VNG quando só queríamos 10 e depois filtrar).
  const perBoutique = await Promise.all(
    boutiques.map(async (b) => {
      const sales = await prisma.sale.findMany({
        where: { boutique: b },
        orderBy: { soldAt: "desc" },
        take: perBoutiqueLimit,
        include: {
          operator: { select: { initials: true } },
          items: { select: { quantity: true, descSnapshot: true }, take: 4 },
        },
      });
      const rows: TickerRow[] = sales.map((s) => ({
        id: s.id,
        boutique: b,
        soldAt: s.soldAt.toISOString(),
        operator: s.operator.initials,
        type: s.type as "VENDA" | "DEVOLUCAO" | "REPARACAO",
        grossCents: s.grossCents,
        itemsSummary:
          s.items.map((i) => `${i.quantity}× ${truncate(i.descSnapshot, 40)}`).join(" · ") || "—",
      }));
      return [b, rows] as const;
    }),
  );
  const out = {} as Record<BoutiqueCode, TickerRow[]>;
  for (const [b, rows] of perBoutique) out[b] = rows;
  return out;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// Heatmap 8 semanas × 7 dias (Segunda→Domingo). Cada célula tem o gross
// desse dia em cents. Semanas ordenadas mais antigas → mais recentes,
// portanto a linha de baixo é a semana actual, a de cima 7 semanas atrás.
// A semana começa a Segunda (ISO 8601). Devolve exactamente 8 * 7 = 56 células.
export interface HeatmapCell {
  date: string; // YYYY-MM-DD
  weekIdx: number; // 0..7 (0 = mais antiga, 7 = actual)
  dayIdx: number; // 0..6 (0 = seg, 6 = dom)
  grossCents: number;
}
export interface Heatmap {
  cells: HeatmapCell[];
  weeks: number;
  maxGross: number; // para normalizar cores
  insightText: string; // ex.: "Sábados são 2.1× a média"
}

function isoWeekMondayStart(d: Date): Date {
  const day = d.getDay(); // 0=sun, 1=mon, ..., 6=sat
  const diff = (day === 0 ? -6 : 1 - day); // dias para chegar a Segunda
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff, 0, 0, 0, 0);
  return m;
}

export async function getHeatmap(
  boutiques: BoutiqueCode[],
  weeks: number = 8,
  now: Date = new Date(),
): Promise<Heatmap> {
  const currentMonday = isoWeekMondayStart(now);
  const fromDate = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() - (weeks - 1) * 7, 0, 0, 0, 0);
  const toDate = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + 6, 23, 59, 59, 999);

  const sales = await prisma.sale.findMany({
    where: {
      boutique: { in: boutiques },
      soldAt: { gte: fromDate, lte: toDate },
    },
    select: { soldAt: true, type: true, grossCents: true },
  });

  const grid: Record<string, number> = {};
  for (const s of sales) {
    const key = ymd(s.soldAt);
    const sign = s.type === "DEVOLUCAO" ? -1 : 1;
    grid[key] = (grid[key] ?? 0) + sign * s.grossCents;
  }

  const cells: HeatmapCell[] = [];
  const perWeekday: number[] = [0, 0, 0, 0, 0, 0, 0]; // Seg..Dom
  const countWeekday: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const day = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + w * 7 + d, 0, 0, 0, 0);
      const key = ymd(day);
      const v = grid[key] ?? 0;
      cells.push({ date: key, weekIdx: w, dayIdx: d, grossCents: v });
      if (v > 0) {
        perWeekday[d] += v;
        countWeekday[d]++;
      }
    }
  }
  const maxGross = cells.reduce((m, c) => Math.max(m, c.grossCents), 0);

  // Insight: qual o dia da semana em que se vende mais em média?
  const avgWeekday = perWeekday.map((sum, i) => (countWeekday[i] > 0 ? sum / countWeekday[i] : 0));
  const overallAvg = avgWeekday.reduce((a, v) => a + v, 0) / 7 || 1;
  let bestIdx = 0;
  for (let i = 1; i < 7; i++) if (avgWeekday[i] > avgWeekday[bestIdx]) bestIdx = i;
  const weekdays = ["Segundas", "Terças", "Quartas", "Quintas", "Sextas", "Sábados", "Domingos"];
  const ratio = overallAvg > 0 ? avgWeekday[bestIdx] / overallAvg : 0;
  const insightText = ratio > 1.15
    ? `${weekdays[bestIdx]} são ${ratio.toFixed(1)}× a média da semana`
    : "Sem grande variação por dia da semana";

  return { cells, weeks, maxGross, insightText };
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Top 3 operadores por boutique do mês actual (só ADMIN). Devolve
// { LIS: [top3], VNG: [top3] } ordenado por gross desc.
export interface TopOperator {
  initials: string;
  grossCents: number;
  sales: number;
}
export async function getTopOperatorsPerBoutique(
  boutiques: BoutiqueCode[],
  limitPerBoutique: number = 3,
  now: Date = new Date(),
): Promise<Record<BoutiqueCode, TopOperator[]>> {
  const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const out = {} as Record<BoutiqueCode, TopOperator[]>;
  for (const b of boutiques) {
    const grouped = await prisma.sale.groupBy({
      by: ["operatorId"],
      where: {
        boutique: b,
        soldAt: { gte: from, lte: to },
        type: { in: ["VENDA", "REPARACAO"] }, // devoluções não contam para ranking
      },
      _sum: { grossCents: true },
      _count: { _all: true },
    });
    if (grouped.length === 0) { out[b] = []; continue; }
    const ops = await prisma.operator.findMany({
      where: { id: { in: grouped.map((g) => g.operatorId) } },
      select: { id: true, initials: true },
    });
    const byId = new Map(ops.map((o) => [o.id, o.initials]));
    const rows: TopOperator[] = grouped
      .map((g) => ({
        initials: byId.get(g.operatorId) ?? "?",
        grossCents: g._sum.grossCents ?? 0,
        sales: g._count._all,
      }))
      .sort((a, b) => b.grossCents - a.grossCents)
      .slice(0, limitPerBoutique);
    out[b] = rows;
  }
  return out;
}

export async function getDashboardSnapshot(
  boutiques: BoutiqueCode[],
  now: Date = new Date(),
): Promise<DashboardSnapshot> {
  const today = dayWindow(now);
  const month = monthWindow(now);
  const todayPrev = sameDayLastMonth(now);
  const monthPrev = samePeriodLastMonth(now);

  const [rowsToday, rowsMonth, rowsTodayPrev, rowsMonthPrev] = await Promise.all([
    salesByStore(boutiques, today.from, today.to),
    salesByStore(boutiques, month.from, month.to),
    salesByStore(boutiques, todayPrev.from, todayPrev.to),
    salesByStore(boutiques, monthPrev.from, monthPrev.to),
  ]);

  const nowToday = summarize(rowsToday);
  const nowMonth = summarize(rowsMonth);
  const prevToday = summarize(rowsTodayPrev);
  const prevMonth = summarize(rowsMonthPrev);

  const perBoutique = boutiques.map((b) => ({
    boutique: b,
    today: rowsToday.find((s) => s.boutique === b) ?? {
      boutique: b, grossCents: 0, netCents: 0, eciCommissionCents: 0, sales: 0, returns: 0,
    },
    month: rowsMonth.find((s) => s.boutique === b) ?? {
      boutique: b, grossCents: 0, netCents: 0, eciCommissionCents: 0, sales: 0, returns: 0,
    },
  }));

  const monthName = now.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  return {
    today: {
      now: nowToday,
      previous: prevToday,
      deltaGrossPct: pctDelta(nowToday.grossCents, prevToday.grossCents),
      deltaSalesPct: pctDelta(nowToday.sales, prevToday.sales),
    },
    month: {
      now: nowMonth,
      previous: prevMonth,
      deltaGrossPct: pctDelta(nowMonth.grossCents, prevMonth.grossCents),
      deltaSalesPct: pctDelta(nowMonth.sales, prevMonth.sales),
    },
    boutiques: perBoutique,
    monthName,
    generatedAt: new Date().toISOString(),
  };
}
