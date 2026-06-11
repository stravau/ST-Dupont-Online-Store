import type { Product } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { expandProductCards } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

// "You may also like" — horizontal-scroll slider at the bottom of every
// product detail page. Each card is one (product, colourway) tile, same
// component the listing pages use. Pure CSS snap-x scrolling, no JS — the
// thumb of the browser's overflow scroll is more accessible than a custom
// carousel and works identically on touch + trackpad.
export function SimilarProducts({
  products,
  lang,
  title,
  subtitle,
}: {
  products: Product[];
  lang: Locale;
  title: string;
  subtitle?: string;
}) {
  const cards = products.flatMap((p) => expandProductCards(p)).slice(0, 15);
  if (cards.length < 4) return null;

  return (
    <section className="mt-20 border-t border-line pt-16">
      <div className="reveal text-center">
        <p className="overline">{title}</p>
        {subtitle && <p className="mt-4 text-sm text-muted">{subtitle}</p>}
        <div className="gold-rule mx-auto mt-7" />
      </div>

      {/* `-mx-6 px-6 scroll-px-6` lets the row bleed past the parent's
          padding so the first card snaps flush to the viewport edge while
          the rest of the page stays centred. `snap-x snap-mandatory` makes
          each card click into place; touch-pan-x keeps mobile scroll
          predictable. Hides the scrollbar via no-scrollbar (defined below
          in globals.css) for the cleaner luxury look. */}
      <div className="no-scrollbar mt-10 -mx-6 overflow-x-auto px-6 pb-4 scroll-px-6 snap-x snap-mandatory touch-pan-x">
        <ul className="flex gap-5 sm:gap-7">
          {cards.map(({ product, sku }, i) => (
            <li
              key={`${product.slug}-${sku}`}
              className={`reveal reveal-d${i % 4} snap-start shrink-0 w-[60vw] sm:w-[280px] lg:w-[300px]`}
            >
              <ProductCard product={product} lang={lang} variantSku={sku} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
