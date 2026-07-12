// Per-boutique stock row surfaced under Pedir Informação on the PDP.
// Shows a coloured dot + boutique short label + status text for both
// Lisboa and V. N. de Gaia. Renders nothing when the active variant
// carries no stock data at all (undefined / null / 0 across both
// boutiques on a product that predates the ECI import).
import { STORE_LIS, STORE_VNG, type StoreInfo } from "@/lib/store-info";
import type { Locale } from "@/lib/i18n";

export interface AvailabilityLabels {
  title: string; // "Disponibilidade em boutique"
  available: string; // "{n} disponíveis"
  lastOne: string; // "Última unidade"
  outOfStock: string; // "Esgotado"
}

export function AvailabilityStrip({
  stockLis,
  stockVng,
  labels,
  lang,
}: {
  stockLis: number | undefined | null;
  stockVng: number | undefined | null;
  labels: AvailabilityLabels;
  lang: Locale;
}) {
  const lis = Number.isFinite(stockLis) ? Number(stockLis) : 0;
  const vng = Number.isFinite(stockVng) ? Number(stockVng) : 0;
  // Hide entirely when neither boutique has meaningful stock data
  // AND neither is explicitly 0 — treats missing data as "unknown"
  // rather than surfacing a strip of grey dots on legacy rows.
  if (stockLis == null && stockVng == null) return null;

  return (
    <div className="border-t border-line pt-6">
      <p className="overline">{labels.title}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        <Row store={STORE_LIS} count={lis} labels={labels} lang={lang} />
        <Row store={STORE_VNG} count={vng} labels={labels} lang={lang} />
      </ul>
    </div>
  );
}

function Row({
  store,
  count,
  labels,
  lang,
}: {
  store: StoreInfo;
  count: number;
  labels: AvailabilityLabels;
  lang: Locale;
}) {
  const dot =
    count >= 2
      ? "bg-[#2bb673]"    // green — plenty
      : count === 1
        ? "bg-[#d4a017]"  // amber — last piece
        : "bg-line";      // grey — sold out
  const status =
    count >= 2
      ? labels.available.replace("{n}", String(count))
      : count === 1
        ? labels.lastOne
        : labels.outOfStock;
  const statusTone = count > 0 ? "text-ink" : "text-muted";
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden
        className={`inline-block h-2 w-2 rounded-full ${dot}`}
      />
      <span className="w-28 shrink-0 text-xs tracking-[0.14em] text-muted uppercase">
        {store.labels[lang].short}
      </span>
      <span className={`text-xs tracking-[0.14em] uppercase ${statusTone}`}>
        {status}
      </span>
    </li>
  );
}
