import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import {
  getProductsByVariantSkus,
  expandProductCards,
  type Product,
} from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { Crest } from "@/components/crest";
import { SS26_SKUS, SS26_LIFESTYLE } from "@/lib/ss26";

// Spring / Summer Selection 26 — replica of st-dupont.com's own
// /collections/spring-animation page. 111 SKUs in the Maison's
// authored order (products.json paginated crawl on 2026-07-12);
// six editorial lifestyle images interleave the grid at positions
// 0 / 8 / 16 / 24 / 32 / 40 — the same cadence Nosto renders on
// their site via window.Lobst.visual_merchandising.
//
// Layout choices per user brief: banners live INSIDE the main grid
// as col-span-2 row-span-2 tiles, so they share the same gutter as
// product cards — no extra vertical padding under each image.

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
  // Index by every variant SKU so the SS26 ordering can look up the
  // owning product even when the SKU isn't the product's primary.
  const productBySku = new Map<string, Product>();
  for (const p of products) {
    for (const v of p.variants) productBySku.set(v.sku, p);
  }

  // Walk SS26_SKUS in order. For each SKU that resolves to a real
  // product (once — dedupe by slug), emit ONE card pinned to that
  // exact SKU. Missing SKUs are silently dropped so the grid
  // tightens.
  interface RenderTile {
    kind: "product";
    product: Product;
    sku: string;
  }
  interface RenderBanner {
    kind: "banner";
    src: string;
    alt: string;
  }
  type Tile = RenderTile | RenderBanner;

  const seenSlug = new Set<string>();
  const productTiles: RenderTile[] = [];
  // Map SS26_SKUS absolute index → the resulting productTiles index
  // AFTER which a banner should slot. Banners live "after position N"
  // in the Maison's authoring, so we count product SKUs up to and
  // including that absolute index (regardless of catalog gaps).
  const bannerAfterProductTile: Map<number, RenderBanner[]> = new Map();
  let productTilesUpToIdx = -1;

  for (let i = 0; i < SS26_SKUS.length; i++) {
    const sku = SS26_SKUS[i];
    const product = productBySku.get(sku);
    if (product && !seenSlug.has(product.slug)) {
      seenSlug.add(product.slug);
      productTiles.push({ kind: "product", product, sku });
      productTilesUpToIdx = productTiles.length - 1;
    }
    // Any banner whose insertAfterSkuIndex === (i + 1) fires here,
    // so it lands immediately after the last product tile in the
    // productTiles array — regardless of whether SKU (i+1) actually
    // resolved to a product.
    const bannersHere = SS26_LIFESTYLE.filter(
      (b) => b.insertAfterSkuIndex === i + 1,
    );
    if (bannersHere.length) {
      const arr = bannerAfterProductTile.get(productTilesUpToIdx) ?? [];
      for (const b of bannersHere) {
        arr.push({ kind: "banner", src: b.src, alt: b.alt });
      }
      bannerAfterProductTile.set(productTilesUpToIdx, arr);
    }
  }

  // Position 0's banner is the hero — always shown as the top card
  // in the header pairing, NOT interleaved into the grid. Pull it
  // out here so the map only contains interleaved banners.
  const hero = SS26_LIFESTYLE.find((b) => b.insertAfterSkuIndex === 0);

  // Compose the final ordered tile stream — product then any banners
  // scheduled after it.
  const tiles: Tile[] = [];
  for (let i = 0; i < productTiles.length; i++) {
    tiles.push(productTiles[i]);
    const after = bannerAfterProductTile.get(i);
    if (after) for (const b of after) tiles.push(b);
  }

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

      {/* Editorial pairing — hero image left, first four products in a
          2×2 on the right (md+). Stacks on mobile. */}
      {hero && tiles.length >= 4 && (
        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-7 lg:gap-8">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-paper">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover object-center"
            />
          </div>
          <div className="grid grid-cols-2 gap-5 sm:gap-7">
            {tiles.slice(0, 4).map((t) =>
              t.kind === "product" ? (
                <ProductCard
                  key={`${t.product.slug}-${t.sku}`}
                  product={t.product}
                  lang={locale}
                  variantSku={t.sku}
                />
              ) : null,
            )}
          </div>
        </div>
      )}

      {/* Main grid — remaining tiles + interleaved lifestyle banners.
          Each banner spans 2 cols × 2 rows so it fills the same slot
          as four product cards, sharing the same gap as the grid. */}
      {tiles.length > 4 && (
        <div className="mt-5 grid auto-rows-auto grid-cols-2 gap-5 sm:mt-7 sm:gap-7 lg:grid-cols-4 lg:gap-8">
          {tiles.slice(4).map((t, i) =>
            t.kind === "product" ? (
              <ProductCard
                key={`${t.product.slug}-${t.sku}-${i}`}
                product={t.product}
                lang={locale}
                variantSku={t.sku}
              />
            ) : (
              <div
                key={`banner-${i}-${t.src}`}
                className="relative col-span-2 row-span-2 overflow-hidden border border-line bg-paper"
              >
                <Image
                  src={t.src}
                  alt={t.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}
