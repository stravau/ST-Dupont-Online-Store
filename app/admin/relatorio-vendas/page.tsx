import { currentStaff } from "@/lib/admin-auth";
import { PageHeader } from "@/components/admin/page-header";
import { ReportDatePicker } from "@/components/admin/report-date-picker";
import { salesByStore, salesLog, rangeWindow } from "@/lib/pos-reports";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

function boutiquesForRole(role: string | null): BoutiqueCode[] {
  if (role === "LOJA_LIS") return ["LIS"];
  if (role === "LOJA_VNG") return ["VNG"];
  return ["LIS", "VNG"];
}

const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = { LIS: "Lisboa", VNG: "V. N. de Gaia" };
const eur = (c: number) => (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
const hhmm = (d: Date) => d.toLocaleTimeString("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" });
const ymdOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const isYmd = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; date?: string }>;
}) {
  const { from: fromParam, to: toParam, date: legacyDate } = await searchParams;
  const staff = await currentStaff();
  const boutiques = boutiquesForRole(staff?.role ?? null);
  const multi = boutiques.length > 1;
  // Only the boss (ADMIN) sees the ECI concession. Store logins get the
  // report + registo but never the commission line — that's a contract
  // between the Maison and the boss, not something the boutique needs.
  const showCommission = staff?.role === "ADMIN";

  const now = new Date();
  // Prefer new ?from=&to= params; fall back to the legacy ?date= for
  // bookmarks that landed on the old single-day URL.
  const fromYmd = isYmd(fromParam) ? fromParam : isYmd(legacyDate) ? legacyDate : ymdOf(now);
  const toYmd = isYmd(toParam) ? toParam : fromYmd;
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const fromDate = new Date(fy, fm - 1, fd);
  const toDate = new Date(ty, tm - 1, td);
  const { from, to } = rangeWindow(fromDate, toDate);
  const sameDay = fromYmd === toYmd;

  const [stores, log] = await Promise.all([
    salesByStore(boutiques, from, to),
    salesLog(boutiques, from, to, 2000),
  ]);

  const combined = stores.reduce(
    (a, s) => ({
      grossCents: a.grossCents + s.grossCents,
      netCents: a.netCents + s.netCents,
      eciCommissionCents: a.eciCommissionCents + s.eciCommissionCents,
      sales: a.sales + s.sales,
      returns: a.returns + s.returns,
    }),
    { grossCents: 0, netCents: 0, eciCommissionCents: 0, sales: 0, returns: 0 },
  );

  const rangeLabel = sameDay
    ? fromDate.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : `${fromDate.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })} → ${toDate.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}`;

  // Per-boutique commission label — LIS 22%, VNG 19%. Boss combined
  // row skips the pct chip because the two rates differ.
  const pctLabel: Record<BoutiqueCode, string> = { LIS: "22%", VNG: "19%" };

  return (
    <div>
      <PageHeader
        eyebrow="Operações"
        title="Relatório de Vendas"
        subtitle="Escolhe um intervalo de datas para ver o resumo e exportar o registo em Excel (mesmo formato e fórmulas do controlo ECI)."
      />

      <div className="mt-6">
        <ReportDatePicker from={fromYmd} to={toYmd} />
      </div>

      <p className="mt-8 font-serif text-xl text-ink capitalize">{rangeLabel}</p>

      {/* Summary — per store + combined for the boss. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((s) => (
          <div key={s.boutique} className="border border-line border-l-[3px] border-l-gold bg-paper p-5">
            <p className="overline text-[0.55rem] text-muted">{BOUTIQUE_LABEL[s.boutique]}</p>
            <p className="mt-3 font-serif text-3xl text-ink tabular-nums">{eur(s.grossCents)}</p>
            <dl className="mt-3 space-y-1 text-[0.72rem] text-muted">
              <div className="flex justify-between"><dt>Líquido s/ IVA</dt><dd className="tabular-nums">{eur(s.netCents)}</dd></div>
              {showCommission && (
                <div className="flex justify-between"><dt>Comissão ECI ({pctLabel[s.boutique]})</dt><dd className="tabular-nums">− {eur(s.eciCommissionCents)}</dd></div>
              )}
              <div className="flex justify-between"><dt>Vendas · Devoluções</dt><dd className="tabular-nums">{s.sales} · {s.returns}</dd></div>
            </dl>
          </div>
        ))}
        {multi && (
          <div className="border border-line border-l-[3px] border-l-ink bg-ink/[0.03] p-5">
            <p className="overline text-[0.55rem] text-gold">Total do período · as duas lojas</p>
            <p className="mt-3 font-serif text-3xl text-ink tabular-nums">{eur(combined.grossCents)}</p>
            <dl className="mt-3 space-y-1 text-[0.72rem] text-muted">
              <div className="flex justify-between"><dt>Líquido s/ IVA</dt><dd className="tabular-nums">{eur(combined.netCents)}</dd></div>
              {showCommission && (
                <div className="flex justify-between"><dt>Comissão ECI</dt><dd className="tabular-nums">− {eur(combined.eciCommissionCents)}</dd></div>
              )}
              <div className="flex justify-between"><dt>Vendas · Devoluções</dt><dd className="tabular-nums">{combined.sales} · {combined.returns}</dd></div>
            </dl>
          </div>
        )}
      </div>

      {/* The window's register — a preview of what the Excel export contains. */}
      <section className="mt-8">
        <h2 className="font-serif text-lg text-ink">Registo</h2>
        {log.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Sem vendas registadas neste intervalo.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[0.58rem] tracking-[0.12em] text-muted uppercase">
                  {!sameDay && <th className="py-2 pr-3">Data</th>}
                  <th className="py-2 pr-3">Hora</th>
                  <th className="py-2 px-2">Operador</th>
                  {multi && <th className="py-2 px-2">Loja</th>}
                  <th className="py-2 px-2">Registado</th>
                  <th className="py-2 px-2 text-right">Bruto</th>
                  <th className="py-2 px-2 text-right">Líquido</th>
                  {showCommission && <th className="py-2 pl-2 text-right">Com. ECI</th>}
                </tr>
              </thead>
              <tbody>
                {log.map((r) => {
                  const sign = r.type === "DEVOLUCAO" ? -1 : 1;
                  const what = r.items.map((i) => `${i.quantity}× ${i.desc}`).join(" · ");
                  return (
                    <tr key={r.id} className="border-b border-line/60 align-top">
                      {!sameDay && <td className="py-2.5 pr-3 tabular-nums whitespace-nowrap text-[0.72rem] text-muted">{ymdOf(r.soldAt)}</td>}
                      <td className="py-2.5 pr-3 tabular-nums whitespace-nowrap">{hhmm(r.soldAt)}</td>
                      <td className="py-2.5 px-2 font-medium text-ink whitespace-nowrap">{r.operator}</td>
                      {multi && <td className="py-2.5 px-2 text-[0.72rem] text-muted whitespace-nowrap">{r.boutique}</td>}
                      <td className="py-2.5 px-2 text-[0.8rem] text-muted">
                        {r.type === "DEVOLUCAO" && (
                          <span className="mr-1.5 rounded-sm bg-[#b94a3a]/10 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wide text-[#b94a3a] uppercase">Devolução</span>
                        )}
                        {what}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums whitespace-nowrap">{eur(sign * r.grossCents)}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums whitespace-nowrap text-muted">{eur(sign * r.netCents)}</td>
                      {showCommission && (
                        <td className="py-2.5 pl-2 text-right tabular-nums whitespace-nowrap text-muted">− {eur(r.eciCommissionCents)}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
