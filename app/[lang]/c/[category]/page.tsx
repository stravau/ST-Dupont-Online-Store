import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import {
  getCategory,
  getCategories,
  getProductsByCategory,
  getCollections,
} from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getCategories().map((c) => ({ lang, category: c.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const cat = getCategory(category);
  if (!isLocale(lang) || !cat) return {};
  return { title: cat.name[lang as Locale] };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; category: string }>;
  searchParams: Promise<{ col?: string }>;
}) {
  const { lang, category } = await params;
  const { col } = await searchParams;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const cat = getCategory(category);
  if (!cat) notFound();
  const dict = getDictionary(locale);
  const collections = getCollections(category);
  const activeCol = col && collections.includes(col) ? col : undefined;
  const items = getProductsByCategory(category, activeCol);
  const base = `/${locale}/c/${category}`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: `/${locale}` },
          { label: cat.name[locale], href: base },
          ...(activeCol ? [{ label: activeCol }] : []),
        ]}
      />

      <header className="mt-10 text-center">
        <p className="overline">{cat.tagline[locale]}</p>
        <h1 className="mt-5 font-serif text-5xl text-ink">{cat.name[locale]}</h1>
        <div className="gold-rule mx-auto mt-7" />
        <p className="mt-5 text-sm text-muted">
          {items.length} {locale === "pt" ? "peças" : "pieces"}
        </p>
      </header>

      {/* Collection filter strip (the discoverable axis st-dupont.com surfaces) */}
      <nav className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={base}
          className={`border px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors ${
            !activeCol ? "border-gold text-ink" : "border-line text-muted hover:text-ink"
          }`}
        >
          {dict.nav.viewAll}
        </Link>
        {collections.map((c) => (
          <Link
            key={c}
            href={`${base}?col=${encodeURIComponent(c)}`}
            className={`border px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors ${
              activeCol === c ? "border-gold text-ink" : "border-line text-muted hover:text-ink"
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} lang={locale} />
        ))}
      </div>
    </div>
  );
}
