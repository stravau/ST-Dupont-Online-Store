import type { Heatmap } from "@/lib/dashboard-data";

// Heatmap 8 semanas × 7 dias — grelha estilo GitHub mas em tons dourados
// on-brand. Célula vazia = --line, escala de gold-soft → gold → gold-deep
// para intensidade crescente. Tooltip nativo por célula.

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const eur = (c: number) =>
  (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

// Escala tipo semáforo — vermelho (baixo), amarelo (médio), verde (alto).
// Convenção "mais vendas = melhor". Zero fica em cinza neutro para se
// distinguir claramente de "vendeu pouco".
function cellColor(v: number, max: number): string {
  if (v <= 0 || max === 0) return "#e6e6ea"; // neutro — sem vendas
  const ratio = v / max;
  if (ratio < 0.2) return "#e57373";  // vermelho suave — muito baixo
  if (ratio < 0.4) return "#f0a05a";  // laranja — baixo
  if (ratio < 0.6) return "#f4d35e";  // amarelo — médio
  if (ratio < 0.85) return "#8fc26f"; // verde claro — alto
  return "#3f9455";                    // verde forte — muito alto
}

export function SalesHeatmap({ data }: { data: Heatmap }) {
  // Coordenadas base do viewBox — proporções que o SVG mantém quando
  // esticado pelo container (preserveAspectRatio default = xMidYMid meet).
  // Sem cap de max-width, o heatmap enche a largura do card e as
  // células crescem proporcionalmente.
  const cellSize = 22;
  const cellGap = 3;
  const labelWidth = 34;
  const totalWidth = labelWidth + 7 * (cellSize + cellGap);
  const totalHeight = data.weeks * (cellSize + cellGap) + 14;

  return (
    <section className="card-in flex h-full flex-col border border-line bg-paper p-6">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <h2 className="font-serif text-xl text-ink">Ritmo semanal</h2>
        <span className="text-[0.6rem] tracking-[0.18em] text-muted uppercase">
          últimas {data.weeks} semanas
        </span>
      </div>

      {/* Card usa h-full para casar altura com o SalesTrend no grid. O SVG
          preenche a área central preservando aspect ratio — cells ficam
          centradas com pouca folga lateral, evitando o efeito cartoonish
          de esticar 7 cells por toda a largura. */}
      <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          role="img"
          aria-label="Mapa de calor de vendas por dia da semana"
          className="block max-h-full max-w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Header dos dias */}
          {WEEKDAYS.map((d, i) => (
            <text
              key={d}
              x={labelWidth + i * (cellSize + cellGap) + cellSize / 2}
              y={10}
              textAnchor="middle"
              fontSize={9}
              fill="var(--muted)"
              style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              {d}
            </text>
          ))}
          {/* Grid */}
          {data.cells.map((c) => (
            <rect
              key={`${c.weekIdx}-${c.dayIdx}`}
              x={labelWidth + c.dayIdx * (cellSize + cellGap)}
              y={14 + c.weekIdx * (cellSize + cellGap)}
              width={cellSize}
              height={cellSize}
              rx={3}
              fill={cellColor(c.grossCents, data.maxGross)}
              stroke={c.grossCents > 0 ? "transparent" : "var(--line)"}
              strokeWidth={0.5}
            >
              <title>
                {new Date(c.date).toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long" })}
                {" · "}
                {c.grossCents > 0 ? eur(c.grossCents) : "sem vendas"}
              </title>
            </rect>
          ))}
          {/* Label vertical: primeira semana (topo) + hoje (base) */}
          <text x={0} y={14 + cellSize} fontSize={8} fill="var(--muted)">
            {relLabel(data.weeks - 1)}
          </text>
          <text x={0} y={totalHeight - 4} fontSize={8} fill="var(--gold)">
            hoje
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

function relLabel(weeksAgo: number): string {
  if (weeksAgo === 0) return "esta sem.";
  return `−${weeksAgo}sem`;
}
