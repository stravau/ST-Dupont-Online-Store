import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { IconList, IconUpload, IconChevronRight } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

// Stat counts are aggregated server-side and only need to be fresh-ish —
// 60s of cache means a hot dashboard pull doesn't run 6 Postgres counts
// per refresh. `recentActions` lives outside the cache so the activity
// feed still shows new audit rows the moment they land.
const getDashboardStats = unstable_cache(
  async () => {
    const [variants, outOfStock, indisponiveis, descontinuados, orphans, withPromo] = await Promise.all([
      prisma.productVariant.count(),
      prisma.productVariant.count({ where: { stock: { lte: 0 } } }),
      prisma.productVariant.count({ where: { status: "INDISPONIVEL" } }),
      prisma.productVariant.count({ where: { status: "DESCONTINUADO" } }),
      prisma.product.count({ where: { slug: "unmapped-inventory" } }),
      prisma.productVariant.count({ where: { promoEndDate: { gte: new Date() } } }),
    ]);
    return { variants, outOfStock, indisponiveis, descontinuados, orphans, withPromo };
  },
  ["admin-dashboard-stats-v1"],
  { revalidate: 60 },
);

function StatTile({ label, value, hint, intent = "default" }: { label: string; value: string | number; hint?: string; intent?: "default" | "warning" | "danger" }) {
  const accent =
    intent === "warning" ? "border-l-[3px] border-l-[#d4a017]" :
    intent === "danger"  ? "border-l-[3px] border-l-[#b94a3a]" :
                            "border-l-[3px] border-l-gold";
  return (
    <div className={`border border-line bg-paper ${accent} p-5`}>
      <p className="overline text-[0.55rem] text-muted">{label}</p>
      <p className="mt-3 font-serif text-3xl text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[0.65rem] text-muted">{hint}</p>}
    </div>
  );
}

function JumpCard({ href, eyebrow, title, body, Icon }: { href: string; eyebrow: string; title: string; body: string; Icon: (p: { className?: string }) => React.ReactElement }) {
  return (
    <Link href={href} className="group flex items-start justify-between gap-5 border border-line bg-paper p-7 transition-colors hover:border-gold">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center border border-line text-gold transition-colors group-hover:border-gold group-hover:bg-gold/10">
            <Icon className="h-4 w-4" />
          </span>
          <p className="overline text-[0.55rem] text-gold">{eyebrow}</p>
        </div>
        <h2 className="mt-4 font-serif text-2xl text-ink">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      </div>
      <IconChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-gold" />
    </Link>
  );
}

export default async function AdminHome() {
  const [stats, recentActions] = await Promise.all([
    getDashboardStats(),
    prisma.adminAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
  ]);
  const { variants, outOfStock, indisponiveis, descontinuados, orphans, withPromo } = stats;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Painel"
        title="Resumo da Maison"
        subtitle="KPIs ao vivo e atalhos para as operações que mais usas."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Artigos"        value={variants.toLocaleString("pt-PT")} />
        <StatTile label="Stock = 0"      value={outOfStock.toLocaleString("pt-PT")}      hint="esgotados" intent={outOfStock > 0 ? "warning" : "default"} />
        <StatTile label="Indisponíveis"  value={indisponiveis.toLocaleString("pt-PT")}   hint="visíveis com badge" intent={indisponiveis > 0 ? "warning" : "default"} />
        <StatTile label="Descontinuados" value={descontinuados.toLocaleString("pt-PT")}  hint="ocultos do site" />
        <StatTile label="Em promoção"    value={withPromo.toLocaleString("pt-PT")}       hint="janela activa" />
        <StatTile label="Lotes não mapeados" value={orphans.toLocaleString("pt-PT")} hint="placeholder" />
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <JumpCard
          href="/admin/variants"
          eyebrow="Artigos"
          title="Lista editável"
          body="Pesquisa, filtra e edita em direto EAN, REF, PVP, status, stock e imagens por variant."
          Icon={IconList}
        />
        <JumpCard
          href="/admin/uploads"
          eyebrow="Uploads"
          title="Excel batch"
          body="PVP · Promoções · Stock · Novos artigos. Aplica directamente na DB com trilho de auditoria."
          Icon={IconUpload}
        />
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="font-serif text-xl text-ink">Últimas alterações</h2>
          <Link href="/admin/audit" className="text-[0.6rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold">
            Ver tudo →
          </Link>
        </div>
        <div className="border border-line border-t-0 bg-paper">
          {recentActions.length === 0 ? (
            <EmptyState
              icon="✦"
              title="Sem actividade ainda"
              body="As edições no painel e os uploads aparecem aqui em tempo real."
            />
          ) : (
            <ul className="divide-y divide-line/70">
              {recentActions.map((a) => (
                <li key={a.id} className="grid grid-cols-[auto_auto_1fr_auto] items-baseline gap-4 px-5 py-3 text-sm">
                  <time className="text-xs text-muted tabular-nums">
                    {a.createdAt.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
                  </time>
                  <span className="text-[0.6rem] tracking-[0.18em] text-gold uppercase">{a.action}</span>
                  <span className="truncate text-xs text-ink">
                    <span className="font-mono text-muted">{a.entityType}</span>
                    {a.entityId ? <> · <span className="font-mono">{a.entityId}</span></> : null}
                    {a.note ? <span className="text-muted"> · {a.note}</span> : null}
                  </span>
                  <span className="text-[0.65rem] text-muted">{a.user?.email ?? "system"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
