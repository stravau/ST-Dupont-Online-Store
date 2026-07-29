import type { KpiWithDelta } from "@/lib/dashboard-data";

// BigKPIs — os dois blocos de destaque no topo do dashboard executivo,
// dentro do <AdminHero>. Server component: recebe os KPIs já agregados
// pelo endpoint /api/admin/dashboard.
//
// Cada bloco: um número grande em gold-glow (hero-number) + label overline
// + delta % vs mesmo período do mês anterior (verde/vermelho semantic).
// Fade-up entrance via .hero-reveal.

const eur = (c: number) =>
  (c / 100).toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const eur2 = (c: number) =>
  (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

function DeltaBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  if (Math.abs(pct) < 0.5) {
    return (
      <span className="ml-2 inline-flex items-center gap-1 text-[0.68rem] tracking-wide text-cream/50">
        ≈ mesmo
      </span>
    );
  }
  const up = pct > 0;
  const color = up ? "text-[#7dc296]" : "text-[#e29999]"; // brighter on dark bg
  const arrow = up ? "▲" : "▼";
  return (
    <span className={`ml-2 inline-flex items-center gap-1 text-[0.68rem] font-medium tabular-nums ${color}`}>
      {arrow} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function BigKPIs({
  today,
  month,
  monthName,
}: {
  today: KpiWithDelta;
  month: KpiWithDelta;
  monthName: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* HOJE */}
      <div className="admin-hero-card hero-reveal p-5" style={{ animationDelay: "0ms" }}>
        <div className="flex items-baseline justify-between">
          <p className="overline text-[0.6rem] text-gold-soft">Hoje</p>
          <p className="text-[0.62rem] tracking-[0.12em] text-cream/50 uppercase tabular-nums">
            {new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long" })}
          </p>
        </div>
        <p className="hero-number mt-3 text-5xl">
          {eur(today.now.grossCents)}
          <DeltaBadge pct={today.deltaGrossPct} />
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-line pt-3 text-[0.72rem] text-cream/70">
          <div>
            <dt className="text-[0.58rem] tracking-[0.1em] text-cream/50 uppercase">Líquido</dt>
            <dd className="mt-0.5 font-medium text-cream/90 tabular-nums">{eur2(today.now.netCents)}</dd>
          </div>
          <div>
            <dt className="text-[0.58rem] tracking-[0.1em] text-cream/50 uppercase">Vendas · Devs</dt>
            <dd className="mt-0.5 font-medium text-cream/90 tabular-nums">
              {today.now.sales} · {today.now.returns}
              <DeltaBadge pct={today.deltaSalesPct} />
            </dd>
          </div>
        </dl>
      </div>

      {/* ESTE MÊS */}
      <div className="admin-hero-card hero-reveal p-5" style={{ animationDelay: "120ms" }}>
        <div className="flex items-baseline justify-between">
          <p className="overline text-[0.6rem] text-gold-soft">Este mês</p>
          <p className="text-[0.62rem] tracking-[0.12em] text-cream/50 uppercase capitalize">
            {monthName}
          </p>
        </div>
        <p className="hero-number mt-3 text-5xl">
          {eur(month.now.grossCents)}
          <DeltaBadge pct={month.deltaGrossPct} />
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-line pt-3 text-[0.72rem] text-cream/70">
          <div>
            <dt className="text-[0.58rem] tracking-[0.1em] text-cream/50 uppercase">Líquido</dt>
            <dd className="mt-0.5 font-medium text-cream/90 tabular-nums">{eur2(month.now.netCents)}</dd>
          </div>
          <div>
            <dt className="text-[0.58rem] tracking-[0.1em] text-cream/50 uppercase">Vendas · Devs</dt>
            <dd className="mt-0.5 font-medium text-cream/90 tabular-nums">
              {month.now.sales} · {month.now.returns}
              <DeltaBadge pct={month.deltaSalesPct} />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
