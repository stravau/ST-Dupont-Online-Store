import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { type Product, formatPrice } from "@/lib/catalog";
import { ProductMedia } from "@/components/product-media";
import { StatusPill } from "@/components/status-pill";
import { WishlistButton } from "@/components/wishlist-button";

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

  // Distinct colour options (for the hover preview swatches)
  const colors: { label: string; hex: string[] }[] = [];
  for (const v of list) {
    const c = v.attributes.color;
    if (c && !colors.some((x) => x.label === c.label[lang])) {
      colors.push({ label: c.label[lang], hex: c.hex });
    }
  }

  const href = `/${lang}/p/${product.slug}${
    variantType ? `?t=${encodeURIComponent(variantType)}` : ""
  }`;
  const title = variantType
    ? `${product.name[lang]} · ${variantType}`
    : product.name[lang];

  const swatchStyle = (hex: string[]) =>
    hex.length > 1
      ? { background: `linear-gradient(135deg, ${hex[0]} 0 50%, ${hex[1]} 50% 100%)` }
      : { background: hex[0] };

  return (
    <article className="lux-hover relative overflow-hidden border border-line bg-paper">
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton
          productId={product.id}
          lang={lang}
          initialActive={wishlisted}
          label={dict.client.addToWishlist}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/80 backdrop-blur"
        />
      </div>

      <Link href={href} className="group block">
        <div className="relative aspect-[5/6] overflow-hidden">
          <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            <ProductMedia
              image={product.image}
              seed={product.slug}
              label={title}
              className="h-full w-full"
            />
          </div>
          {product.novelty && (
            <span className="overline absolute left-4 top-4 bg-ink/85 px-3 py-1 text-paper">
              {dict.sections.novelties}
            </span>
          )}

          {/* Colour preview — quiet by default, revealed on hover */}
          {colors.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-ink/30 to-transparent py-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              {colors.slice(0, 6).map((c) => (
                <span
                  key={c.label}
                  title={c.label}
                  className="h-4 w-4 rounded-full ring-1 ring-paper/70"
                  style={swatchStyle(c.hex)}
                />
              ))}
              {colors.length > 6 && (
                <span className="text-[0.6rem] text-paper">+{colors.length - 6}</span>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-6 text-center">
          <p className="overline text-[0.6rem]">{product.collection}</p>
          <h3 className="mt-2 font-serif text-xl text-ink">{title}</h3>
          <p className="mt-3 text-sm text-muted">
            {dict.product.from}{" "}
            <span className="text-ink">{formatPrice(base.priceCents, base.currency, lang)}</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <StatusPill lang={lang} />
            {colors.length > 1 && (
              <span className="text-[0.6rem] tracking-[0.16em] text-muted uppercase">
                {colors.length} {dict.product.colorLabel.toLowerCase()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
