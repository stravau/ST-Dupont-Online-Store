import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/admin/empty-state";
import { IconList, IconUpload, IconChevronRight } from "@/components/admin/icons";
import { AdminHero } from "@/components/admin/admin-hero";
import { BigKPIs } from "@/components/admin/big-kpis";
import { BoutiqueSplitHero } from "@/components/admin/boutique-split-hero";
import { LiveTicker } from "@/components/admin/live-ticker";
import { SalesTrend } from "@/components/admin/dashboard-widgets";
import { SalesHeatmap } from "@/components/admin/sales-heatmap";
import { TopOperatorsBar } from "@/components/admin/top-operators-bar";
import {
  getDashboardSnapshot,
  getTickerRows,
  getHeatmap,
  getTopOperatorsPerBoutique,
} from "@/lib/dashboard-data";
import { dailySalesSeries, dayWindow } from "@/lib/pos-reports";
import type { BoutiqueCode } from "@/lib/pos";

export const dynamic = "force-dynamic";

// /admin — dashboard executivo do patrão. Banda escura no topo com
// AdminHero, contendo os BigKPIs (hoje + mês, com deltas vs mês
// anterior) e BoutiqueSplit (LIS vs VNG). Corpo em cream mantém
// SalesTrend 30d e as jump cards + últimas alterações.
//
// LOJA_* nunca chega aqui — são redirected para /admin/pos.
export default async function AdminHome() {
  const staff = await currentStaff();
  if (staff?.role !== "ADMIN") redirect("/admin/pos");

  const me = staff.email
    ? await prisma.user.findUnique({ where: { email: staff.email }, select: { name: true } })
    : null;
  const firstName = me?.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Bem-vindo, ${firstName}!` : "Bem-vindo!";

  const now = new Date();
  const today = dayWindow(now);
  const trendFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
  const BOTH: BoutiqueCode[] = ["LIS", "VNG"];

  const [snapshot, trend, ticker, heatmap, topOps, recentActions] = await Promise.all([
    getDashboardSnapshot(BOTH, now),
    dailySalesSeries(BOTH, trendFrom, today.to),
    getTickerRows(BOTH, 10),
    getHeatmap(BOTH, 8, now),
    getTopOperatorsPerBoutique(BOTH, 3, now),
    prisma.adminAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      {/* Banda escura executiva — a coisa que o patrão vê primeiro. */}
      <AdminHero
        eyebrow="Painel"
        title={greeting}
        subtitle="Vendas ao vivo, tendência dos últimos 30 dias e últimas alterações."
      >
        <BigKPIs today={snapshot.today} month={snapshot.month} monthName={snapshot.monthName} />
        <BoutiqueSplitHero boutiques={snapshot.boutiques} />
        <LiveTicker initial={ticker} boutiques={BOTH} />
      </AdminHero>

      {/* Tendência 30 dias + Heatmap 8 semanas lado a lado — dois ângulos do
          mesmo dado. O bar chart mostra volume ao longo do tempo; o heatmap
          revela padrões por dia da semana. Grid empilha em mobile. */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card-in min-w-0">
          <SalesTrend points={trend} />
        </div>
        <div className="min-w-0">
          <SalesHeatmap data={heatmap} />
        </div>
      </div>

      {/* Top operadores por boutique — só ADMIN vê (LOJA_* têm a tabela
          completa em /admin/relatorios que já é mais informativa). */}
      <TopOperatorsBar perBoutique={topOps} monthName={snapshot.monthName} />

      {/* Jump cards — atalhos para as duas acções mais usadas. */}
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

      {/* Últimas alterações — vai ganhar timeline com ícones na tranche D. */}
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

function JumpCard({ href, eyebrow, title, body, Icon }: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  Icon: (p: { className?: string }) => React.ReactElement;
}) {
  return (
    <Link href={href} className="group card-in flex items-start justify-between gap-5 border border-line bg-paper p-7 transition-colors hover:border-gold">
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
