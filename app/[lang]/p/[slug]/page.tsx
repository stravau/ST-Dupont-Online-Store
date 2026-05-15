import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, locales, type Locale } from "@/lib/i18n";
import { getProduct, products, getCategory, formatPrice } from "@/lib/catalog";
import { estimatedDeliveryDate } from "@/lib/delivery";
import { ProductMedia } from "@/components/product-media";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusPill } from "@/components/status-pill";
import { VariantSelector } from "@/components/variant-selector";

export function generateStaticParams() {
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = getProduct(slug);
  if (!isLocale(lang) || !product) return {};
  return { title: product.name[lang as Locale], description: product.description[lang as Locale] };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const product = getProduct(slug);
  if (!product) notFound();
  const dict = getDictionary(locale);
  const cat = getCategory(product.categorySlug)!;

  const variantOptions = product.variants.map((v) => ({
    sku: v.sku,
    name: v.name[locale],
    price: formatPrice(v.priceCents, v.currency, locale),
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: `/${locale}` },
          { label: cat.name[locale], href: `/${locale}/c/${product.categorySlug}` },
          { label: product.name[locale] },
        ]}
      />

      <div className="mt-10 grid gap-14 md:grid-cols-2">
        <div className="aspect-[5/6] border border-line">
          <ProductMedia
            image={product.image}
            seed={product.slug}
            label={product.name[locale]}
            className="h-full w-full"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <p className="overline">
              {cat.name[locale]} · {product.collection}
            </p>
            <StatusPill lang={locale} />
          </div>
          <h1 className="mt-4 font-serif text-4xl text-ink md:text-5xl">{product.name[locale]}</h1>
          <div className="gold-rule my-7" />
          <p className="text-muted">{product.description[locale]}</p>

          <div className="mt-10">
            <VariantSelector
              variants={variantOptions}
              labels={{
                selectFinish: dict.product.selectFinish,
                finishes: dict.product.finishes,
                addToCart: dict.product.addToCart,
              }}
            />
          </div>

          <p className="mt-4 text-center text-xs tracking-widest text-muted uppercase">
            {dict.product.deliveryBy} {estimatedDeliveryDate(locale)}
          </p>

          {/* Lifetime-service reassurance — a luxury cue st-dupont.com buries */}
          <div className="mt-8 grid gap-3 border-t border-line pt-6 text-sm text-muted sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <span className="text-gold">—</span> {dict.product.returns}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-gold">—</span> {dict.product.lifetime}
            </p>
          </div>

          <div className="mt-6 flex gap-6 text-xs tracking-[0.16em] uppercase">
            <Link href={`/${locale}`} className="text-muted transition-colors hover:text-gold">
              {dict.product.needHelp}
            </Link>
            <Link href={`/${locale}`} className="text-muted transition-colors hover:text-gold">
              {dict.product.findStore}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
