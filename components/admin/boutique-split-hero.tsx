import type { StoreTotals } from "@/lib/pos-reports";
import type { BoutiqueCode } from "@/lib/pos";

// BoutiqueSplit dentro do <AdminHero>: dois cards lado a lado com totais
// de hoje + do mês por boutique. Um pouco mais denso que os BigKPIs
// porque aqui a comparação entre lojas é o insight-chave.
//
// Só aparece se `boutiques` tem mais que uma entrada (i.e. role=ADMIN
// vê ambas; LOJA_* vê só a sua e este componente fica escondido).

const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = {
  LIS: "Lisboa",
  VNG: "V. N. de Gaia",
};

const eur0 = (c: number) =>
  (c / 100).toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

export function BoutiqueSplitHero({
  boutiques,
}: {
  boutiques: { boutique: BoutiqueCode; today: StoreTotals; month: StoreTotals }[];
}) {
  if (boutiques.length < 2) return null;
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {boutiques.map((b, i) => (
        <div
          key={b.boutique}
          className="admin-hero-card hero-reveal border-l-[3px] border-l-gold/60 p-4"
          style={{ animationDelay: `${240 + i * 80}ms` }}
        >
          <div className="flex items-baseline justify-between">
            <p className="overline text-[0.55rem] text-gold-soft">{BOUTIQUE_LABEL[b.boutique]}</p>
            <p className="text-[0.55rem] tracking-[0.12em] text-cream/40 uppercase">
              Hoje · Mês
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[0.55rem] tracking-[0.1em] text-cream/50 uppercase">Hoje</p>
              <p className="hero-number mt-1 text-2xl">{eur0(b.today.grossCents)}</p>
              <p className="mt-1 text-[0.62rem] text-cream/60 tabular-nums">
                {b.today.sales} venda{b.today.sales === 1 ? "" : "s"}
                {b.today.returns > 0 && ` · ${b.today.returns} dev.`}
              </p>
            </div>
            <div className="border-l border-ink-line pl-4">
              <p className="text-[0.55rem] tracking-[0.1em] text-cream/50 uppercase">Mês</p>
              <p className="hero-number mt-1 text-2xl">{eur0(b.month.grossCents)}</p>
              <p className="mt-1 text-[0.62rem] text-cream/60 tabular-nums">
                {b.month.sales} venda{b.month.sales === 1 ? "" : "s"}
                {b.month.returns > 0 && ` · ${b.month.returns} dev.`}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
