import Link from "next/link";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getCategories, getNovelties } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const categories = getCategories();
  const novelties = getNovelties(6);

  return (
    <>
      {/* Cinematic hero */}
      <section className="monogram-bg relative flex min-h-[82vh] items-center justify-center text-center text-cream">
        <div className="px-6">
          <p className="overline text-gold-soft">{dict.hero.eyebrow}</p>
          <h1 className="mt-6 font-serif text-5xl font-light leading-tight md:text-7xl">
            {dict.hero.title}
          </h1>
          <div className="gold-rule mx-auto my-8" />
          <p className="mx-auto max-w-xl text-base font-light text-cream/70 md:text-lg">
            {dict.hero.subtitle}
          </p>
          <Link
            href={`/${locale}/c/isqueiros`}
            className="mt-10 inline-block border border-gold-soft px-10 py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold-soft hover:text-ink"
          >
            {dict.hero.cta}
          </Link>
        </div>
      </section>

      {/* Category cards */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="overline">{dict.sections.categories}</p>
          <div className="gold-rule mx-auto mt-5" />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.slug} href={`/${locale}/c/${c.slug}`} className="group block">
              <div className="lux-hover overflow-hidden border border-line">
                <div className="aspect-[4/5] overflow-hidden">
                  <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                    <ProductImage seed={c.slug} label={c.name[locale]} className="h-full w-full" />
                  </div>
                </div>
                <div className="bg-paper px-6 py-7 text-center">
                  <h3 className="font-serif text-2xl text-ink">{c.name[locale]}</h3>
                  <p className="mt-2 text-sm text-muted">{c.tagline[locale]}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Novidades grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="text-center">
          <p className="overline">{dict.sections.novelties}</p>
          <h2 className="mt-4 font-serif text-4xl text-ink">{dict.sections.noveltiesSub}</h2>
          <div className="gold-rule mx-auto mt-6" />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {novelties.map((p) => (
            <ProductCard key={p.slug} product={p} lang={locale} />
          ))}
        </div>
      </section>

      {/* Heritage — gold-on-black */}
      <section className="monogram-bg text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-28 md:grid-cols-2">
          <div>
            <p className="overline text-gold-soft">{dict.sections.heritageEyebrow}</p>
            <h2 className="mt-6 font-serif text-4xl leading-snug md:text-5xl">
              {dict.sections.heritageTitle}
            </h2>
            <div className="gold-rule my-7" />
            <p className="text-cream/70">{dict.sections.heritageBody}</p>
            <Link
              href={`/${locale}`}
              className="mt-9 inline-block text-xs tracking-[0.22em] text-gold-soft uppercase transition-colors hover:text-cream"
            >
              {dict.sections.heritageCta} →
            </Link>
          </div>
          <div className="aspect-square border border-gold-soft/30">
            <ProductImage seed="heritage-1872" label="S.T. Dupont — 1872" className="h-full w-full opacity-90" />
          </div>
        </div>
      </section>

      {/* Boutique */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <p className="overline">{dict.sections.boutiqueEyebrow}</p>
        <h2 className="mt-5 font-serif text-4xl text-ink">{dict.sections.boutiqueTitle}</h2>
        <div className="gold-rule mx-auto my-7" />
        <p className="text-muted">{dict.sections.boutiqueBody}</p>
        <p className="mt-6 text-sm tracking-widest text-ink uppercase">
          El Corte Inglés · Av. António Augusto de Aguiar 31 · Lisboa
        </p>
      </section>
    </>
  );
}
