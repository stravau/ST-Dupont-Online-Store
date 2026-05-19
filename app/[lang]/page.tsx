import Link from "next/link";
import Image from "next/image";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getCategories, getNovelties } from "@/lib/catalog";
import { myWishlistIds } from "@/lib/cart";
import { categoryArt } from "@/lib/category-art";
import { STORE } from "@/lib/store-info";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { ScrollCue } from "@/components/scroll-cue";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const [categories, novelties, wl] = await Promise.all([
    getCategories(),
    getNovelties(6),
    myWishlistIds(),
  ]);

  return (
    <>
      {/* Cinematic hero + the four Arts — one continuous midnight backdrop.
          monogram-bg lives on the wrapper so its top→bottom gradient spans
          both sections seamlessly (no per-section restart / visible seam). */}
      <div className="monogram-bg">
      <section className="text-cream">
        <div className="relative flex min-h-[calc((100svh-5rem)/0.9)] items-center justify-center px-6 text-center">
          {/* Lettering — vertically centred on the blue, elements tightened */}
          <div className="flex flex-col items-center">
            <p className="overline text-gold-soft">{dict.hero.eyebrow}</p>
            <h1 className="mt-3 font-serif text-5xl font-light leading-tight md:text-7xl">
              {dict.hero.title}
            </h1>
            <div className="gold-rule mx-auto my-5" />
            <p className="mx-auto max-w-xl text-base font-light text-cream/70 md:text-lg">
              {dict.hero.subtitle}
            </p>
            <Link
              href={`/${locale}/colecao`}
              className="mt-7 inline-block border border-gold-soft px-10 py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold-soft hover:text-ink"
            >
              {dict.hero.cta}
            </Link>
          </div>

          {/* Cue pinned near the bottom so the lettering stays centred */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <ScrollCue label={dict.sections.categories} />
          </div>
        </div>
      </section>

      {/* The four Arts. One continuous blue with the hero (no white gap);
          the section fills a screen & centres the grid so the arrow lands
          mid-screen, and the blue ends at the section foot — before the
          "New Arrivals" title. */}
      <section
        id="maisons"
        className="text-cream flex scroll-mt-20 flex-col lg:min-h-[calc((100svh-5rem)/0.9)] lg:justify-center"
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16 lg:py-24">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {categories.map((c, i) => (
                <Link
                  key={c.slug}
                  href={`/${locale}/c/${c.slug}`}
                  className={`lux-hover reveal reveal-d${i % 4} group relative flex aspect-[16/9] flex-col justify-end overflow-hidden border border-cream/15 text-center lg:aspect-[2/1]`}
                >
                  <Image
                    src={`/maisons/${c.slug}.jpg`}
                    alt={c.name[locale]}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                      c.slug === "isqueiros" ? "object-[center_25%]" : "object-center"
                    }`}
                  />
                {/* Blend scrim — keeps the lettering legible over the photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
                <div className="relative z-10 w-full px-5 pb-7">
                  <p className="overline text-[0.6rem] text-gold-soft">{c.name[locale]}</p>
                  <h3 className="mt-2 font-serif text-xl text-cream md:text-2xl">
                    {categoryArt[c.slug]?.art ?? c.name[locale]}
                  </h3>
                  <span className="mx-auto mt-3 block h-px w-8 bg-cream/40 transition-all duration-300 group-hover:w-14 group-hover:bg-gold" />
                </div>
              </Link>
              ))}
            </div>
        </div>
      </section>
      </div>

      {/* Novidades grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-24">
        <div className="reveal text-center">
          <p className="overline">{dict.sections.novelties}</p>
          <h2 className="mt-4 font-serif text-4xl text-ink">{dict.sections.noveltiesSub}</h2>
          <div className="gold-rule mx-auto mt-6" />
        </div>
        <div className="product-grid mt-14 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {novelties.map((p, i) => (
            <div key={p.slug} className={`reveal reveal-d${i % 4}`}>
              <ProductCard product={p} lang={locale} wishlisted={wl.has(p.id)} />
            </div>
          ))}
        </div>
      </section>

      {/* Heritage — gold-on-black */}
      <section className="monogram-bg text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-28 md:grid-cols-2">
          <div className="reveal">
            <p className="overline text-gold-soft">{dict.sections.heritageEyebrow}</p>
            <h2 className="mt-6 font-serif text-4xl leading-snug md:text-5xl">
              {dict.sections.heritageTitle}
            </h2>
            <div className="gold-rule my-7" />
            <p className="text-cream/70">{dict.sections.heritageBody}</p>
            <Link
              href={`/${locale}/historia`}
              className="mt-9 inline-block text-xs tracking-[0.22em] text-gold-soft uppercase transition-colors hover:text-cream"
            >
              {dict.sections.heritageCta} →
            </Link>
          </div>
          <div className="reveal reveal-d2 aspect-square border border-gold-soft/30">
            <ProductImage seed="heritage-1872" label="S.T. Dupont — 1872" className="h-full w-full opacity-90" />
          </div>
        </div>
      </section>

      {/* Boutique */}
      <section className="reveal mx-auto max-w-3xl px-6 py-28 text-center">
        <p className="overline">{dict.sections.boutiqueEyebrow}</p>
        <h2 className="mt-5 font-serif text-4xl text-ink">{dict.sections.boutiqueTitle}</h2>
        <div className="gold-rule mx-auto my-7" />
        <p className="text-muted">{dict.sections.boutiqueBody}</p>
        <p className="mt-6 text-sm tracking-widest text-ink uppercase">
          {STORE.venue} · {STORE.street} · {locale === "pt" ? "Piso 0" : "Floor 0"}
        </p>
        <Link
          href={`/${locale}/loja`}
          className="mt-9 inline-block border border-ink px-10 py-4 text-xs tracking-[0.22em] text-ink uppercase transition-colors duration-300 hover:bg-ink hover:text-cream"
        >
          {dict.footer.viewStore}
        </Link>
      </section>
    </>
  );
}
