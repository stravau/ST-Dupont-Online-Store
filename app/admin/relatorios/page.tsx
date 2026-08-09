import { currentStaff } from "@/lib/admin-auth";
import { AdminHero } from "@/components/admin/admin-hero";
import { ReportDatePicker } from "@/components/admin/report-date-picker";
import { ExportChoice } from "@/components/admin/export-choice";
import { VoidSaleButton } from "@/components/admin/void-sale-button";
import { salesByStore, bestSellers, salesLog, operatorLifetimeTotals, monthRange, rangeWindow, type SaleLogEntry } from "@/lib/pos-reports";
import type { BoutiqueCode } from "@/lib/pos";
import {
  BOUTIQUE_LABEL,
  BoutiqueScopeTabs,
  boutiquesForRole,
  resolveScope,
  type BoutiqueScope,
} from "@/components/admin/boutique-scope";

export const dynamic = "force-dynamic";

const eur = (c: number) => (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
const hhmm = (d: Date) => d.toLocaleTimeString("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" });
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const dayLabel = (d: Date) =>
  d.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long" });

const ymdOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const isYmd = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; month?: string; boutique?: string }>;
}) {
  const { from: fromParam, to: toParam, month, boutique } = await searchParams;
  const staff = await currentStaff();
  const allowed = boutiquesForRole(staff?.role ?? null);
  // ?boutique= re-escopa TUDO nesta página — totais, operadores, registo e
  // mais vendidos — porque as quatro queries já aceitam BoutiqueCode[].
  const { scope, boutiques } = resolveScope(boutique, allowed);
  const multi = boutiques.length > 1;
  // Only the boss (ADMIN) sees the ECI concession fee. LOJA_* get the
  // same monthly report shape minus every commission column / row.
  const showCommission = staff?.role === "ADMIN";
  // Per-boutique rate for the pill next to "Comissão ECI".
  const pctLabel: Record<BoutiqueCode, string> = { LIS: "22%", VNG: "19%" };

  const now = new Date();
  // Passou de mês para intervalo livre. ?month= continua a ser aceite para os
  // links antigos não morrerem — é convertido no intervalo desse mês; sem
  // parâmetros nenhuns, abre no mês corrente até hoje, que era o antigo
  // comportamento por omissão.
  const legacy = month && /^\d{4}-\d{2}$/.test(month) ? monthRange(month) : null;
  const fromYmd = isYmd(fromParam)
    ? fromParam
    : legacy
      ? ymdOf(legacy.from)
      : ymdOf(new Date(now.getFullYear(), now.getMonth(), 1));
  const toYmd = isYmd(toParam) ? toParam : legacy ? ymdOf(legacy.to) : ymdOf(now);

  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const { from, to } = rangeWindow(new Date(fy, fm - 1, fd), new Date(ty, tm - 1, td));
  const sameDay = fromYmd === toYmd;
  const periodLabel = sameDay
    ? from.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : `${from.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })} → ${to.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}`;

  // Preserva o intervalo ao trocar de loja e vice-versa.
  const hrefFor = (s: BoutiqueScope) => {
    const params = new URLSearchParams({ from: fromYmd, to: toYmd });
    if (s !== "all") params.set("boutique", s);
    return `/admin/relatorios?${params.toString()}`;
  };
  const exportQs = scope === "all" ? "" : `&boutique=${scope}`;

  const [stores, best, log, operators] = await Promise.all([
    salesByStore(boutiques, from, to),
    bestSellers(boutiques, from, to, 12, "DUPONT"), // Dupont-only — other brands ranked separately
    salesLog(boutiques, from, to, 500),
    operatorLifetimeTotals(boutiques),
  ]);

  const operatorsTotal = operators.reduce(
    (a, o) => ({ movements: a.movements + o.movements, units: a.units + o.units, grossCents: a.grossCents + o.grossCents }),
    { movements: 0, units: 0, grossCents: 0 },
  );

  const combined = stores.reduce(
    (a, s) => ({
      grossCents: a.grossCents + s.grossCents,
      netCents: a.netCents + s.netCents,
      eciCommissionCents: a.eciCommissionCents + s.eciCommissionCents,
      sales: a.sales + s.sales,
    }),
    { grossCents: 0, netCents: 0, eciCommissionCents: 0, sales: 0 },
  );

  // Group the log by calendar day (newest first).
  const days: { key: string; label: string; rows: SaleLogEntry[] }[] = [];
  for (const e of log) {
    const key = dayKey(e.soldAt);
    let d = days.find((x) => x.key === key);
    if (!d) {
      d = { key, label: dayLabel(e.soldAt), rows: [] };
      days.push(d);
    }
    d.rows.push(e);
  }

  return (
    <div>
      <AdminHero
        eyebrow="Operações"
        title="Relatórios"
        subtitle={`${periodLabel} · ${multi ? "ambas as boutiques" : BOUTIQUE_LABEL[boutiques[0]]} (líquido de devoluções)`}
        action={<ReportDatePicker from={fromYmd} to={toYmd} showExport={false} />}
      >
        {/* Totals per store dentro do hero — grande contraste sobre navy. */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <div key={s.boutique} className="admin-hero-card p-4">
              <p className="overline text-[0.55rem] text-gold-soft">{BOUTIQUE_LABEL[s.boutique]}</p>
              <p className="hero-number mt-2 text-3xl">{eur(s.grossCents)}</p>
              <dl className="mt-3 space-y-1 text-[0.72rem] text-cream/70">
                <div className="flex justify-between"><dt>Líquido s/ IVA</dt><dd className="tabular-nums text-cream/90">{eur(s.netCents)}</dd></div>
                {showCommission && (
                  <div className="flex justify-between"><dt>Comissão ECI ({pctLabel[s.boutique]})</dt><dd className="tabular-nums text-cream/90">− {eur(s.eciCommissionCents)}</dd></div>
                )}
                <div className="flex justify-between"><dt>Vendas · Devoluções</dt><dd className="tabular-nums text-cream/90">{s.sales} · {s.returns}</dd></div>
              </dl>
            </div>
          ))}
          {multi && (
            <div className="admin-hero-card border-l-[3px] border-l-gold p-4">
              <p className="overline text-[0.55rem] text-gold">Total · as duas lojas</p>
              <p className="hero-number mt-2 text-3xl">{eur(combined.grossCents)}</p>
              <dl className="mt-3 space-y-1 text-[0.72rem] text-cream/70">
                <div className="flex justify-between"><dt>Líquido s/ IVA</dt><dd className="tabular-nums text-cream/90">{eur(combined.netCents)}</dd></div>
                {showCommission && (
                  <div className="flex justify-between"><dt>Comissão ECI</dt><dd className="tabular-nums text-cream/90">− {eur(combined.eciCommissionCents)}</dd></div>
                )}
                <div className="flex justify-between"><dt>Total de vendas</dt><dd className="tabular-nums text-cream/90">{combined.sales}</dd></div>
              </dl>
            </div>
          )}
        </div>
      </AdminHero>

      {/* Two independent columns: the report on the left, the best-sellers rail
          pinned on the right so it never pushes the log around. */}
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
        <div className="min-w-0 flex-1">
          {/* Vendas por operador — cumulative (all-time) totals, mirroring the
              Excel Estat_Calc pivot. Independent of the month filter above. */}
          {/* Filtro de loja imediatamente acima da primeira tabela que ele
              afecta — no hero ficava longe do conteúdo que re-escopa. */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <BoutiqueScopeTabs scope={scope} allowed={allowed} hrefFor={hrefFor} />
            <ExportChoice from={fromYmd} to={toYmd} boutique={scope === "all" ? "" : scope} />
          </div>

          <section className="mt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-lg text-ink">Vendas por operador</h2>
              <span className="text-[0.62rem] tracking-[0.14em] text-muted uppercase">Total histórico · líquido de devoluções</span>
            </div>
            {operators.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Ainda sem vendas registadas.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-[0.58rem] tracking-[0.12em] text-muted uppercase">
                      <th className="py-2 pr-3">Operador</th>
                      {multi && <th className="py-2 px-2">Loja</th>}
                      <th className="py-2 px-2 text-right">Movimentos</th>
                      <th className="py-2 px-2 text-right">Unidades</th>
                      <th className="py-2 pl-2 text-right">Valor vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operators.map((o) => (
                      <tr key={`${o.boutique}-${o.initials}`} className="border-b border-line/60">
                        <td className="py-2.5 pr-3 font-medium text-ink">{o.initials}</td>
                        {multi && <td className="py-2.5 px-2 text-[0.72rem] text-muted">{BOUTIQUE_LABEL[o.boutique]}</td>}
                        <td className="py-2.5 px-2 text-right tabular-nums text-muted">{o.movements}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-muted">{o.units}</td>
                        <td className="py-2.5 pl-2 text-right font-medium text-ink tabular-nums">{eur(o.grossCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-ink/20 text-[0.82rem]">
                      <td className="py-2.5 pr-3 font-semibold text-ink uppercase tracking-wide text-[0.6rem]">Total</td>
                      {multi && <td />}
                      <td className="py-2.5 px-2 text-right tabular-nums text-ink">{operatorsTotal.movements}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-ink">{operatorsTotal.units}</td>
                      <td className="py-2.5 pl-2 text-right font-semibold text-gold tabular-nums">{eur(operatorsTotal.grossCents)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>

          {/* Registration log — grouped by day; each row is one sale. */}
          <section className="mt-10">
            <h2 className="font-serif text-lg text-ink">Registo de vendas</h2>
            {days.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Ainda sem vendas registadas este mês.</p>
            ) : (
              <div className="mt-4 space-y-7">
                {days.map((d) => (
                  <div key={d.key}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="overline text-[0.58rem] text-gold">{d.label}</p>
                      <a
                        href={`/api/admin/reports/export?date=${d.key}${exportQs}`}
                        download
                        className="shrink-0 text-[0.62rem] tracking-[0.14em] text-muted uppercase transition-colors hover:text-gold"
                      >
                        Exportar Excel ↓
                      </a>
                    </div>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[44rem] border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-line text-left text-[0.58rem] tracking-[0.12em] text-muted uppercase">
                            <th className="py-2 pr-3">Hora</th>
                            <th className="py-2 px-2">Operador</th>
                            {multi && <th className="py-2 px-2">Loja</th>}
                            <th className="py-2 px-2">Registado</th>
                            <th className="py-2 px-2 text-right">Bruto</th>
                            <th className="py-2 px-2 text-right">Líquido</th>
                            {showCommission && <th className="py-2 px-2 text-right">Com. ECI</th>}
                            <th className="py-2 pl-2 text-right"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.rows.map((r) => {
                            const sign = r.type === "DEVOLUCAO" ? -1 : 1;
                            const what = r.items.map((i) => `${i.quantity}× ${i.desc}`).join(" · ");
                            return (
                              <tr key={r.id} className="border-b border-line/60 align-top">
                                <td className="py-2.5 pr-3 tabular-nums whitespace-nowrap">{hhmm(r.soldAt)}</td>
                                <td className="py-2.5 px-2 font-medium text-ink whitespace-nowrap">{r.operator}</td>
                                {multi && <td className="py-2.5 px-2 text-[0.72rem] text-muted whitespace-nowrap">{r.boutique}</td>}
                                <td className="py-2.5 px-2 text-[0.8rem] text-muted">
                                  {r.type === "DEVOLUCAO" && (
                                    <span className="mr-1.5 rounded-sm bg-[#b94a3a]/10 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide text-[#b94a3a] uppercase">Devolução</span>
                                  )}
                                  {r.type === "REPARACAO" && (
                                    <span className="mr-1.5 rounded-sm bg-gold/15 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide text-[#7e5e00] uppercase">Reparação</span>
                                  )}
                                  {what}
                                  {r.note && (
                                    <span className="ml-1 text-[0.7rem] italic text-muted">— {r.note}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 text-right tabular-nums whitespace-nowrap">{eur(sign * r.grossCents)}</td>
                                <td className="py-2.5 px-2 text-right tabular-nums whitespace-nowrap text-muted">{eur(sign * r.netCents)}</td>
                                {showCommission && (
                                  <td className="py-2.5 px-2 text-right tabular-nums whitespace-nowrap text-muted">− {eur(r.eciCommissionCents)}</td>
                                )}
                                <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                                  <VoidSaleButton
                                    saleId={r.id}
                                    label={`${hhmm(r.soldAt)} · ${r.operator} · ${eur(sign * r.grossCents)}`}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Best-sellers — independent vertical rail on the right. */}
        <aside className="w-full shrink-0 xl:sticky xl:top-6 xl:w-64">
          <div className="border border-line bg-paper p-5">
            <h2 className="font-serif text-base text-ink">Mais vendidos</h2>
            <p className="mt-1 text-[0.65rem] text-muted">
              {periodLabel}
              {multi ? "" : ` · ${BOUTIQUE_LABEL[boutiques[0]]}`}
            </p>
            {best.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Ainda sem vendas.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {best.map((b, i) => (
                  <li key={b.sku} className="flex items-start gap-3">
                    <span className="mt-0.5 font-serif text-sm text-gold tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.82rem] font-medium text-ink">{b.desc || b.sku}</span>
                      <span className="mt-0.5 block text-[0.7rem] text-muted tabular-nums">{b.units}× · {eur(b.grossCents)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
