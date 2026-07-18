import { auth } from "@/auth";
import { PageHeader } from "@/components/admin/page-header";
import { salesByStore, bestSellers, topOperators, monthWindow } from "@/lib/pos-reports";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

function boutiquesForRole(role: string | null): BoutiqueCode[] {
  if (role === "LOJA_LIS") return ["LIS"];
  if (role === "LOJA_VNG") return ["VNG"];
  return ["LIS", "VNG"];
}

const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = { LIS: "Lisboa", VNG: "V. N. de Gaia" };
const eur = (c: number) => (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

export default async function ReportsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role ?? null;
  const boutiques = boutiquesForRole(role);

  // Portugal is UTC+1/+2; the app runs in UTC. For a store-facing "this month"
  // the small offset is immaterial to the totals. Compute against now.
  const now = new Date();
  const { from, to } = monthWindow(now);
  const monthName = now.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  const [stores, best, operators] = await Promise.all([
    salesByStore(boutiques, from, to),
    bestSellers(boutiques, from, to, 10),
    topOperators(boutiques, from, to),
  ]);

  const combined = stores.reduce(
    (a, s) => ({
      grossCents: a.grossCents + s.grossCents,
      netCents: a.netCents + s.netCents,
      eciCommissionCents: a.eciCommissionCents + s.eciCommissionCents,
      sales: a.sales + s.sales,
    }),
    { grossCents: 0, netCents: 0, eciCommissionCents: 0, sales: 0 },
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PageHeader
        eyebrow="Operações"
        title="Relatórios"
        subtitle={`Vendas de ${monthName} · ${boutiques.length > 1 ? "ambas as boutiques" : BOUTIQUE_LABEL[boutiques[0]]} (líquido de devoluções)`}
      />

      {/* Per-store KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((s) => (
          <div key={s.boutique} className="border border-line border-l-[3px] border-l-gold bg-paper p-5">
            <p className="overline text-[0.55rem] text-muted">{BOUTIQUE_LABEL[s.boutique]}</p>
            <p className="mt-3 font-serif text-3xl text-ink tabular-nums">{eur(s.grossCents)}</p>
            <dl className="mt-3 space-y-1 text-[0.72rem] text-muted">
              <div className="flex justify-between"><dt>Líquido s/ IVA</dt><dd className="tabular-nums">{eur(s.netCents)}</dd></div>
              <div className="flex justify-between"><dt>Comissão ECI (19%)</dt><dd className="tabular-nums">− {eur(s.eciCommissionCents)}</dd></div>
              <div className="flex justify-between"><dt>Vendas · Devoluções</dt><dd className="tabular-nums">{s.sales} · {s.returns}</dd></div>
            </dl>
          </div>
        ))}
        {boutiques.length > 1 && (
          <div className="border border-line border-l-[3px] border-l-ink bg-ink/[0.03] p-5">
            <p className="overline text-[0.55rem] text-gold">Total · as duas lojas</p>
            <p className="mt-3 font-serif text-3xl text-ink tabular-nums">{eur(combined.grossCents)}</p>
            <dl className="mt-3 space-y-1 text-[0.72rem] text-muted">
              <div className="flex justify-between"><dt>Líquido s/ IVA</dt><dd className="tabular-nums">{eur(combined.netCents)}</dd></div>
              <div className="flex justify-between"><dt>Comissão ECI</dt><dd className="tabular-nums">− {eur(combined.eciCommissionCents)}</dd></div>
              <div className="flex justify-between"><dt>Total de vendas</dt><dd className="tabular-nums">{combined.sales}</dd></div>
            </dl>
          </div>
        )}
      </div>

      {/* Best-sellers + operators */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section>
          <h2 className="font-serif text-lg text-ink">Mais vendidos</h2>
          {best.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Ainda sem vendas este mês.</p>
          ) : (
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                  <th className="py-2 pr-3">Artigo</th>
                  <th className="py-2 px-2 text-center">Unid.</th>
                  <th className="py-2 pl-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {best.map((b) => (
                  <tr key={b.sku} className="border-b border-line/60">
                    <td className="py-2 pr-3"><span className="font-medium text-ink">{b.sku}</span><span className="ml-2 text-[0.72rem] text-muted">{b.desc}</span></td>
                    <td className="py-2 px-2 text-center tabular-nums">{b.units}</td>
                    <td className="py-2 pl-2 text-right tabular-nums">{eur(b.grossCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">Por vendedor</h2>
          {operators.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Sem vendas este mês.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {operators.map((o) => (
                <li key={`${o.boutique}-${o.initials}`} className="flex items-center justify-between border-b border-line/60 pb-2">
                  <span className="font-medium text-ink">{o.initials}{boutiques.length > 1 && <span className="ml-1.5 text-[0.65rem] text-muted">{o.boutique}</span>}</span>
                  <span className="text-right"><span className="tabular-nums">{eur(o.grossCents)}</span><span className="ml-2 text-[0.7rem] text-muted">{o.sales}×</span></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
