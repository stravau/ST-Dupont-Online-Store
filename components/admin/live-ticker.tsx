"use client";

import { useEffect, useRef, useState } from "react";
import type { BoutiqueCode } from "@/lib/pos";
import type { TickerRow } from "@/lib/dashboard-data";

// LiveTicker — feed vertical das últimas N vendas, com poll silencioso
// ao /api/admin/dashboard-live a cada 30s. Quando entram vendas novas,
// aparecem no topo com um flash gold (.ticker-row-new).
//
// Para ADMIN, renderiza DUAS colunas lado a lado (LIS · VNG); para
// LOJA_*, uma coluna só com a sua boutique.
//
// Componente cliente porque precisa de setInterval + DOM refs.

const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = {
  LIS: "Lisboa",
  VNG: "V. N. de Gaia",
};

const eur = (c: number) =>
  (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `há ${Math.max(1, diff)}s`;
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

function typeBadge(type: "VENDA" | "DEVOLUCAO" | "REPARACAO") {
  if (type === "VENDA") return null;
  if (type === "DEVOLUCAO") {
    return (
      <span className="mr-1.5 border border-[#e29999]/40 bg-[#e29999]/10 px-1.5 py-0.5 text-[0.55rem] font-medium tracking-wide text-[#e29999] uppercase">
        Dev.
      </span>
    );
  }
  return (
    <span className="mr-1.5 border border-gold-soft/40 bg-gold-soft/10 px-1.5 py-0.5 text-[0.55rem] font-medium tracking-wide text-gold-soft uppercase">
      Rep.
    </span>
  );
}

function TickerColumn({
  boutique,
  rows,
  showLabel,
  newIds,
  initialVisible,
}: {
  boutique: BoutiqueCode;
  rows: TickerRow[];
  showLabel: boolean;
  newIds: Set<string>;
  initialVisible: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, initialVisible);
  const hiddenCount = Math.max(0, rows.length - initialVisible);

  return (
    <div>
      {showLabel && (
        <div className="mb-2 flex items-center gap-2">
          <span className="live-dot" />
          <p className="overline text-[0.55rem] text-gold-soft">
            {BOUTIQUE_LABEL[boutique]} · últimas {rows.length}
          </p>
        </div>
      )}
      {rows.length === 0 ? (
        <p className="text-[0.72rem] text-cream/40">Sem vendas ainda.</p>
      ) : (
        <>
          <ul className="space-y-1.5">
            {visible.map((r) => (
              <li
                key={r.id}
                className={`grid grid-cols-[auto_auto_1fr_auto] items-baseline gap-2 border-l border-transparent px-2 py-1 text-[0.72rem] transition-colors hover:border-l-gold/40 ${newIds.has(r.id) ? "ticker-row-new" : ""}`}
              >
                <time className="tabular-nums text-cream/50">{relativeTime(r.soldAt)}</time>
                <span className="font-mono text-[0.68rem] text-gold-soft">{r.operator}</span>
                <span className="min-w-0 truncate text-cream/80">
                  {typeBadge(r.type)}
                  {r.itemsSummary}
                </span>
                <span className="tabular-nums font-medium text-cream/95">{eur(r.grossCents)}</span>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 w-full border-t border-cream/10 py-1.5 text-[0.62rem] tracking-[0.14em] text-gold-soft uppercase transition-colors hover:text-gold-glow"
            >
              {expanded ? "Mostrar menos ▲" : `Mostrar mais ${hiddenCount} ▾`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function LiveTicker({
  initial,
  boutiques,
  initialVisible = 5,
}: {
  initial: Record<BoutiqueCode, TickerRow[]>;
  boutiques: BoutiqueCode[];
  initialVisible?: number;
}) {
  const [data, setData] = useState<Record<BoutiqueCode, TickerRow[]>>(initial);
  const knownIds = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Seed the known set on mount so o initial SSR não aparece com flash.
  useEffect(() => {
    const all = new Set<string>();
    for (const b of boutiques) for (const r of data[b] ?? []) all.add(r.id);
    knownIds.current = all;
    // No new IDs on first render.
    setNewIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/admin/dashboard-live", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled || !json?.ok) return;
        const next = json.ticker as Record<BoutiqueCode, TickerRow[]>;
        // Detect new IDs vs the set we've seen.
        const freshNew = new Set<string>();
        for (const b of boutiques) {
          for (const r of next[b] ?? []) {
            if (!knownIds.current.has(r.id)) {
              freshNew.add(r.id);
              knownIds.current.add(r.id);
            }
          }
        }
        setData(next);
        if (freshNew.size > 0) {
          setNewIds(freshNew);
          // Remove the "new" marker after the flash animation ends (~1.4s).
          setTimeout(() => {
            if (!cancelled) setNewIds(new Set());
          }, 1500);
        }
      } catch { /* silencioso */ }
    }
    const t = setInterval(poll, 30_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [boutiques]);

  return (
    <div className={`mt-6 grid gap-6 ${boutiques.length > 1 ? "md:grid-cols-2" : ""}`}>
      {boutiques.map((b) => (
        <TickerColumn
          key={b}
          boutique={b}
          rows={data[b] ?? []}
          showLabel
          newIds={newIds}
          initialVisible={initialVisible}
        />
      ))}
    </div>
  );
}
