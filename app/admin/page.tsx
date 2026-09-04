import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { IconList, IconUpload, IconChevronRight } from "@/components/admin/icons";
import { DashboardScopeProvider, DashboardHeroScope, SalesTrendScope } from "@/components/admin/dashboard-scope";
import { SalesHeatmap } from "@/components/admin/sales-heatmap";
import { blocoValido, ancoraDoBloco, SEMANAS_BLOCO } from "@/lib/heatmap-blocos";
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
export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ bloco?: string }>;
}) {
  // Que janela de 8 semanas mostrar no mapa de calor. 0 e a que acaba hoje.
  // As regras vivem num modulo neutro partilhado com o widget: aqui valida-se
  // o URL, la desenham-se as setas, e nao podem divergir.
  const { bloco } = await searchParams;
  const blocoMapa = blocoValido(bloco);

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
  // Recuar a ancora e tudo o que e preciso para deslocar a janela: o mapa
  // continua a desenhar "as 8 semanas que acabam nesta data".
  const ancoraMapa = ancoraDoBloco(blocoMapa, now);

  const [snapshot, kpisPerScope, trendPerScope, ticker, heatmapAll, heatmapLIS, heatmapVNG, topOps] = await Promise.all([
    getDashboardSnapshot(BOTH, now),
    getDashboardKpisPerScope(BOTH, now),
    dailySalesSeriesPerScope(BOTH, trendFrom, today.to),
    getTickerRows(BOTH, 15), // fetch 15 per boutique, ticker shows 5 + expand
    getHeatmap(BOTH, SEMANAS_BLOCO, ancoraMapa),
    getHeatmap(["LIS"], SEMANAS_BLOCO, ancoraMapa),
    getHeatmap(["VNG"], SEMANAS_BLOCO, ancoraMapa),
    getTopOperatorsPerBoutique(BOTH, 3, now),
  ]);

  return (
    // O filtro de loja vive no hero mas comanda a página toda — por isso o
    // provider envolve tudo, e os cards de baixo não têm selector próprio.
    <DashboardScopeProvider>
    <div className="painel space-y-8">
      {/* Sem banda escura. O azul vive no cabeçalho e mais nada — aqui o título
          assenta no marfim como o resto da página.

          O AdminHero saiu daqui em vez de ser adaptado: as suas cores são para
          fundo escuro, e sobrepô-las com CSS seria remendo. As outras doze
          páginas continuam a usá-lo tal como está.

          É este o único serif do painel. Todos os outros títulos passam a
          sans — a serif deixa de ser decoração repetida e volta a marcar o que
          é o topo da página. */}
      {/* Cumprimento e KPI colados num bloco so. Estavam separados pelo mesmo
          vazio que separa seccoes independentes, e nao sao independentes: os
          numeros sao a continuacao da frase, nao o capitulo seguinte. O filete
          fecha o cabecalho e abre os dados. */}
      <section className="space-y-4">
        <header className="border-b border-line pb-4">
          <p className="text-[0.55rem] font-semibold tracking-[0.12em] text-gold uppercase">Painel</p>
          <h1 className="mt-1.5 font-serif text-3xl leading-tight text-ink md:text-4xl">{greeting}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Movimento comercial ao vivo, tendência dos últimos 30 dias e ritmo semanal.
          </p>
        </header>

        <DashboardHeroScope
          kpis={kpisPerScope}
          monthName={snapshot.monthName}
          ticker={ticker}
          boutiques={BOTH}
        />
      </section>

      {/* Tendência 30 dias + Heatmap 8 semanas lado a lado — dois ângulos do
          mesmo dado. O bar chart mostra volume ao longo do tempo; o heatmap
          revela padrões por dia da semana. Grid empilha em mobile. */}
      {/* O gráfico manda: 60/40 em vez de metade e metade. Num painel executivo
          a tendência é o que se lê primeiro; o mapa de calor é o complemento. */}
      <div className="grid gap-5 xl:grid-cols-[3fr_2fr]">
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
    <Link href={href} className="painel-card group card-in flex items-start justify-between gap-5 p-6 transition-shadow hover:shadow-[0_10px_34px_rgba(0,0,0,0.09)]">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors group-hover:text-gold">
            <Icon className="h-4 w-4" />
          </span>
          <p className="overline text-[0.55rem] text-gold">{eyebrow}</p>
        </div>
        <h2 className="mt-3 text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      </div>
      <IconChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-gold" />
    </Link>
  );
}
