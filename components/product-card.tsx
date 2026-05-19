import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { type Product, formatPrice } from "@/lib/catalog";
import { addToCart } from "@/lib/actions";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductCardInteractive, type CardSwatch } from "@/components/product-card-interactive";

export function ProductCard({
  product,
  lang,
  wishlisted = false,
  variantType,
}: {
  product: Product;
  lang: Locale;
  wishlisted?: boolean;
  // When set, this card represents one pen type of the product (e.g. the
  // "Ballpoint" of the Initial line) — title, price and colours scope to it.
  variantType?: string;
}) {
  const dict = getDictionary(lang);

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
        price: formatPrice(v.priceCents, v.currency, lang),
      });
    }
  }

  const href = `/${lang}/p/${product.slug}${
    variantType ? `?t=${encodeURIComponent(variantType)}` : ""
  }`;
  const title = variantType ? `${product.name[lang]} · ${variantType}` : product.name[lang];

  return (
    <ProductCardInteractive
      href={href}
      seed={product.slug}
      title={title}
      collection={product.collection}
      noveltyLabel={product.novelty ? dict.sections.novelties : null}
      fromLabel={dict.product.from}
      colorWord={dict.product.colorLabel.toLowerCase()}
      fallbackImage={product.image}
      swatches={swatches}
      basePrice={formatPrice(base.priceCents, base.currency, lang)}
      baseSku={base.sku}
      addAction={addToCart.bind(null, lang)}
      addToCartLabel={dict.cart.addToCart}
      addedLabel={dict.cart.added}
      viewCartLabel={dict.cart.viewCart}
      cartHref={`/${lang}/carrinho`}
      wishlist={
        <WishlistButton
          productId={product.id}
          lang={lang}
          initialActive={wishlisted}
          label={dict.client.addToWishlist}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/80 backdrop-blur"
        />
      }
    />
  );
}
