// Availability line under "Pedir Informação" on the PDP. Now that real per-
// boutique stock is loaded, it reflects it: in stock in one boutique → shows
// which one; in stock in both → simply "Disponível"; in stock in neither →
// "Disponibilidade sob confirmação" (a showcase, not a live shop, so we never
// scream "Esgotado"). Real stock still drives admin / POS / reports.
import { STORE_LIS, STORE_VNG } from "@/lib/store-info";
import type { Locale } from "@/lib/i18n";

export interface AvailabilityLabels {
  title: string; // "Disponibilidade em boutique"
  available: string; // both boutiques: "Disponível"
  availableAt: string; // one boutique: "Disponível em {store}"
  onRequest: string; // neither: "Disponibilidade sob confirmação"
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
  const lis = (stockLis ?? 0) > 0;
  const vng = (stockVng ?? 0) > 0;

  let message: string;
  let inStock = true;
  if (lis && vng) message = labels.available;
  else if (lis) message = labels.availableAt.replace("{store}", STORE_LIS.labels[lang].short);
  else if (vng) message = labels.availableAt.replace("{store}", STORE_VNG.labels[lang].short);
  else {
    message = labels.onRequest;
    inStock = false;
  }

  return (
    <div className="border-t border-line pt-6">
      <p className="overline">{labels.title}</p>
      <p className="mt-3 flex items-center gap-2.5">
        <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${inStock ? "bg-[#2bb673]" : "bg-gold"}`} />
        <span className="text-xs tracking-[0.14em] text-ink uppercase">{message}</span>
      </p>
    </div>
  );
}
