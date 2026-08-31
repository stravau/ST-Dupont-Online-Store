"use client";

import { createContext, useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { BoutiqueCode } from "@/lib/pos";
import type { ScopedKpis, TickerRow } from "@/lib/dashboard-data";
import type { DayPoint } from "@/lib/pos-reports";
import { BigKPIs } from "@/components/admin/big-kpis";
import { SalesTrend } from "@/components/admin/dashboard-widgets";
import { LiveTicker } from "@/components/admin/live-ticker";

export type Scope = "all" | BoutiqueCode;

// Um só âmbito para o painel inteiro. O hero e os cards de baixo são irmãos
// na árvore (o hero é server component), por isso o estado vive num contexto
// à volta dos dois em vez de num deles. Assim carregar em "Lisboa" no topo
// re-escopa KPIs, últimas vendas, tendência e ritmo semanal de uma vez, e os
// cards de baixo deixam de precisar de filtro próprio.
const ScopeCtx = createContext<{ scope: Scope } | null>(null);

export function DashboardScopeProvider({ children }: { children: React.ReactNode }) {
  // O ambito vem do URL, escrito pelo filtro do cabecalho. Antes vivia em
  // estado local com abas proprias aqui dentro, e o resultado eram dois
  // filtros para a mesma coisa: o de cima mudava o URL e o painel ignorava-o.
  //
  // Continua instantaneo — os tres ambitos ja vem calculados nas props, o
  // cliente so troca de chave.
  const search = useSearchParams();
  const p = search.get("boutique");
  const scope: Scope = p === "LIS" || p === "VNG" ? p : "all";
  const value = useMemo(() => ({ scope }), [scope]);
  return <ScopeCtx.Provider value={value}>{children}</ScopeCtx.Provider>;
}

export function useDashboardScope() {
  const ctx = useContext(ScopeCtx);
  if (!ctx) throw new Error("useDashboardScope precisa de <DashboardScopeProvider> acima na árvore");
  return ctx;
}

/**
 * O hero do painel: KPIs de hoje e do mês com deltas, e as últimas vendas.
 *
 * O âmbito vem do filtro do cabeçalho. Escolher Lisboa ou Gaia esconde por
 * completo o que é da outra — o ticker passa a uma coluna só, à largura toda
 * do card, em vez de duas colunas com metade vazia.
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
  const { scope } = useDashboardScope();
  const k = kpis[scope];
  const visible = scope === "all" ? boutiques : ([scope] as BoutiqueCode[]);

  return (
    <div>
      <BigKPIs today={k.today} month={k.month} monthName={monthName} />
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

// Segue o filtro do cabeçalho, como tudo o resto no painel.
export function SalesTrendScope({ perScope }: { perScope: Record<Scope, DayPoint[]> }) {
  const { scope } = useDashboardScope();
  return <SalesTrend points={perScope[scope]} />;
}
