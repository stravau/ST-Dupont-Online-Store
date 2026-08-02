"use client";

import { useState } from "react";
import type { Heatmap } from "@/lib/dashboard-data";

// Heatmap 8 semanas × 7 dias com tabs Geral · Lisboa · V.N. Gaia. Cliente
// porque tem state (scope activo). Cada scope recebe o seu próprio Heatmap
// pré-computado pelo server (getHeatmap por boutique).

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const eur = (c: number) =>
  (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

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

export type HeatmapScope = "all" | "LIS" | "VNG";

const TABS: { key: HeatmapScope; label: string }[] = [
  { key: "all", label: "Geral" },
  { key: "LIS", label: "Lisboa" },
  { key: "VNG", label: "V.N. Gaia" },
];

export function SalesHeatmap({ perScope }: { perScope: Record<HeatmapScope, Heatmap> }) {
  const [scope, setScope] = useState<HeatmapScope>("all");
  const data = perScope[scope];

  const cellWidth = 68;
  const cellHeight = 20;
  const cellGap = 3;
  const labelWidth = 38;
  const totalWidth = labelWidth + 7 * (cellWidth + cellGap);
  const totalHeight = data.weeks * (cellHeight + cellGap) + 14;

  return (
    <section className="card-in flex h-full flex-col border border-line bg-paper p-6">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-serif text-xl text-ink">Ritmo semanal</h2>
        <div className="flex gap-1">
          {TABS.map((t) => {
            const active = scope === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setScope(t.key)}
                className={`border px-2.5 py-1 text-[0.6rem] tracking-[0.12em] uppercase transition-colors ${
                  active
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line text-muted hover:border-gold/50 hover:text-ink"
                }`}
                aria-pressed={active}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          role="img"
          aria-label={`Mapa de calor de vendas — ${TABS.find((t) => t.key === scope)?.label}`}
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
          <text x={0} y={14 + cellHeight} fontSize={8} fill="var(--muted)">
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
