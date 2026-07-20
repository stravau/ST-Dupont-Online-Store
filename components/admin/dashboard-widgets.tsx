// Dashboard business-pulse widgets for the boss's landing page.
//   • SalesPulse  — today + this-month sales (per store + total, líquido, ECI fee)
//   • SalesTrend  — 30-day daily-sales bar chart (single series, on-brand)
// Both are server components — no client JS. Money in cents.
import type { StoreTotals, DayPoint } from "@/lib/pos-reports";
import type { BoutiqueCode } from "@/lib/pos";

// Whole-euro formatting — a dashboard is an at-a-glance view; the cent-precise
// figures live in Relatórios.
const eur0 = (c: number) => (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function sumStores(stores: StoreTotals[]) {
  return stores.reduce(
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

function PulseCard({ title, subtitle, stores }: { title: string; subtitle?: string; stores: StoreTotals[] }) {
  const total = sumStores(stores);
  const get = (b: BoutiqueCode) => stores.find((s) => s.boutique === b)?.grossCents ?? 0;
  return (
    <div className="border border-line border-l-[3px] border-l-gold bg-paper p-6">
      <div className="flex items-baseline justify-between">
        <p className="overline text-[0.55rem] text-muted">{title}</p>
        {subtitle && <span className="text-[0.6rem] tracking-[0.14em] text-muted uppercase">{subtitle}</span>}
      </div>
      <p className="mt-3 font-serif text-4xl text-ink tabular-nums">{eur0(total.grossCents)}</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="border-t border-line pt-2">
          <p className="text-[0.62rem] tracking-[0.12em] text-muted uppercase">Lisboa</p>
          <p className="mt-0.5 text-sm font-medium text-ink tabular-nums">{eur0(get("LIS"))}</p>
        </div>
        <div className="border-t border-line pt-2">
          <p className="text-[0.62rem] tracking-[0.12em] text-muted uppercase">V. N. Gaia</p>
          <p className="mt-0.5 text-sm font-medium text-ink tabular-nums">{eur0(get("VNG"))}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-1 text-[0.7rem] text-muted">
        <div className="flex justify-between"><dt>Líquido s/ IVA</dt><dd className="tabular-nums">{eur0(total.netCents)}</dd></div>
        <div className="flex justify-between"><dt>Comissão ECI (19%)</dt><dd className="tabular-nums">− {eur0(total.eciCommissionCents)}</dd></div>
        <div className="flex justify-between"><dt>Vendas · Devoluções</dt><dd className="tabular-nums">{total.sales} · {total.returns}</dd></div>
      </dl>
    </div>
  );
}

export function SalesPulse({ today, month, monthName }: { today: StoreTotals[]; month: StoreTotals[]; monthName: string }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <PulseCard title="Hoje" stores={today} />
      <PulseCard title="Este mês" subtitle={monthName} stores={month} />
    </section>
  );
}

// 30-day daily-sales bars. Single series → no legend (the title names it); one
// accent hue (ink bars, today in gold), thin marks with a 2px gap and 3px
// rounded tops anchored to a baseline rule. Labels wear ink tokens, never the
// mark colour. Native title tooltip per bar gives the hover detail.
export function SalesTrend({ points }: { points: DayPoint[] }) {
  const values = points.map((p) => p.grossCents);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, v) => a + v, 0);
  const mid = Math.floor(points.length / 2);

  return (
    <section className="border border-line bg-paper p-6">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <h2 className="font-serif text-xl text-ink">Tendência de vendas</h2>
        <span className="text-[0.6rem] tracking-[0.18em] text-muted uppercase">últimos 30 dias</span>
      </div>

      <p className="mt-3 text-[0.72rem] text-muted">
        Total 30 dias <span className="font-medium text-ink tabular-nums">{eur0(total)}</span>
        <span className="mx-2 text-line">·</span>
        máx/dia <span className="font-medium text-ink tabular-nums">{eur0(max)}</span>
      </p>

      <div className="mt-4 flex h-40 items-end gap-[2px] border-b border-line" role="img" aria-label={`Vendas diárias dos últimos ${points.length} dias`}>
        {points.map((p, i) => {
          const h = p.grossCents > 0 ? Math.max(3, Math.round((p.grossCents / max) * 100)) : 0;
          const isToday = i === points.length - 1;
          return (
            <div
              key={p.day}
              className={`flex-1 rounded-t-[3px] transition-colors ${isToday ? "bg-gold" : "bg-ink/80 hover:bg-ink"}`}
              style={{ height: `${h}%` }}
              title={`${p.label} · ${eur0(p.grossCents)}`}
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[0.58rem] text-muted tabular-nums">
        <span>{points[0]?.label}</span>
        <span>{points[mid]?.label}</span>
        <span>{points[points.length - 1]?.label} · hoje</span>
      </div>
    </section>
  );
}
