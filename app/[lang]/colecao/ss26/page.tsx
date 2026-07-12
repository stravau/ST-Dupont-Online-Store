import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getProductsByVariantSkus, type Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { Ss26ExternalTileCard } from "@/components/ss26-external-tile";
import { Crest } from "@/components/crest";
import {
  SS26_SKUS,
  SS26_LIFESTYLE,
  SS26_SHOPIFY_FALLBACK,
} from "@/lib/ss26";

// Spring / Summer Selection 26 — replica of st-dupont.com's
// /collections/spring-animation page (2026-07-12 crawl).
//
// Layout matches the Maison: no top pairing, no editorial header
// block. Straight into the 4-col grid (2 on mobile). Six 2×2
// lifestyle banners slot into the flow after every ~8 product tiles
// (positions 4 / 12 / 20 / 28 / 36 / 44) and alternate LEFT / RIGHT
// via lg:col-start-1 / lg:col-start-3. grid-auto-flow: dense lets
// the smaller product tiles wrap around each banner.
//
// SKUs that aren't in our Prisma catalogue fall back to an external
// tile (Ss26ExternalTileCard) driven by SS26_SHOPIFY_FALLBACK so the
// grid stays complete regardless of catalogue state.

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

interface ProductTile { kind: "product"; product: Product; sku: string; }
interface ExternalTile { kind: "external"; sku: string; }
interface BannerTile { kind: "banner"; src: string; alt: string; side: "left" | "right"; }
type Tile = ProductTile | ExternalTile | BannerTile;

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
  const productBySku = new Map<string, Product>();
  for (const p of products) {
    for (const v of p.variants) productBySku.set(v.sku, p);
  }

  // Walk SS26_SKUS in Maison-authored order. For each SKU: emit a
  // real product tile if we own it, otherwise an external fallback,
  // otherwise skip. Track the position count so lifestyle banners
  // slot in at fixed absolute positions.
  //
  // CRITICAL: only check for a banner when productPosition ACTUALLY
  // advanced this iteration. Otherwise a skipped duplicate SKU
  // (same slug as an already-emitted product) would re-fire the
  // banner check at the unchanged position — every subsequent skip
  // would push another copy of the last banner.
  const tiles: Tile[] = [];
  const seenSlug = new Set<string>();
  const nextBanner = new Map(
    SS26_LIFESTYLE.map((b) => [b.insertAfterProductPosition, b]),
  );
  let productPosition = 0;
  for (const sku of SS26_SKUS) {
    const product = productBySku.get(sku);
    let advanced = false;
    if (product && !seenSlug.has(product.slug)) {
      seenSlug.add(product.slug);
      tiles.push({ kind: "product", product, sku });
      productPosition++;
      advanced = true;
    } else if (SS26_SHOPIFY_FALLBACK[sku]) {
      tiles.push({ kind: "external", sku });
      productPosition++;
      advanced = true;
    }
    if (!advanced) continue;
    const b = nextBanner.get(productPosition);
    if (b) {
      tiles.push({ kind: "banner", src: b.src, alt: b.alt, side: b.side });
      // Belt-and-braces — remove the entry so even a bug in the
      // advance guard above can't fire the same banner twice.
      nextBanner.delete(productPosition);
    }
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

      {/* Single 2-col / 4-col grid — banners are col-span-2 row-span-2
          tiles with an explicit lg:col-start to alternate sides.
          `grid-flow-dense` lets product tiles fill any gap. */}
      <div className="mt-10 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8 lg:[grid-auto-flow:dense]">
        {tiles.map((t, i) => {
          if (t.kind === "product") {
            return (
              <ProductCard
                key={`${t.product.slug}-${t.sku}-${i}`}
                product={t.product}
                lang={locale}
                variantSku={t.sku}
              />
            );
          }
          if (t.kind === "external") {
            const fallback = SS26_SHOPIFY_FALLBACK[t.sku]!;
            return <Ss26ExternalTileCard key={`ext-${t.sku}-${i}`} tile={fallback} lang={locale} />;
          }
          const sideClass =
            t.side === "left" ? "lg:col-start-1" : "lg:col-start-3";
          return (
            <div
              key={`banner-${i}-${t.src}`}
              className={`relative col-span-2 row-span-2 overflow-hidden border border-line bg-paper ${sideClass}`}
            >
              <Image
                src={t.src}
                alt={t.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
                priority={i < 6}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
