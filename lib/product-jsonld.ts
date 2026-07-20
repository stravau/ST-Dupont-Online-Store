// Product Schema.org JSON-LD builder. Called from the PDP server
// component, output is emitted as an inline <script type="application/
// ld+json">. Google Rich Results uses this to render Product /
// Merchant cards in search.
//
// Key choices (per the plan):
// - Emit a FLAT Offer[] — one Offer per SKU — not an AggregateOffer.
//   Rich Results actually renders per-variant prices this way, and
//   picky validators complain about AggregateOffer with a Product.
// - Each Offer has priceCurrency, price (promo or regular), url
//   (absolute + ?v=<sku>), availability, seller.
// - Include priceValidUntil on Offers whose variant has an active
//   promo — Google flags Products without a validity date.
// - All URLs absolutised against the site origin.
import type { Locale } from "@/lib/i18n";
import type { Product, Variant } from "@/lib/catalog";
import { STORE_LIS } from "@/lib/store-info";

const FALLBACK_ORIGIN = "https://st-dupont-online-store.vercel.app";

// Safely serialize a JSON-LD object for injection into an inline <script>.
// Escapes the characters that could break out of the <script> element so
// admin-entered product names/descriptions can never inject markup: `<`, `>`
// and `&` neutralise any `</script>` sequence while keeping valid JSON-LD.
export function serializeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_ORIGIN;
}

function absoluteUrl(path: string): string {
  const origin = siteOrigin();
  return path.startsWith("http") ? path : `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

function availabilityFor(status: Variant["status"]): string {
  if (status === "DESCONTINUADO") return "https://schema.org/Discontinued";
  if (status === "INDISPONIVEL") return "https://schema.org/OutOfStock";
  return "https://schema.org/InStock";
}

function priceCentsFor(v: Variant): { cents: number; validUntil?: string } {
  const now = Date.now();
  const promoActive =
    typeof v.promoPriceCents === "number" &&
    v.promoPriceCents > 0 &&
    (!v.promoEndDate || new Date(v.promoEndDate).getTime() >= now);
  if (promoActive && typeof v.promoPriceCents === "number") {
    return {
      cents: v.promoPriceCents,
      validUntil: v.promoEndDate
        ? new Date(v.promoEndDate).toISOString().slice(0, 10)
        : undefined,
    };
  }
  return { cents: v.priceCents };
}

function variantImages(v: Variant, productImage: string | null): string[] {
  const raw = v.images && v.images.length > 0
    ? v.images
    : v.image
      ? [v.image]
      : productImage
        ? [productImage]
        : [];
  return raw.map(absoluteUrl);
}

export function buildProductJsonLd({
  product,
  activeVariant,
  productUrl,
  categoryLabel,
  lang,
}: {
  product: Product;
  activeVariant: Variant;
  productUrl: string; // e.g. /pt/p/<slug> — will be absolutised
  categoryLabel: string;
  lang: Locale;
}): Record<string, unknown> {
  const canonical = absoluteUrl(productUrl);
  const seller = {
    "@type": "Organization",
    name: STORE_LIS.venue,
    address: `${STORE_LIS.street}, ${STORE_LIS.postcode}`,
  };

  const offers = product.variants.map((v) => {
    const { cents, validUntil } = priceCentsFor(v);
    const url = `${canonical}?v=${encodeURIComponent(v.sku)}`;
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      sku: v.sku,
      priceCurrency: v.currency,
      price: (cents / 100).toFixed(2),
      availability: availabilityFor(v.status),
      itemCondition: "https://schema.org/NewCondition",
      url,
      seller,
    };
    if (validUntil) offer.priceValidUntil = validUntil;
    return offer;
  });

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[lang],
    description: product.description[lang],
    sku: activeVariant.sku,
    mpn: activeVariant.sku,
    brand: { "@type": "Brand", name: "S.T. Dupont" },
    category: categoryLabel,
    image: variantImages(activeVariant, product.image),
    url: canonical,
    offers,
  };
}
