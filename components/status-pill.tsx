import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { STORE_LIS, STORE_VNG } from "@/lib/store-info";

// In-stock cue near the product title. Reflects the REAL stock (product-level,
// i.e. across every colourway): in stock in one boutique → "Disponível em
// <loja>"; in both → "Disponível"; in neither → "Disponibilidade sob
// confirmação" (a showcase, so never "Esgotado"). Green pulsing dot when in
// stock, quiet gold dot when on request.
export function StatusPill({
  lang,
  stockLis,
  stockVng,
  className = "",
}: {
  lang: Locale;
  stockLis?: number;
  stockVng?: number;
  className?: string;
}) {
  const dict = getDictionary(lang);
  const lis = (stockLis ?? 0) > 0;
  const vng = (stockVng ?? 0) > 0;

  let label: string;
  let inStock = true;
  if (lis && vng) label = dict.product.availabilityBoth;
  else if (lis) label = dict.product.availabilityInStore.replace("{store}", STORE_LIS.labels[lang].short);
  else if (vng) label = dict.product.availabilityInStore.replace("{store}", STORE_VNG.labels[lang].short);
  else {
    label = dict.product.availabilityOnRequest;
    inStock = false;
  }
  const color = inStock ? "#2bb673" : "#9c7a26";

  return (
    <span className={`inline-flex items-center gap-2 text-[0.65rem] tracking-[0.18em] text-muted uppercase ${className}`}>
      <span className="relative flex h-1.5 w-1.5">
        {inStock && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: color }} />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      </span>
      {label}
    </span>
  );
}
