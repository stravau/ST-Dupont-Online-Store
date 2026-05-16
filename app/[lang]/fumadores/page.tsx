import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getProduct, type Product } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { smokingTypes } from "@/lib/smoking";
import { ProductCard } from "@/components/product-card";

const TITLE = { pt: "Acessórios para Fumadores", en: "Smoking Accessories" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: TITLE[lang as Locale] };
}

export default async function SmokingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { lang } = await params;
  const { type } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const active = smokingTypes.find((s) => s.key === type) ?? smokingTypes[0];

  const [products, wl] = await Promise.all([
    Promise.all(active.slugs.map((s) => getProduct(s))),
    myWishlistIds(),
  ]);
  const items = products.filter(Boolean) as Product[];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="text-center">
        <p className="overline">L&apos;Art du Feu</p>
        <h1 className="mt-5 font-serif text-5xl text-ink md:text-6xl">{TITLE[locale]}</h1>
        <div className="gold-rule mx-auto mt-7" />
      </header>

      {/* Choose the type of accessory */}
      <nav className="mt-12 flex flex-wrap justify-center gap-3">
        {smokingTypes.map((s) => (
          <Link
            key={s.key}
            href={`/${locale}/fumadores?type=${s.key}`}
            className={`rounded-full border px-6 py-3 text-xs tracking-[0.18em] uppercase transition-colors duration-300 ${
              s.key === active.key
                ? "border-gold bg-ink text-cream"
                : "border-line text-muted hover:border-gold hover:text-ink"
            }`}
          >
            {s.label[locale]}
          </Link>
        ))}
      </nav>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} lang={locale} wishlisted={wl.has(p.id)} />
        ))}
      </div>
    </div>
  );
}
