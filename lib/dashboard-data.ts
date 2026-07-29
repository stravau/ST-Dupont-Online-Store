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
