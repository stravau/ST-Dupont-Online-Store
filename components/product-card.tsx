import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { type Product, fromPrice, formatPrice } from "@/lib/catalog";
import { ProductMedia } from "@/components/product-media";
import { StatusPill } from "@/components/status-pill";

export function ProductCard({ product, lang }: { product: Product; lang: Locale }) {
  const dict = getDictionary(lang);
  const base = fromPrice(product);

  return (
    <Link href={`/${lang}/p/${product.slug}`} className="group block">
      <article className="lux-hover overflow-hidden border border-line bg-paper">
        <div className="relative aspect-[5/6] overflow-hidden">
          <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            <ProductMedia
              image={product.image}
              seed={product.slug}
              label={product.name[lang]}
              className="h-full w-full"
            />
          </div>
          {product.novelty && (
            <span className="overline absolute left-4 top-4 bg-ink/85 px-3 py-1 text-paper">
              {dict.sections.novelties}
            </span>
          )}
        </div>
        <div className="px-6 py-6 text-center">
          <p className="overline text-[0.6rem]">{product.collection}</p>
          <h3 className="mt-2 font-serif text-xl text-ink">{product.name[lang]}</h3>
          <p className="mt-3 text-sm text-muted">
            {dict.product.from}{" "}
            <span className="text-ink">{formatPrice(base.priceCents, base.currency, lang)}</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <StatusPill lang={lang} />
            {product.variants.length > 1 && (
              <span className="flex items-center gap-1" aria-hidden>
                {product.variants.slice(0, 4).map((v) => (
                  <span key={v.sku} className="h-1.5 w-1.5 rounded-full bg-line" />
                ))}
                {product.variants.length > 4 && (
                  <span className="text-[0.6rem] text-muted">+{product.variants.length - 4}</span>
                )}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
