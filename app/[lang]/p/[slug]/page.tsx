import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getProduct, getCategory, formatPrice } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { addToCart } from "@/lib/actions";
import { estimatedDeliveryDate } from "@/lib/delivery";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusPill } from "@/components/status-pill";
import { ProductDetail } from "@/components/product-detail";
import { WishlistButton } from "@/components/wishlist-button";
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
    image: v.image,
  }));

  const wl = await myWishlistIds();
  const addAction = addToCart.bind(null, locale);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: `/${locale}` },
          { label: cat.name[locale], href: `/${locale}/c/${product.categorySlug}` },
          { label: product.name[locale] },
        ]}
      />

      <ProductDetail
        fallbackImage={product.image}
        seed={product.slug}
        label={product.name[locale]}
        variants={variantOptions}
        lang={locale}
        initialType={typeParam}
        initialSku={skuParam}
        addAction={addAction}
        labels={{
          typeLabel: dict.product.typeLabel,
          selectType: dict.product.selectType,
          finishes: dict.product.finishes,
          selectFinish: dict.product.selectFinish,
          colorLabel: dict.product.colorLabel,
          selectColor: dict.product.selectColor,
          addToCart: dict.product.addToCart,
          added: dict.cart.added,
          viewCart: dict.cart.viewCart,
        }}
        header={
          <>
            <div className="flex items-center justify-between">
              <p className="overline">
                {cat.name[locale]} · {product.collection}
              </p>
              <StatusPill lang={locale} />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <h1 className="font-serif text-4xl text-ink md:text-5xl">{product.name[locale]}</h1>
              <WishlistButton
                productId={product.id}
                lang={locale}
                initialActive={wl.has(product.id)}
                label={dict.client.addToWishlist}
                className="mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line"
              />
            </div>
            <div className="gold-rule my-7" />
            <p className="text-muted">{product.description[locale]}</p>
          </>
        }
        extras={
          <>
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
              <a href={`#${CONTACT_ANCHOR}`} className="text-muted transition-colors hover:text-gold">
                {dict.product.needHelp}
              </a>
              <Link href={`/${locale}/loja`} className="text-muted transition-colors hover:text-gold">
                {dict.product.findStore}
              </Link>
            </div>
          </>
        }
      />

      {product.history && (
        <section className="mx-auto mt-24 max-w-3xl border-t border-line pt-16 text-center">
          <p className="overline">
            {dict.product.heritage} · {product.collection}
          </p>
          <div className="gold-rule mx-auto my-6" />
          <p className="font-serif text-xl leading-relaxed text-ink md:text-2xl">
            {product.history[locale]}
          </p>
        </section>
      )}
    </div>
  );
}
