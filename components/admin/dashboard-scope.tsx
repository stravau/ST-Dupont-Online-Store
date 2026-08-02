"use client";

import { useState } from "react";
import type { BoutiqueCode } from "@/lib/pos";
import type { ScopedKpis, TickerRow } from "@/lib/dashboard-data";
import type { DayPoint } from "@/lib/pos-reports";
import { BigKPIs } from "@/components/admin/big-kpis";
import { SalesTrend } from "@/components/admin/dashboard-widgets";
import { LiveTicker } from "@/components/admin/live-ticker";
import { BOUTIQUE_SHORT } from "@/components/admin/boutique-scope";

type Scope = "all" | BoutiqueCode;

const TABS: { key: Scope; label: string }[] = [
  { key: "all", label: "Geral" },
  { key: "LIS", label: BOUTIQUE_SHORT.LIS },
  { key: "VNG", label: BOUTIQUE_SHORT.VNG },
];

/**
 * Todo o conteúdo do hero do painel sob um único filtro de loja: KPIs de hoje
 * e do mês (com deltas) + as últimas vendas.
 *
 * Escolher Lisboa ou Gaia esconde por completo o que é da outra — o ticker
 * passa a uma coluna só, à largura toda do card, em vez de duas colunas com
 * metade vazia. O BoutiqueSplit (dois cartões lado a lado) saiu: com o filtro,
 * os KPIs de cima dão a mesma leitura sem duplicar a informação.
 */
export function DashboardHeroScope({
  kpis,
  monthName,
  ticker,
  boutiques,
}: {
  kpis: Record<Scope, ScopedKpis>;
  monthName: string;
  ticker: Record<BoutiqueCode, TickerRow[]>;
  boutiques: BoutiqueCode[];
}) {
  const [scope, setScope] = useState<Scope>("all");
  const k = kpis[scope];
  const visible = scope === "all" ? boutiques : ([scope] as BoutiqueCode[]);

  return (
    <div>
      <ScopeTabs scope={scope} onChange={setScope} onDark />
      <div className="mt-5">
        <BigKPIs today={k.today} month={k.month} monthName={monthName} />
      </div>
      {/* key força o LiveTicker a remontar quando o âmbito muda, para o
          seed de "vendas já vistas" não marcar as linhas da outra loja
          como novas e disparar o flash gold em massa. */}
      <LiveTicker
        key={scope}
        initial={ticker}
        boutiques={visible}
        initialVisible={5}
        fetchCount={15}
      />
    </div>
  );
}

export function SalesTrendScope({ perScope }: { perScope: Record<Scope, DayPoint[]> }) {
  const [scope, setScope] = useState<Scope>("all");
  return (
    <SalesTrend
      points={perScope[scope]}
      action={<ScopeTabs scope={scope} onChange={setScope} />}
    />
  );
}

function ScopeTabs({
  scope,
  onChange,
  onDark = false,
}: {
  scope: Scope;
  onChange: (s: Scope) => void;
  onDark?: boolean;
}) {
  return (
    <div role="tablist" aria-label="Filtrar por loja" className="flex gap-1">
      {TABS.map((t) => {
        const active = scope === t.key;
        const cls = active
          ? onDark
            ? "border-gold bg-gold/20 text-gold-soft"
            : "border-gold bg-gold/10 text-gold"
          : onDark
            ? "border-cream/20 text-cream/60 hover:border-gold/60 hover:text-cream"
            : "border-line text-muted hover:border-gold/50 hover:text-ink";
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`border px-2.5 py-1 text-[0.6rem] tracking-[0.12em] uppercase transition-colors ${cls}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
