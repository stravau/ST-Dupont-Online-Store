import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { type Product, formatPrice } from "@/lib/catalog";
import { ProductCardInteractive, type CardSwatch } from "@/components/product-card-interactive";
import { compareSwatch } from "@/lib/swatch-order";

export function ProductCard({
  product,
  lang,
  variantType,
}: {
  product: Product;
  lang: Locale;
  // When set, this card represents one pen type of the product (e.g. the
  // "Ballpoint" of the Initial line) — title, price and colours scope to it.
  variantType?: string;
}) {
  const dict = getDictionary(lang);
  // Overline above the card name = the category (Lighters / Writing / …).
  const categoryLabel =
    ({
      isqueiros: dict.nav.lighters,
      escrita: dict.nav.writing,
      pele: dict.nav.leather,
      acessorios: dict.nav.accessories,
    } as Record<string, string>)[product.categorySlug] ?? product.collection;

  const scoped = variantType
    ? product.variants.filter((v) => v.attributes.type?.[lang] === variantType)
    : product.variants;
  const list = scoped.length > 0 ? scoped : product.variants;

  const base = list.reduce((m, v) => (v.priceCents < m.priceCents ? v : m), list[0]);

  // Distinct colourways → interactive swatches (each with its own photo).
  const swatches: CardSwatch[] = [];
  for (const v of list) {
    const c = v.attributes.color;
    if (c && !swatches.some((x) => x.label === c.label[lang])) {
      swatches.push({
        sku: v.sku,
        label: c.label[lang],
        hex: c.hex,
        image: v.image ?? product.image,
        // Close-up (3rd gallery photo) shown on card hover, when supplied.
        hoverImage: v.images?.[2] ?? null,
        // Full gallery to slide through on the card.
        images: v.images && v.images.length ? v.images : v.image ? [v.image] : [],
        price: formatPrice(v.priceCents, v.currency, lang),
      });
    }
  }
  swatches.sort(compareSwatch);

  // Show a different colourway per card by default (deterministic per item).
  // Prefer a colourway that has a real slideshow (≥2 photos) so cards never
  // open on a flat single-image variant when a multi-photo one is available.
  const initialSwatch = (() => {
    if (!swatches.length) return 0;
    const hash = [...`${product.slug}${variantType ?? ""}`].reduce(
      (h, c) => (h * 31 + c.charCodeAt(0)) >>> 0,
      7,
    );
    const slideshowIdx = swatches
      .map((s, i) => ((s.images?.length ?? 0) > 1 ? i : -1))
      .filter((i) => i >= 0);
    const pool = slideshowIdx.length ? slideshowIdx : swatches.map((_, i) => i);
    return pool[hash % pool.length];
  })();

  const href = `/${lang}/p/${product.slug}${
    variantType ? `?t=${encodeURIComponent(variantType)}` : ""
  }`;
  const title = variantType ? `${product.name[lang]} · ${variantType}` : product.name[lang];

  return (
    <ProductCardInteractive
      href={href}
      seed={product.slug}
      title={title}
      collection={categoryLabel}
      noveltyLabel={product.novelty ? dict.sections.noveltyTag : null}
      fromLabel={dict.product.from}
      colorWord={dict.product.colorLabel.toLowerCase()}
      fallbackImage={product.image}
      swatches={swatches}
      basePrice={formatPrice(base.priceCents, base.currency, lang)}
      baseSku={base.sku}
      initialSwatch={initialSwatch}
      inquireLabel={dict.product.inquire}
      inquireSubject={dict.product.inquireSubject}
      inquireBody={dict.product.inquireBody}
    />
  );
}
