import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { currentUserId, getWishlistProducts } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { ProductMedia } from "@/components/product-media";
import { WishlistButton } from "@/components/wishlist-button";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const c = dict.client;

  const userId = await currentUserId();
  if (!userId) redirect(`/${locale}/entrar`);
  const items = await getWishlistProducts(userId, locale);

  return (
    <div>
      <h1 className="font-serif text-4xl text-ink">{c.wishlist}</h1>

      {items.length === 0 ? (
        <p className="mt-10 text-muted">{c.noWishlist}</p>
      ) : (
        <div className="product-grid mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {items.map((p) => (
            <article
              key={p.slug}
              className="lux-hover relative overflow-hidden border border-line bg-paper"
            >
              <div className="absolute right-3 top-3 z-10">
                <WishlistButton
                  productId={p.id}
                  lang={locale}
                  initialActive
                  label={c.removeWishlist}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/80 backdrop-blur"
                />
              </div>
              <Link href={`/${locale}/p/${p.slug}`} className="group block">
                <div className="aspect-[20/17] overflow-hidden">
                  <div className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]">
                    <ProductMedia
                      image={p.image}
                      seed={p.slug}
                      label={p.name}
                      className="h-full w-full"
                    />
                  </div>
                </div>
                <div className="px-6 py-6 text-center">
                  <p className="overline text-[0.6rem]">{p.collection}</p>
                  <h3 className="mt-2 font-serif text-xl text-ink">{p.name}</h3>
                  <p className="mt-3 text-sm text-muted">
                    {dict.product.from}{" "}
                    <span className="text-ink">
                      {formatPrice(p.fromCents, p.currency, locale)}
                    </span>
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
