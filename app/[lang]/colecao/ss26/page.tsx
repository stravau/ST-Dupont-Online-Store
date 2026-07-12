import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getProductsByVariantSkus, expandProductCards } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { Crest } from "@/components/crest";
import { SS26_SKUS } from "@/lib/ss26";

// Spring / Summer Selection 26 — a curated cross-catalogue edit that
// mirrors the 50-SKU list published on st-dupont.com's
// /collections/spring-animation page. 45 of those 50 SKUs live in our
// catalogue; the rest are silently skipped rather than shown as
// broken tiles.
//
// Layout mirrors the Maison's own page: a big editorial lifestyle
// shot on the left, tiled 2×2 with the first four products on the
// right, then the remainder of the SS26 line-up in a standard grid.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang as Locale);
  return { title: dict.ss26.title, description: dict.ss26.lede };
}

export default async function SS26Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  const products = await getProductsByVariantSkus([...SS26_SKUS]);
  // Preserve the exact order the Maison shipped — SS26_SKUS is
  // authored in that order and getProductsByVariantSkus doesn't
  // guarantee it, so we reorder before expansion.
  const productBySku = new Map(
    products.flatMap((p) => p.variants.map((v) => [v.sku, p] as const)),
  );
  const ordered: typeof products = [];
  const seen = new Set<string>();
  for (const sku of SS26_SKUS) {
    const p = productBySku.get(sku);
    if (p && !seen.has(p.slug)) {
      ordered.push(p);
      seen.add(p.slug);
    }
  }
  // expandProductCards inflates per-colourway, so pin each card to
  // the SS26 SKU rather than letting the default (first-visible)
  // photo win.
  const cards = ordered.flatMap((p) => {
    const targetSku = SS26_SKUS.find((s) => p.variants.some((v) => v.sku === s));
    if (!targetSku) return expandProductCards(p);
    return [{ product: p, sku: targetSku }];
  });

  // Editorial layout: first four cards sit beside the lifestyle hero
  // in a 2×2 grid; the rest cascade in the standard 4-col product
  // grid below.
  const firstFour = cards.slice(0, 4);
  const rest = cards.slice(4);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <Crest className="mb-4 mx-auto" />
        <p className="overline">{dict.ss26.eyebrow}</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-5xl">
          {dict.ss26.title}
        </h1>
        <div className="gold-rule mx-auto my-5" />
        <p className="text-sm text-muted md:text-base">{dict.ss26.lede}</p>
      </header>

      {/* Editorial pairing — lifestyle hero left, first four products
          right (2×2 on md+, stacked on mobile). Matches the layout the
          Maison ships on their own collection page. */}
      <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-7 lg:gap-8">
        <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-paper">
          <Image
            src="/ss26/hero.jpg"
            alt={dict.ss26.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="grid grid-cols-2 gap-5 sm:gap-7">
          {firstFour.map(({ product, sku }) => (
            <ProductCard
              key={`${product.slug}-${sku}`}
              product={product}
              lang={locale}
              variantSku={sku}
            />
          ))}
        </div>
      </div>

      {rest.length > 0 && (
        <div className="product-grid mt-10 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8">
          {rest.map(({ product, sku }) => (
            <ProductCard
              key={`${product.slug}-${sku}`}
              product={product}
              lang={locale}
              variantSku={sku}
            />
          ))}
        </div>
      )}
    </section>
  );
}
