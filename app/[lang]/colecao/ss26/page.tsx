import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getProductsByVariantSkus, type Product } from "@/lib/catalog";
import { paginate, readPage } from "@/lib/paginate";
import { ProductCard } from "@/components/product-card";
import { Ss26ExternalTileCard } from "@/components/ss26-external-tile";
import { Paginator } from "@/components/paginator";
import { Crest } from "@/components/crest";
import {
  SS26_SKUS,
  SS26_LIFESTYLE,
  SS26_SHOPIFY_FALLBACK,
} from "@/lib/ss26";

// 50 products per page, matching the Maison's own /collections/spring-
// animation page 1 and mirroring the "load per page" cadence.
const SS26_PER_PAGE = 50;

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

export const dynamic = "force-dynamic";

interface ProductTile { kind: "product"; product: Product; sku: string; }
interface ExternalTile { kind: "external"; sku: string; }
interface BannerTile { kind: "banner"; src: string; alt: string; side: "left" | "right"; }
type Tile = ProductTile | ExternalTile | BannerTile;

export default async function SS26Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang } = await params;
  const { page: pageParam } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  const products = await getProductsByVariantSkus([...SS26_SKUS]);
  const productBySku = new Map<string, Product>();
  for (const p of products) {
    for (const v of p.variants) productBySku.set(v.sku, p);
  }

  // Paginate the SKU list FIRST — 50 per page — then walk the slice.
  // The Maison ships the same 50-per-page cadence on their
  // /collections/spring-animation grid. Banners only appear on
  // page 1 because that's where their positions (4/12/20/28/36)
  // fall inside the slice; pages 2+ are pure product tiles.
  const paginated = paginate([...SS26_SKUS], readPage(pageParam), SS26_PER_PAGE);
  const currentPage = paginated.page;

  const tiles: Tile[] = [];
  const nextBanner = new Map(
    SS26_LIFESTYLE.map((b) => [b.insertAfterProductPosition, b]),
  );
  let productPosition = 0;
  for (const sku of paginated.slice) {
    const product = productBySku.get(sku);
    if (product) {
      tiles.push({ kind: "product", product, sku });
      productPosition++;
    } else if (SS26_SHOPIFY_FALLBACK[sku]) {
      tiles.push({ kind: "external", sku });
      productPosition++;
    } else {
      continue;
    }
    // Banners only interleave on page 1 (the Maison's own layout —
    // pages 2 + 3 are pure product listings).
    if (currentPage === 1) {
      const b = nextBanner.get(productPosition);
      if (b) {
        tiles.push({ kind: "banner", src: b.src, alt: b.alt, side: b.side });
        nextBanner.delete(productPosition);
      }
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

      <Paginator
        pathname={`/${locale}/colecao/ss26`}
        query={{}}
        page={currentPage}
        totalPages={paginated.totalPages}
        prevLabel={dict.common.prev}
        nextLabel={dict.common.next}
      />
    </section>
  );
}
