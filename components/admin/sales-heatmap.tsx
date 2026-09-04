"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Heatmap } from "@/lib/dashboard-data";
import { useDashboardScope, type Scope } from "@/components/admin/dashboard-scope";
import { blocoValido, podeRecuar } from "@/lib/heatmap-blocos";

// Heatmap 8 semanas × 7 dias. Cada âmbito recebe o seu próprio Heatmap
// pré-computado pelo servidor; qual deles se mostra vem do filtro único do
// painel (o do hero), não de tabs próprias — ter dois selectores na mesma
// página para a mesma coisa era redundante.

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const eur = (c: number) =>
  (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

// A legenda que aparece ao passar o rato numa célula.
// O T12:00:00 não é enfeite: "2026-07-13" sozinho é lido como meia-noite UTC,
// e num fuso a oeste isso recua um dia — a célula de segunda dizia domingo.
function legenda(c: { date: string; grossCents: number }): string {
  const dia = new Date(`${c.date}T12:00:00`).toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return `${dia} · ${c.grossCents > 0 ? eur(c.grossCents) : "sem vendas"}`;
}

// Escala tipo semáforo — vermelho (baixo), amarelo (médio), verde (alto).
function cellColor(v: number, max: number): string {
  if (v <= 0 || max === 0) return "#e6e6ea";
  const ratio = v / max;
  if (ratio < 0.2) return "#e57373";
  if (ratio < 0.4) return "#f0a05a";
  if (ratio < 0.6) return "#f4d35e";
  if (ratio < 0.85) return "#8fc26f";
  return "#3f9455";
}

export function SalesHeatmap({ perScope }: { perScope: Record<Scope, Heatmap> }) {
  const { scope } = useDashboardScope();
  const data = perScope[scope];
  const search = useSearchParams();
  const ehJanelaActual = blocoValido(search.get("bloco") ?? undefined) === 0;

  const cellWidth = 68;
  const cellHeight = 20;
  const cellGap = 3;
  const labelWidth = 38;
  const totalWidth = labelWidth + 7 * (cellWidth + cellGap);
  const totalHeight = data.weeks * (cellHeight + cellGap) + 14;

  return (
    <section className="painel-card card-in flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
        <div className="min-w-0">
          <h2 className="text-[0.62rem] font-semibold tracking-[0.12em] text-gold uppercase">Ritmo semanal</h2>
          <p className="mt-1 text-[0.6rem] tracking-[0.18em] text-muted uppercase">
            {intervalo(data.fromDate, data.toDate)}
          </p>
        </div>
        <SetasBloco />
      </div>

      <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          role="img"
          aria-label="Mapa de calor de vendas por dia da semana"
          className="block max-h-full max-w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {WEEKDAYS.map((d, i) => (
            <text
              key={d}
              x={labelWidth + i * (cellWidth + cellGap) + cellWidth / 2}
              y={10}
              textAnchor="middle"
              fontSize={9}
              fill="var(--muted)"
              style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              {d}
            </text>
          ))}
          {data.cells.map((c) => (
            <rect
              key={`${c.weekIdx}-${c.dayIdx}`}
              x={labelWidth + c.dayIdx * (cellWidth + cellGap)}
              y={14 + c.weekIdx * (cellHeight + cellGap)}
              width={cellWidth}
              height={cellHeight}
              rx={4.5}
              fill={cellColor(c.grossCents, data.maxGross)}
              stroke={c.grossCents > 0 ? "transparent" : "var(--line)"}
              strokeWidth={0.5}
            >
              {/* Um só filho de texto, montado em cima. Com os três pedaços
                  separados, o servidor emitia <title></title> VAZIO em todas
                  as células — as legendas não existiam no HTML servido, só
                  apareciam depois da hidratação, e a diferença fazia o React
                  deitar fora e repintar o mapa inteiro no cliente a cada
                  carregamento do painel. */}
              <title>{legenda(c)}</title>
            </rect>
          ))}
          {/* As pontas da janela, pelas datas. Diziam "−7sem" e "hoje", o que
              era verdade enquanto o mapa acabava sempre no dia de hoje; com a
              janela a recuar, "hoje" numa janela de há seis meses era
              simplesmente mentira. A última linha só se marca a dourado
              quando estamos mesmo na janela actual. */}
          <text x={0} y={14 + cellHeight} fontSize={8} fill="var(--muted)">
            {curta(data.fromDate)}
          </text>
          <text
            x={0}
            y={totalHeight - 4}
            fontSize={8}
            fill={ehJanelaActual ? "var(--gold)" : "var(--muted)"}
          >
            {ehJanelaActual ? "hoje" : curta(data.toDate)}
          </text>
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.7rem] text-muted">
        <p className="italic">{data.insightText}</p>
        <div className="flex items-center gap-1.5">
          <span>menos</span>
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#e6e6ea" }} />
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#e57373" }} />
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#f0a05a" }} />
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#f4d35e" }} />
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#8fc26f" }} />
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: "#3f9455" }} />
          <span>mais</span>
        </div>
      </div>
    </section>
  );
}


// As setas, no canto do card. A janela é sempre de 8 semanas; estas mandam-na
// para trás e para a frente em saltos de 8, e é por isso que não há aqui
// nenhuma lista de durações: comparar o ritmo de uma semana só faz sentido
// contra janelas do mesmo tamanho.
function SetasBloco() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const bloco = blocoValido(search.get("bloco") ?? undefined);

  const ir = (destino: number) => {
    const q = new URLSearchParams(search.toString());
    // Preserva o resto — em especial o ?boutique=, o filtro de loja do
    // cabeçalho. Recuar no tempo não pode saltar de Lisboa para Geral.
    if (destino === 0) q.delete("bloco");
    else q.set("bloco", String(destino));
    const qs = q.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const btn =
    "flex h-6 w-6 items-center justify-center border border-line text-ink transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:border-line/50 disabled:text-muted/40 disabled:hover:border-line/50 disabled:hover:text-muted/40";

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => ir(bloco + 1)}
        disabled={!podeRecuar(bloco)}
        aria-label="Oito semanas anteriores"
        title="Oito semanas anteriores"
        className={btn}
      >
        <span aria-hidden>‹</span>
      </button>
      <button
        type="button"
        onClick={() => ir(bloco - 1)}
        // Nao ha frente nenhuma a partir da janela que acaba hoje.
        disabled={bloco === 0}
        aria-label="Oito semanas seguintes"
        title="Oito semanas seguintes"
        className={btn}
      >
        <span aria-hidden>›</span>
      </button>
    </div>
  );
}

// "13 jul – 6 set" — o intervalo que está no ecrã. Com a janela a deslocar-se,
// dizer só "últimas 8 semanas" passou a ser falso em tudo menos na primeira.
// O T12:00:00 não é enfeite: "2026-07-13" sozinho é lido como meia-noite UTC,
// e num fuso a oeste isso recua a data um dia.
// Abreviaturas à mão em vez de month:"short". Em pt-PT o "short" devolve o mês
// em NÚMERO — saía "13/07 – 6/09", com o zero à esquerda a aparecer num lado e
// no outro não. E tira daqui uma formatação dependente do locale, que é o que
// esteve a causar o desencontro de hidratação nas legendas das células.
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function curta(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)} ${MESES[Number(m) - 1]}`;
}

function intervalo(de: string, ate: string): string {
  return `${curta(de)} – ${curta(ate)}`;
}
