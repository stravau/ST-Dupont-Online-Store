import type { TopOperator } from "@/lib/dashboard-data";
import type { BoutiqueCode } from "@/lib/pos";
import { BOUTIQUE_LABEL } from "@/components/admin/boutique-scope";

// TopOperators — top 3 vendedores por boutique, este mês. Só faz sentido
// para ADMIN (LOJA_* já tem a tabela completa em /admin/relatorios).
// Bar horizontal com o top 1 em gold-glow, top 2 em gold, top 3 em
// gold-soft. Coroa dourada minúscula no #1.

const eur0 = (c: number) =>
  (c / 100).toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

function BoutiqueBlock({ boutique, ops }: { boutique: BoutiqueCode; ops: TopOperator[] }) {
  const max = ops[0]?.grossCents ?? 1;
  return (
    <div>
      <p className="overline text-[0.58rem] text-gold">{BOUTIQUE_LABEL[boutique]}</p>
      {ops.length === 0 ? (
        <p className="mt-2 text-[0.72rem] text-muted">Sem vendas este mês.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {ops.map((o, i) => {
            const pct = Math.max(6, Math.round((o.grossCents / max) * 100));
            const bg =
              i === 0 ? "var(--gold)" :
              i === 1 ? "var(--gold-soft)" :
                        "color-mix(in oklab, var(--gold-soft) 60%, var(--paper))";
            const label = i === 0 ? "★" : `${i + 1}`;
            return (
              <li key={o.initials} className="grid grid-cols-[24px_1fr_auto] items-center gap-2">
                <span className={`text-center font-mono text-[0.7rem] ${i === 0 ? "text-gold" : "text-muted"}`}>
                  {label}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2 pb-1">
                    <span className="text-sm font-medium text-ink">{o.initials}</span>
                    <span className="text-[0.62rem] text-muted tabular-nums">
                      {o.sales} venda{o.sales === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="h-[6px] w-full overflow-hidden rounded-sm bg-line/60">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: bg }}
                    />
                  </div>
                </div>
                <span className="tabular-nums text-sm font-semibold text-ink">
                  {eur0(o.grossCents)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function TopOperatorsBar({
  perBoutique,
  monthName,
}: {
  perBoutique: Record<BoutiqueCode, TopOperator[]>;
  monthName: string;
}) {
  const boutiques = Object.keys(perBoutique) as BoutiqueCode[];
  return (
    <section className="painel-card card-in p-5">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <h2 className="font-serif text-lg text-ink">Top vendedores</h2>
        <span className="text-[0.6rem] tracking-[0.14em] text-muted uppercase capitalize">
          {monthName}
        </span>
      </div>
      <div className={`mt-4 grid gap-6 ${boutiques.length > 1 ? "md:grid-cols-2" : ""}`}>
        {boutiques.map((b) => (
          <BoutiqueBlock key={b} boutique={b} ops={perBoutique[b] ?? []} />
        ))}
      </div>
    </section>
  );
}
