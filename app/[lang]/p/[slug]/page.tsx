import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getProduct, getCategory, getRelatedProducts, getMostViewed, expandProductCards, formatPrice } from "@/lib/catalog";
import { localeCategorySlug } from "@/lib/category-slugs";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusPill } from "@/components/status-pill";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import { SimilarProducts } from "@/components/similar-products";
import { TrackProductView } from "@/components/track-product-view";
import { buildSpecs } from "@/lib/specs";
import { CONTACT_ANCHOR } from "@/lib/store-info";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await getProduct(slug);
  if (!isLocale(lang) || !product) return {};
  return { title: product.name[lang as Locale], description: product.description[lang as Locale] };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ t?: string; v?: string }>;
}) {
  const { lang, slug } = await params;
  const { t: typeParam, v: skuParam } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const product = await getProduct(slug);
  if (!product) notFound();
  const dict = getDictionary(locale);
  const cat = (await getCategory(product.categorySlug))!;

  const variantOptions = product.variants.map((v) => ({
    sku: v.sku,
    price: formatPrice(v.priceCents, v.currency, locale),
    type: v.attributes.type?.[locale],
    finish: v.attributes.finish?.[locale],
    color: v.attributes.color
      ? { label: v.attributes.color.label[locale], hex: v.attributes.color.hex }
      : undefined,
    size: v.attributes.size?.[locale],
    image: v.image,
    images: v.images,
  }));

  const specsByVariant = Object.fromEntries(
    product.variants.map((v) => [v.sku, buildSpecs(product, cat, v, locale)]),
  );

  // Expand related products into (product, sku) tiles on the server and
  // pre-render each as a ProductCard. SimilarProducts is a client component
  // (it needs useRef for the scroll arrows); passing rendered nodes keeps it
  // from having to import @/lib/catalog and dragging Prisma / pg into the
  // client bundle (build-breaking).
  const related = await getRelatedProducts(product, 15);
  const relatedItems = related.flatMap((p) =>
    expandProductCards(p).map(({ sku }) => ({
      key: `${p.slug}-${sku}`,
      node: <ProductCard key={`${p.slug}-${sku}`} product={p} lang={locale} variantSku={sku} />,
    })),
  );
  // Most-viewed across the whole catalogue, excluding the current
  // product. Hidden by SimilarProducts when fewer than 4 entries exist
  // (i.e. while traffic data is still warming up).
  const mostViewed = await getMostViewed(15, product.slug);
  const mostViewedItems = mostViewed.flatMap((p) =>
    expandProductCards(p).map(({ sku }) => ({
      key: `mv-${p.slug}-${sku}`,
      node: <ProductCard key={`mv-${p.slug}-${sku}`} product={p} lang={locale} variantSku={sku} />,
    })),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: `/${locale}` },
          { label: cat.name[locale], href: `/${locale}/c/${localeCategorySlug(locale, product.categorySlug)}` },
          { label: product.name[locale] },
        ]}
      />

      <ProductDetail
        fallbackImage={product.image}
        seed={product.slug}
        label={product.name[locale]}
        variants={variantOptions}
        initialType={typeParam}
        initialSku={skuParam}
        specsByVariant={specsByVariant}
        specsTitle={dict.product.specs}
        description={product.description[locale]}
        descriptionTitle={dict.product.descriptionTitle}
        labels={{
          typeLabel: dict.product.typeLabel,
          selectType: dict.product.selectType,
          finishes: dict.product.finishes,
          selectFinish: dict.product.selectFinish,
          colorLabel: dict.product.colorLabel,
          selectColor: dict.product.selectColor,
          sizeLabel: dict.product.sizeLabel,
          selectSize: dict.product.selectSize,
          inquire: dict.product.inquire,
          inquireSubject: dict.product.inquireSubject,
          inquireBody: dict.product.inquireBody,
          priceNote: dict.product.priceNote,
        }}
        header={
          <>
            <div className="flex items-center justify-between">
              <p className="overline">
                {cat.name[locale]} · {product.collection}
              </p>
              <StatusPill lang={locale} />
            </div>
            <h1 className="mt-4 font-serif text-4xl text-ink md:text-5xl">{product.name[locale]}</h1>
            <div className="gold-rule my-7" />
          </>
        }
        extras={
          <>
            <p className="mt-6 text-center text-xs tracking-widest text-muted uppercase">
              {dict.product.visitBoutique}
            </p>

            {/* Lifetime-service reassurance — a luxury cue st-dupont.com buries */}
            <div className="mt-10 grid gap-5 border-t border-line pt-8 text-sm text-muted sm:grid-cols-2 sm:gap-x-8">
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-gold">—</span> {dict.product.lifetime}
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-gold">—</span> {dict.product.personalisation}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-xs tracking-[0.16em] uppercase">
              <Link href={`/${locale}/loja`} className="text-muted transition-colors hover:text-gold">
                {dict.product.findStore}
              </Link>
              <a href={`#${CONTACT_ANCHOR}`} className="text-muted transition-colors hover:text-gold">
                {dict.product.needHelp}
              </a>
            </div>
          </>
        }
      />

      {product.history && (
        <section className="mx-auto max-w-3xl border-t border-line pt-16 text-center">
          <p className="overline">
            {dict.product.heritage} · {product.collection}
          </p>
          <div className="gold-rule mx-auto my-6" />
          <p className="font-serif text-xl leading-relaxed text-ink md:text-2xl">
            {product.history[locale]}
          </p>
        </section>
      )}

      <SimilarProducts
        items={relatedItems}
        title={dict.product.youMayAlsoLike}
        subtitle={dict.product.youMayAlsoLikeSub}
      />

      <SimilarProducts
        items={mostViewedItems}
        title={dict.product.mostViewed}
        subtitle={dict.product.mostViewedSub}
        minItems={1}
      />

      <TrackProductView slug={product.slug} />
    </div>
  );
}
