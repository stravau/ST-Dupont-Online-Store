import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Admin landing — quick KPIs + jump cards. Counts are lightweight
// queries; full reporting lives under /admin/audit once activity
// builds up.
export default async function AdminHome() {
  const [variants, outOfStock, indisponiveis, descontinuados, orphans, recentActions] = await Promise.all([
    prisma.productVariant.count(),
    prisma.productVariant.count({ where: { stock: { lte: 0 } } }),
    prisma.productVariant.count({ where: { status: "INDISPONIVEL" } }),
    prisma.productVariant.count({ where: { status: "DESCONTINUADO" } }),
    prisma.product.count({ where: { slug: "unmapped-inventory" } }),
    prisma.adminAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const stat = (label: string, value: string | number) => (
    <div className="border border-line bg-paper p-5">
      <p className="overline text-[0.55rem] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="overline text-gold">Painel</p>
        <h1 className="mt-3 font-serif text-4xl">Resumo da maison</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stat("Variants",          variants)}
        {stat("Stock = 0",         outOfStock)}
        {stat("Indisponíveis",     indisponiveis)}
        {stat("Descontinuados",    descontinuados)}
        {stat("Lotes não mapeados", orphans)}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Link href="/admin/variants" className="block border border-line bg-paper p-7 transition-colors hover:border-gold">
          <p className="overline text-gold">Artigos</p>
          <h2 className="mt-3 font-serif text-2xl">Lista editável</h2>
          <p className="mt-2 text-sm text-muted">
            Pesquisa, filtra e edita em direto os campos EAN, REF, PVP, status e stock.
          </p>
        </Link>
        <Link href="/admin/uploads" className="block border border-line bg-paper p-7 transition-colors hover:border-gold">
          <p className="overline text-gold">Uploads</p>
          <h2 className="mt-3 font-serif text-2xl">Excel batch</h2>
          <p className="mt-2 text-sm text-muted">
            PVP · Promoções · Stock · Novos artigos. Aplica direto na DB com audit trail.
          </p>
        </Link>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Últimas alterações</h2>
        <div className="mt-4 border border-line bg-paper">
          {recentActions.length === 0 ? (
            <p className="px-5 py-7 text-center text-sm text-muted">Sem actividade ainda.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentActions.map((a) => (
                <li key={a.id} className="grid grid-cols-[auto_auto_1fr_auto] items-baseline gap-4 px-5 py-3 text-sm">
                  <time className="text-xs text-muted tabular-nums">
                    {a.createdAt.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
                  </time>
                  <span className="text-[0.65rem] tracking-[0.18em] text-gold uppercase">{a.action}</span>
                  <span className="truncate text-ink">{a.entityType} · {a.entityId ?? "—"} {a.note ? `· ${a.note}` : ""}</span>
                  <span className="text-xs text-muted">{a.user?.email ?? "system"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
