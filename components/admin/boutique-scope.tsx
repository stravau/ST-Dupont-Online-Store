import Link from "next/link";
import type { BoutiqueCode } from "@/lib/pos";

// Selector de âmbito por loja — Geral · Lisboa · V.N. Gaia.
//
// O rótulo da boutique estava definido em seis ficheiros, com duas grafias
// diferentes de Gaia ("V. N. de Gaia" e "V.N. Gaia"). Este módulo passa a ser
// a fonte única, e traz também a resolução role → lojas visíveis, que estava
// copiada à letra em cinco páginas.

export type BoutiqueScope = "all" | BoutiqueCode;

/** Nome completo — cabeçalhos, cartões do hero, colunas de tabela. */
export const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = {
  LIS: "Lisboa",
  VNG: "V. N. de Gaia",
};

/** Nome curto — chips e tabs, onde o espaço é apertado. */
export const BOUTIQUE_SHORT: Record<BoutiqueCode, string> = {
  LIS: "Lisboa",
  VNG: "V.N. Gaia",
};

/**
 * As lojas que um role pode ver. LOJA_* estão presas à sua; ADMIN vê as duas.
 * Era um helper local duplicado em relatorios, relatorio-vendas, movimentos,
 * reparacoes e pos.
 */
export function boutiquesForRole(role: string | null | undefined): BoutiqueCode[] {
  if (role === "LOJA_LIS") return ["LIS"];
  if (role === "LOJA_VNG") return ["VNG"];
  return ["LIS", "VNG"];
}

/**
 * Converte o `?boutique=` do URL nas lojas a consultar, sem nunca deixar um
 * LOJA_* espreitar a outra: o pedido é intersectado com o que o role permite.
 */
export function resolveScope(
  param: string | undefined,
  allowed: BoutiqueCode[],
): { scope: BoutiqueScope; boutiques: BoutiqueCode[] } {
  const wanted = param === "LIS" || param === "VNG" ? param : "all";
  if (wanted === "all" || !allowed.includes(wanted)) {
    return { scope: "all", boutiques: allowed };
  }
  return { scope: wanted, boutiques: [wanted] };
}

/**
 * Tabs navegáveis por URL. `hrefFor` é dado pela página para que os restantes
 * parâmetros (?month=, ?from=, ?to=, ?page=) sobrevivam à troca de loja — o
 * MonthPicker e o ReportDatePicker reescrevem a query string inteira, por isso
 * quem constrói o href tem de ser quem conhece o estado da página.
 *
 * Só aparece quando há mais do que uma loja para escolher: para LOJA_* seria
 * uma tab única e inerte.
 */
export function BoutiqueScopeTabs({
  scope,
  allowed,
  hrefFor,
}: {
  scope: BoutiqueScope;
  allowed: BoutiqueCode[];
  hrefFor: (scope: BoutiqueScope) => string;
}) {
  if (allowed.length < 2) return null;
  const tabs: { key: BoutiqueScope; label: string }[] = [
    { key: "all", label: "Geral" },
    ...allowed.map((b) => ({ key: b as BoutiqueScope, label: BOUTIQUE_SHORT[b] })),
  ];
  return (
    <div role="tablist" aria-label="Filtrar por loja" className="flex gap-1">
      {tabs.map((t) => {
        const active = t.key === scope;
        return (
          <Link
            key={t.key}
            href={hrefFor(t.key)}
            role="tab"
            aria-selected={active}
            className={`border px-3 py-1.5 text-[0.62rem] tracking-[0.12em] uppercase transition-colors ${
              active
                ? "border-gold bg-gold/10 text-gold"
                : "border-line text-muted hover:border-gold/50 hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

