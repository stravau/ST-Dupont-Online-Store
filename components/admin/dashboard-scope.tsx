"use client";

import { useState } from "react";
import type { BoutiqueCode } from "@/lib/pos";
import type { ScopedKpis } from "@/lib/dashboard-data";
import type { DayPoint } from "@/lib/pos-reports";
import { BigKPIs } from "@/components/admin/big-kpis";
import { SalesTrend } from "@/components/admin/dashboard-widgets";
import { BOUTIQUE_SHORT } from "@/components/admin/boutique-scope";

// Os dois widgets do dashboard que ainda mostravam as duas lojas somadas sem
// forma de as separar: os BigKPIs (hoje / este mês, com deltas) e a Tendência
// de 30 dias. Os restantes — BoutiqueSplit, LiveTicker, TopOperators, Heatmap —
// já vinham divididos por loja, por isso não estão aqui.
//
// O servidor pré-calcula os três âmbitos (custa as mesmas 4 queries + 1 que
// já custava antes), o cliente só indexa — mesmo padrão do SalesHeatmap.

type Scope = "all" | BoutiqueCode;

const TABS: { key: Scope; label: string }[] = [
  { key: "all", label: "Geral" },
  { key: "LIS", label: BOUTIQUE_SHORT.LIS },
  { key: "VNG", label: BOUTIQUE_SHORT.VNG },
];

export function DashboardKpiScope({
  kpis,
  monthName,
}: {
  kpis: Record<Scope, ScopedKpis>;
  monthName: string;
}) {
  const [scope, setScope] = useState<Scope>("all");
  const k = kpis[scope];
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <ScopeTabs scope={scope} onChange={setScope} onDark />
      </div>
      <BigKPIs today={k.today} month={k.month} monthName={monthName} />
    </div>
  );
}

export function SalesTrendScope({ perScope }: { perScope: Record<Scope, DayPoint[]> }) {
  const [scope, setScope] = useState<Scope>("all");
  return (
    <div className="relative h-full">
      <div className="absolute right-6 top-6 z-10">
        <ScopeTabs scope={scope} onChange={setScope} />
      </div>
      <SalesTrend points={perScope[scope]} />
    </div>
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
