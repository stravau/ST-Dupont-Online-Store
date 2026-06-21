import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;

type Snapshot = Record<string, unknown> | null;

// Pretty-print a single field value depending on its key. Currency
// fields land as € amounts, stocks as plain ints, status as the same
// pill the rest of the panel uses, dates as a short stamp. Everything
// else falls back to a JSON-ish string.
function formatValue(key: string, v: unknown): string {
  if (v === null || v === undefined) return "—";
  const k = key.toLowerCase();
  if (k.includes("price") || k.includes("cents")) {
    if (typeof v === "number") return `€${(v / 100).toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (k.includes("date")) {
    const d = new Date(String(v));
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
  }
  if (k === "images" && Array.isArray(v)) return `${v.length} imagens`;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

const STATUS_TONE: Record<string, string> = {
  DISPONIVEL: "bg-[#2bb673]/10 text-[#1f7a4d]",
  INDISPONIVEL: "bg-[#d4a017]/10 text-[#7e5e00]",
  DESCONTINUADO: "bg-[#8b95a6]/15 text-[#4a5466]",
};

function renderField(key: string, value: unknown) {
  if (typeof value === "string" && value in STATUS_TONE) {
    return <span className={`inline-block px-2 py-0.5 text-[0.6rem] tracking-[0.14em] uppercase ${STATUS_TONE[value]}`}>{value}</span>;
  }
  return <span className="font-mono text-[0.7rem] tabular-nums text-ink">{formatValue(key, value)}</span>;
}

// Builds a unified diff list from before / after snapshots — pairs each
// changed key, drops noisy "no-change" entries. When only one side is
// present (CREATE / DELETE), the missing side renders as a dash.
function buildDiff(before: Snapshot, after: Snapshot): { key: string; before: unknown; after: unknown }[] {
  const out: { key: string; before: unknown; after: unknown }[] = [];
  const keys = new Set<string>();
  if (before) for (const k of Object.keys(before)) keys.add(k);
  if (after)  for (const k of Object.keys(after))  keys.add(k);
  for (const k of keys) {
    const b = before?.[k];
    const a = after?.[k];
    if (JSON.stringify(b) === JSON.stringify(a)) continue;
    out.push({ key: k, before: b, after: a });
  }
  return out;
}

function relativeTime(d: Date, now: Date): string {
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60)    return "agora";
  if (diff < 3600)  return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return "ontem";
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; entityId?: string; action?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: { entityType?: string; entityId?: string; action?: string } = {};
  if (sp.entityType) where.entityType = sp.entityType;
  if (sp.entityId)   where.entityId   = sp.entityId;
  if (sp.action)     where.action     = sp.action;

  const [total, rows] = await Promise.all([
    prisma.adminAction.count({ where }),
    prisma.adminAction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { email: true } } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = sp.entityType || sp.entityId || sp.action;

  // Group rows by calendar day so the timeline reads in stages.
  type Group = { day: string; label: string; items: typeof rows };
  const groups: Group[] = [];
  for (const r of rows) {
    const day = r.createdAt.toISOString().slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(r);
    else groups.push({ day, label: r.createdAt.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }), items: [r] });
  }

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (sp.entityType) params.set("entityType", sp.entityType);
    if (sp.entityId)   params.set("entityId",   sp.entityId);
    if (sp.action)     params.set("action",     sp.action);
    if (target > 1)    params.set("page",       String(target));
    const qs = params.toString();
    return `/admin/audit${qs ? `?${qs}` : ""}`;
  }

  const now = new Date();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sistema"
        title="Auditoria"
        subtitle={`${total.toLocaleString("pt-PT")} acções registadas${totalPages > 1 ? ` · página ${page} de ${totalPages}` : ""}.`}
      />

      <form method="get" className="grid items-end gap-3 border border-line bg-paper p-5 sm:grid-cols-4">
        <label className="block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">Tipo</span>
          <select name="entityType" defaultValue={sp.entityType ?? ""} className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todos</option>
            <option value="VARIANT">Variants</option>
            <option value="PROMO">Promoções</option>
            <option value="PRODUCT">Produtos</option>
            <option value="UPLOAD_BATCH">Uploads</option>
          </select>
        </label>
        <label className="block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">Acção</span>
          <select name="action" defaultValue={sp.action ?? ""} className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todas</option>
            <option value="UPDATE">UPDATE</option>
            <option value="CREATE">CREATE</option>
            <option value="DELETE">DELETE</option>
            <option value="UPLOAD">UPLOAD</option>
          </select>
        </label>
        <label className="block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">ID (sku ou slug)</span>
          <input name="entityId" defaultValue={sp.entityId ?? ""} placeholder="STD000430, popote…" className="w-full border border-line bg-paper px-3 py-2 font-mono text-xs outline-none focus:border-gold" />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="bg-ink px-5 py-2 text-xs tracking-[0.2em] text-cream uppercase hover:bg-gold hover:text-ink">Filtrar</button>
          {hasFilters && <Link href="/admin/audit" className="text-[0.65rem] tracking-[0.18em] text-muted uppercase hover:text-gold">Limpar</Link>}
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="border border-line bg-paper">
          <EmptyState title="Sem actividade" body="Edições e uploads aparecem aqui em tempo real." />
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.day}>
              <h2 className="mb-3 border-b border-line pb-2 text-[0.65rem] tracking-[0.18em] text-muted uppercase">
                {g.label}
              </h2>

              <ol className="space-y-px">
                {g.items.map((a) => {
                  const before = (a.before as Snapshot) ?? null;
                  const after  = (a.after  as Snapshot) ?? null;
                  const diff   = buildDiff(before, after);

                  const actionTone =
                    a.action === "UPDATE" ? "text-gold border-gold/40 bg-gold/5" :
                    a.action === "CREATE" ? "text-[#1f7a4d] border-[#2bb673]/40 bg-[#2bb673]/5" :
                    a.action === "DELETE" ? "text-[#b94a3a] border-red-300 bg-red-50" :
                                             "text-[#7e5e00] border-[#d4a017]/40 bg-[#d4a017]/10";

                  // Variants + promos get a deep-link to the variants list
                  // filtered by the sku, so the admin can jump to edit.
                  const idHref =
                    (a.entityType === "VARIANT" || a.entityType === "PROMO") && a.entityId
                      ? `/admin/variants?q=${encodeURIComponent(a.entityId)}`
                      : null;

                  return (
                    <li key={a.id} className="border-l-[3px] border-l-gold/30 bg-paper hover:border-l-gold">
                      <article className="grid gap-3 px-5 py-4 sm:grid-cols-[10rem_1fr_auto] sm:items-start sm:gap-6">
                        {/* When */}
                        <div className="text-xs text-muted">
                          <p className="text-ink tabular-nums">
                            {a.createdAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="mt-0.5 text-[0.65rem] tracking-wide">{relativeTime(a.createdAt, now)}</p>
                        </div>

                        {/* What */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={`inline-block border px-2 py-0.5 text-[0.6rem] tracking-[0.16em] uppercase ${actionTone}`}>
                              {a.action}
                            </span>
                            <span className="font-mono text-[0.65rem] text-muted">{a.entityType}</span>
                            {a.entityId && (
                              idHref ? (
                                <Link href={idHref} className="font-mono text-[0.7rem] text-ink underline-offset-2 hover:text-gold hover:underline">
                                  {a.entityId}
                                </Link>
                              ) : (
                                <span className="font-mono text-[0.7rem] text-ink">{a.entityId}</span>
                              )
                            )}
                          </div>

                          {/* Diff lines — only when there's a structured before/after */}
                          {diff.length > 0 && (
                            <ul className="mt-3 space-y-1 text-xs">
                              {diff.map((d) => (
                                <li key={d.key} className="grid grid-cols-[8rem_1fr] gap-3 sm:grid-cols-[10rem_1fr_auto_1fr]">
                                  <span className="overline text-[0.55rem] text-muted">{d.key}</span>
                                  <span className="break-words">{renderField(d.key, d.before)}</span>
                                  <span className="hidden text-muted sm:inline">→</span>
                                  <span className="break-words">{renderField(d.key, d.after)}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Note — surfaced when there's no structured diff
                              (UPLOAD_BATCH rows carry only a note) or as a
                              caption beneath the diff. */}
                          {a.note && (
                            <p className="mt-2 text-[0.7rem] text-muted">{a.note}</p>
                          )}
                        </div>

                        {/* Who */}
                        <div className="text-right text-[0.65rem] text-muted">
                          <p className="truncate" title={a.user?.email ?? "system"}>
                            {a.user?.email ?? "system"}
                          </p>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs">
          {page > 1 ? <Link href={pageHref(page - 1)} className="border border-line bg-paper px-3 py-2 tracking-[0.18em] uppercase hover:border-gold">← Anterior</Link> : <span />}
          <span className="text-muted">Página {page} de {totalPages}</span>
          {page < totalPages ? <Link href={pageHref(page + 1)} className="border border-line bg-paper px-3 py-2 tracking-[0.18em] uppercase hover:border-gold">Seguinte →</Link> : <span />}
        </div>
      )}
    </div>
  );
}
