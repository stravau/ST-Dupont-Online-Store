import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getProduct, getCategory, formatPrice } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { addToCart } from "@/lib/actions";
import { estimatedDeliveryDate } from "@/lib/delivery";
import { ProductMedia } from "@/components/product-media";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StatusPill } from "@/components/status-pill";
import { VariantSelector } from "@/components/variant-selector";
import { WishlistButton } from "@/components/wishlist-button";

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
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
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

          <div className="mt-10">
            <VariantSelector
              variants={variantOptions}
              lang={locale}
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
