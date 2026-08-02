import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { IconList, IconUpload, IconChevronRight } from "@/components/admin/icons";
import { AdminHero } from "@/components/admin/admin-hero";
import { DashboardScopeProvider, DashboardHeroScope, SalesTrendScope } from "@/components/admin/dashboard-scope";
import { SalesHeatmap } from "@/components/admin/sales-heatmap";
import { TopOperatorsBar } from "@/components/admin/top-operators-bar";
import {
  getDashboardSnapshot,
  getDashboardKpisPerScope,
  getTickerRows,
  getHeatmap,
  getTopOperatorsPerBoutique,
} from "@/lib/dashboard-data";
import { dailySalesSeriesPerScope, dayWindow } from "@/lib/pos-reports";
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

  const [snapshot, kpisPerScope, trendPerScope, ticker, heatmapAll, heatmapLIS, heatmapVNG, topOps] = await Promise.all([
    getDashboardSnapshot(BOTH, now),
    getDashboardKpisPerScope(BOTH, now),
    dailySalesSeriesPerScope(BOTH, trendFrom, today.to),
    getTickerRows(BOTH, 15), // fetch 15 per boutique, ticker shows 5 + expand
    getHeatmap(BOTH, 8, now),
    getHeatmap(["LIS"], 8, now),
    getHeatmap(["VNG"], 8, now),
    getTopOperatorsPerBoutique(BOTH, 3, now),
  ]);

  return (
    // O filtro de loja vive no hero mas comanda a página toda — por isso o
    // provider envolve tudo, e os cards de baixo não têm selector próprio.
    <DashboardScopeProvider>
    <div className="space-y-10">
      {/* Banda escura executiva — a coisa que o patrão vê primeiro. */}
      <AdminHero
        eyebrow="Painel"
        title={greeting}
        subtitle="Vendas ao vivo, tendência dos últimos 30 dias e ritmo semanal."
      >
        <DashboardHeroScope
          kpis={kpisPerScope}
          monthName={snapshot.monthName}
          ticker={ticker}
          boutiques={BOTH}
        />
      </AdminHero>

      {/* Tendência 30 dias + Heatmap 8 semanas lado a lado — dois ângulos do
          mesmo dado. O bar chart mostra volume ao longo do tempo; o heatmap
          revela padrões por dia da semana. Grid empilha em mobile. */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card-in min-w-0">
          <SalesTrendScope perScope={trendPerScope} />
        </div>
        <div className="min-w-0">
          <SalesHeatmap perScope={{ all: heatmapAll, LIS: heatmapLIS, VNG: heatmapVNG }} />
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
          body="Pesquisa, filtra e edita em direto EAN, REF, PVP, status, stock e imagens. Cria artigos novos por Excel."
          Icon={IconList}
        />
        <JumpCard
          href="/admin/uploads"
          eyebrow="Uploads"
          title="Sincronizar ECI"
          body="Stock, PVP, artigos e outras marcas de uma vez — com pré-visualização. Promoções à parte."
          Icon={IconUpload}
        />
      </section>
    </div>
    </DashboardScopeProvider>
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
