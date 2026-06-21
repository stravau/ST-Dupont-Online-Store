import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 80;

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; entityId?: string; userId?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: {
    entityType?: string;
    entityId?: string;
    userId?: string;
  } = {};
  if (sp.entityType)  where.entityType = sp.entityType;
  if (sp.entityId)    where.entityId   = sp.entityId;
  if (sp.userId)      where.userId     = sp.userId;

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

  return (
    <div className="space-y-6">
      <header>
        <p className="overline text-gold">Auditoria</p>
        <h1 className="mt-2 font-serif text-3xl">Histórico de escritas</h1>
        <p className="mt-2 text-sm text-muted">
          {total.toLocaleString("pt-PT")} acções · página {page} / {totalPages}
        </p>
      </header>

      <form method="get" className="flex flex-wrap items-end gap-3 border border-line bg-paper p-4">
        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Tipo</span>
          <select name="entityType" defaultValue={sp.entityType ?? ""} className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Todos</option>
            <option value="VARIANT">VARIANT</option>
            <option value="PROMO">PROMO</option>
            <option value="PRODUCT">PRODUCT</option>
            <option value="UPLOAD_BATCH">UPLOAD_BATCH</option>
          </select>
        </label>
        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">ID</span>
          <input name="entityId" defaultValue={sp.entityId ?? ""} placeholder="sku ou slug" className="w-48 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold" />
        </label>
        <button type="submit" className="bg-ink px-5 py-2.5 text-xs tracking-[0.2em] text-cream uppercase hover:bg-gold hover:text-ink">Filtrar</button>
      </form>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="min-w-full text-sm">
          <thead className="bg-cream/60 text-[0.6rem] tracking-[0.16em] text-muted uppercase">
            <tr>
              <th className="px-3 py-3 text-left">Quando</th>
              <th className="px-3 py-3 text-left">Tipo</th>
              <th className="px-3 py-3 text-left">Acção</th>
              <th className="px-3 py-3 text-left">Entidade</th>
              <th className="px-3 py-3 text-left">Antes → Depois</th>
              <th className="px-3 py-3 text-left">Nota</th>
              <th className="px-3 py-3 text-left">Por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-12 text-center text-muted">Sem actividade.</td></tr>}
            {rows.map((a) => {
              const before = a.before ? JSON.stringify(a.before) : "";
              const after  = a.after  ? JSON.stringify(a.after)  : "";
              const diff   = before || after ? `${before} → ${after}` : "—";
              return (
                <tr key={a.id}>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted tabular-nums">
                    {a.createdAt.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "medium" })}
                  </td>
                  <td className="px-3 py-2 font-mono text-[0.65rem] tracking-wide">{a.entityType}</td>
                  <td className="px-3 py-2 text-[0.65rem] tracking-[0.18em] text-gold uppercase">{a.action}</td>
                  <td className="px-3 py-2 font-mono text-[0.65rem]">{a.entityId ?? "—"}</td>
                  <td className="max-w-[36ch] truncate px-3 py-2 font-mono text-[0.65rem] text-muted" title={diff}>{diff}</td>
                  <td className="px-3 py-2 text-xs">{a.note ?? ""}</td>
                  <td className="px-3 py-2 text-xs text-muted">{a.user?.email ?? "system"}</td>
                </tr>
              );
            })}
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
