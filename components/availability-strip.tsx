// Per-boutique stock rows under "Pedir Informação" on the PDP. One row each for
// Lisboa and V. N. de Gaia: >= 2 units → "Disponível" (green), 1 unit → "Poucas
// unidades" (amber), 0 → "Esgotado" (grey).
import { STORE_LIS, STORE_VNG, type StoreInfo } from "@/lib/store-info";
import type { Locale } from "@/lib/i18n";

export interface AvailabilityLabels {
  title: string; // "Disponibilidade em boutique"
  available: string; // >= 2: "Disponível"
  fewLeft: string; // == 1: "Poucas unidades"
  outOfStock: string; // == 0: "Esgotado"
}

export function AvailabilityStrip({
  stockLis,
  stockVng,
  labels,
  lang,
}: {
  stockLis: number | null | undefined;
  stockVng: number | null | undefined;
  labels: AvailabilityLabels;
  lang: Locale;
}) {
  return (
    <div className="border-t border-line pt-6">
      <p className="overline">{labels.title}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        <Row store={STORE_LIS} count={Number(stockLis ?? 0)} labels={labels} lang={lang} />
        <Row store={STORE_VNG} count={Number(stockVng ?? 0)} labels={labels} lang={lang} />
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
  const dot = count >= 2 ? "bg-[#2bb673]" : count === 1 ? "bg-[#d4a017]" : "bg-line";
  const status = count >= 2 ? labels.available : count === 1 ? labels.fewLeft : labels.outOfStock;
  const tone = count > 0 ? "text-ink" : "text-muted";
  return (
    <li className="flex items-center gap-3">
      <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      <span className="w-28 shrink-0 text-xs tracking-[0.14em] text-muted uppercase">{store.labels[lang].short}</span>
      <span className={`text-xs tracking-[0.14em] uppercase ${tone}`}>{status}</span>
    </li>
  );
}
