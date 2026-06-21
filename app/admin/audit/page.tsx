import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 80;

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; entityId?: string; userId?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: { entityType?: string; entityId?: string; userId?: string } = {};
  if (sp.entityType) where.entityType = sp.entityType;
  if (sp.entityId)   where.entityId   = sp.entityId;
  if (sp.userId)     where.userId     = sp.userId;

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

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (sp.entityType) params.set("entityType", sp.entityType);
    if (sp.entityId)   params.set("entityId",   sp.entityId);
    if (sp.userId)     params.set("userId",     sp.userId);
    if (target > 1)    params.set("page",       String(target));
    const qs = params.toString();
    return `/admin/audit${qs ? `?${qs}` : ""}`;
  }

  const actionTone: Record<string, string> = {
    UPDATE: "text-gold",
    CREATE: "text-[#2bb673]",
    DELETE: "text-[#b94a3a]",
    UPLOAD: "text-[#7e5e00]",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sistema"
        title="Auditoria"
        subtitle={`${total.toLocaleString("pt-PT")} acções registadas${totalPages > 1 ? ` · página ${page} / ${totalPages}` : ""}.`}
      />

      <form method="get" className="grid items-end gap-3 border border-line bg-paper p-5 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">Tipo</span>
          <select name="entityType" defaultValue={sp.entityType ?? ""} className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todos</option>
            <option value="VARIANT">VARIANT</option>
            <option value="PROMO">PROMO</option>
            <option value="PRODUCT">PRODUCT</option>
            <option value="UPLOAD_BATCH">UPLOAD_BATCH</option>
          </select>
        </label>
        <label className="block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">ID (sku ou slug)</span>
          <input name="entityId" defaultValue={sp.entityId ?? ""} placeholder="STD000430, popote…" className="w-full border border-line bg-paper px-3 py-2 font-mono text-xs outline-none focus:border-gold" />
        </label>
        <button type="submit" className="bg-ink px-5 py-2 text-xs tracking-[0.2em] text-cream uppercase hover:bg-gold hover:text-ink">Filtrar</button>
      </form>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="min-w-full text-sm">
          <thead className="bg-cream/50 text-[0.6rem] tracking-[0.16em] text-muted uppercase">
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left font-medium">Quando</th>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-left font-medium">Acção</th>
              <th className="px-4 py-3 text-left font-medium">Entidade</th>
              <th className="px-4 py-3 text-left font-medium">Antes → Depois</th>
              <th className="px-4 py-3 text-left font-medium">Nota</th>
              <th className="px-4 py-3 text-left font-medium">Por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {rows.length === 0 ? (
              <tr><td colSpan={7}><EmptyState title="Sem actividade" body="Edições no painel e uploads aparecem aqui." /></td></tr>
            ) : (
              rows.map((a) => {
                const before = a.before ? JSON.stringify(a.before) : "";
                const after  = a.after  ? JSON.stringify(a.after)  : "";
                const diff   = before || after ? `${before}${before && after ? "  →  " : ""}${after}` : "—";
                return (
                  <tr key={a.id} className="hover:bg-cream/40">
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-muted tabular-nums">
                      {a.createdAt.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "medium" })}
                    </td>
                    <td className="px-4 py-2 font-mono text-[0.65rem] tracking-wide text-ink">{a.entityType}</td>
                    <td className={`px-4 py-2 text-[0.65rem] tracking-[0.18em] uppercase ${actionTone[a.action] ?? "text-muted"}`}>{a.action}</td>
                    <td className="px-4 py-2 font-mono text-[0.65rem] text-ink">{a.entityId ?? "—"}</td>
                    <td className="max-w-[36ch] truncate px-4 py-2 font-mono text-[0.65rem] text-muted" title={diff}>{diff}</td>
                    <td className="px-4 py-2 text-xs text-ink">{a.note ?? ""}</td>
                    <td className="px-4 py-2 text-[0.7rem] text-muted">{a.user?.email ?? "system"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
