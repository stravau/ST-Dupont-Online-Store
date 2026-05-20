import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { currentUserId, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { updateCartItem, removeCartItem, placeOrder } from "@/lib/actions";
import { ProductMedia } from "@/components/product-media";

export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const t = dict.cart;

  const userId = await currentUserId();
  if (!userId) redirect(`/${locale}/entrar`);

  const { lines, subtotalCents, currency } = await getCart(userId, locale);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-center font-serif text-5xl text-ink">{t.title}</h1>
      <div className="gold-rule mx-auto my-8" />

      {lines.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">{t.empty}</p>
          <Link
            href={`/${locale}/colecao`}
            className="mt-8 inline-block border border-ink px-10 py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-ink hover:text-cream"
          >
            {t.continue}
          </Link>
        </div>
      ) : (
        <div className="grid gap-14 lg:grid-cols-[1fr_360px]">
          {/* Lines */}
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((l) => (
              <li key={l.itemId} className="flex gap-5 py-6">
                <Link
                  href={`/${locale}/p/${l.productSlug}`}
                  className="block h-28 w-24 shrink-0 border border-line"
                >
                  <ProductMedia
                    image={l.image}
                    seed={l.productSlug}
                    label={l.productName}
                    className="h-full w-full"
                    sizes="96px"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        href={`/${locale}/p/${l.productSlug}`}
                        className="font-serif text-lg text-ink hover:text-gold"
                      >
                        {l.productName}
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        {t.finish}: {l.variantName}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-ink">
                      {formatPrice(l.lineCents, l.currency, locale)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-5 pt-4">
                    {/* − N + counter (same as cart popup) */}
                    <div className="inline-flex items-center border border-line">
                      <form action={updateCartItem.bind(null, locale)}>
                        <input type="hidden" name="itemId" value={l.itemId} />
                        <input type="hidden" name="quantity" value={l.quantity - 1} />
                        <button
                          type="submit"
                          aria-label="−"
                          disabled={l.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center text-sm text-ink transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-muted/60"
                        >
                          −
                        </button>
                      </form>
                      <span className="min-w-[1.75rem] border-x border-line text-center text-sm tabular-nums text-ink">
                        {l.quantity}
                      </span>
                      <form action={updateCartItem.bind(null, locale)}>
                        <input type="hidden" name="itemId" value={l.itemId} />
                        <input type="hidden" name="quantity" value={l.quantity + 1} />
                        <button
                          type="submit"
                          aria-label="+"
                          disabled={l.quantity >= 99}
                          className="flex h-8 w-8 items-center justify-center text-sm text-ink transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-muted/60"
                        >
                          +
                        </button>
                      </form>
                    </div>
                    <form action={removeCartItem.bind(null, locale)}>
                      <input type="hidden" name="itemId" value={l.itemId} />
                      <button
                        type="submit"
                        className="text-xs tracking-widest text-muted uppercase hover:text-ink"
                      >
                        {t.remove}
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Summary */}
          <aside className="h-fit border border-line bg-paper p-8">
            <p className="overline">{t.title}</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{t.subtotal}</span>
                <span className="text-ink">{formatPrice(subtotalCents, currency, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t.shipping}</span>
                <span className="text-muted">{t.shippingNote}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <span className="text-ink">{t.total}</span>
                <span className="font-serif text-xl text-ink">
                  {formatPrice(subtotalCents, currency, locale)}
                </span>
              </div>
            </div>

            <form action={placeOrder.bind(null, locale)} className="mt-8">
              <button
                type="submit"
                className="w-full bg-ink py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
              >
                {t.checkout}
              </button>
            </form>
            <p className="mt-4 text-xs leading-relaxed text-muted">{t.paymentNote}</p>

            <Link
              href={`/${locale}/colecao`}
              className="mt-6 block text-center text-xs tracking-widest text-muted uppercase hover:text-gold"
            >
              {t.continue}
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
