import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { currentUserId, getOrders } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { lang } = await params;
  const { placed } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const c = getDictionary(locale).client;

  const userId = await currentUserId();
  if (!userId) redirect(`/${locale}/entrar`);
  const orders = await getOrders(userId);

  return (
    <div>
      <h1 className="font-serif text-4xl text-ink">{c.orders}</h1>

      {placed && (
        <p className="mt-6 border border-gold/40 bg-paper px-4 py-3 text-sm text-ink">
          {c.orderPlaced}
        </p>
      )}

      {orders.length === 0 ? (
        <p className="mt-10 text-muted">{c.noOrders}</p>
      ) : (
        <ul className="mt-10 space-y-6">
          {orders.map((o) => (
            <li key={o.id} className="border border-line bg-paper p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div>
                  <p className="font-serif text-lg text-ink">
                    {c.orderNumber} {o.orderNumber}
                  </p>
                  <p className="mt-1 text-xs tracking-widest text-muted uppercase">
                    {new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-IE", {
                      dateStyle: "long",
                    }).format(o.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="overline text-gold">
                    {c.statusLabels[o.status as keyof typeof c.statusLabels]}
                  </span>
                  <p className="mt-1 font-serif text-lg text-ink">
                    {formatPrice(o.totalCents, o.currency, locale)}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {it.name} · {it.sku} × {it.quantity}
                    </span>
                    <span className="text-ink">
                      {formatPrice(it.priceCents * it.quantity, o.currency, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/${locale}/colecao`}
        className="mt-12 inline-block text-xs tracking-[0.2em] text-muted uppercase hover:text-gold"
      >
        {getDictionary(locale).cart.continue} →
      </Link>
    </div>
  );
}
