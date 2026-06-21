import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { isLocale, getDictionary, locales, type Locale } from "@/lib/i18n";
import { localeCategorySlug } from "@/lib/category-slugs";
import { getNovelties, expandProductCards } from "@/lib/catalog";
import { STORE } from "@/lib/store-info";
import { ProductCard } from "@/components/product-card";
import { ScrollCue } from "@/components/scroll-cue";
import { notFound } from "next/navigation";

// 8 home-page tiles — mirror the official st-dupont.com homepage layout.
// Each tile carries an image scraped from the live Maison site (in
// /public/categories-home) and routes to the right place in our catalogue.
function homeCategories(locale: Locale) {
  const c = (canonical: string) => `/${locale}/c/${localeCategorySlug(locale, canonical)}`;
  return [
    { key: "lighters", labelPt: "Isqueiros", labelEn: "Lighters", href: c("isqueiros"), img: "/categories-home/lighters.jpg" },
    { key: "writing", labelPt: "Instrumentos de Escrita", labelEn: "Writing Instruments", href: c("escrita"), img: "/categories-home/writing.jpg" },
    { key: "cigar-cases", labelPt: "Estojos de Charuto", labelEn: "Cigar Cases", href: `/${locale}/t/smoking?type=cases`, img: "/categories-home/cigar-cases.jpg" },
    { key: "cigar-accessories", labelPt: "Acessórios de Charuto", labelEn: "Cigar Accessories", href: `/${locale}/t/smoking`, img: "/categories-home/cigar-accessories.jpg" },
    { key: "small-leather", labelPt: "Pequena Marroquinaria", labelEn: "Small Leather Goods", href: `/${locale}/t/small-leather`, img: "/categories-home/small-leather.jpg" },
    { key: "leather", labelPt: "Marroquinaria", labelEn: "Leather Goods", href: c("pele"), img: "/categories-home/leather.jpg" },
    { key: "cufflinks", labelPt: "Botões de Punho", labelEn: "Cufflinks", href: `/${locale}/t/cufflinks`, img: "/categories-home/cufflinks.jpg" },
    { key: "belts", labelPt: "Cintos", labelEn: "Belts", href: `/${locale}/t/belts`, img: "/categories-home/belts.jpg" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  const title =
    lang === "pt"
      ? "S.T. Dupont — Maison de Luxe Française · Lisboa"
      : "S.T. Dupont — French Luxury Maison · Lisbon";
  const description =
    lang === "pt"
      ? `${dict.hero.subtitle} Boutique no El Corte Inglés Lisboa.`
      : `${dict.hero.subtitle} Boutique at El Corte Inglés Lisbon.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title,
      description,
      url: `/${lang}`,
      locale: lang === "pt" ? "pt_PT" : "en_GB",
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const novelties = await getNovelties(8);
  const tiles = homeCategories(locale);

  return (
    <>
      {/* Cinematic hero: full-viewport Maison video. The negative top margin
          slides the section up to the very top of the viewport so the video
          sits behind the (transparent at first paint) sticky header — and
          the section height is grown by the same amount so the BOTTOM still
          reaches the viewport bottom (otherwise the cream of the categories
          section showed through as a thin strip). bg-ink keeps the dark
          base showing during the video's initial buffer so a cream/light
          strip never flashes through. */}
      <section className="relative -mt-20 h-[calc(100svh+5rem)] overflow-hidden bg-ink text-cream sm:-mt-24 sm:h-[calc(100svh+6rem)]">
        {/* The Maison ships two crops — portrait for mobile, landscape for
            desktop. autoplay / muted / loop / playsInline is the combo
            modern browsers permit; preload='auto' kicks the buffer
            immediately. Poster attribute intentionally omitted — the
            previous fallback flashed the old hero PNG for a split second
            on every page refresh. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-0 h-full w-full object-cover object-center sm:hidden"
        >
          <source src="/videos/hero-mobile.mp4" type="video/mp4" />
        </video>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-0 hidden h-full w-full object-cover sm:block"
        >
          <source src="/videos/hero-desktop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink/40 via-ink/10 to-ink/60" />

        {/* Cohiba CTA — desktop only. Pinned to the bottom-left corner of
            the video with the Maison-style minimal cue: the wordmark in
            the display serif, an understated DISCOVER link below. Lifted
            high enough off the bottom that the centred scroll cue doesn't
            visually crash into it on shorter desktop viewports. */}
        <Link
          href={`/${locale}/c/${localeCategorySlug(locale, "isqueiros")}?col=Cohiba`}
          className="reveal reveal-d2 absolute bottom-32 left-12 z-20 hidden text-cream sm:block lg:bottom-40 lg:left-16"
        >
          <h1 className="font-serif text-4xl uppercase tracking-wide md:text-5xl lg:text-6xl">
            {dict.hero.cohibaWordmark}
          </h1>
          <span className="mt-3 inline-block border-b border-cream/60 pb-1 text-xs tracking-[0.22em] uppercase transition-colors hover:border-gold-soft hover:text-gold-soft">
            {dict.hero.discover}
          </span>
        </Link>

        {/* Mobile-only Cohiba CTA — sits OVER the video, centred, just above
            the scroll cue, hidden on sm+ (desktop has its own copy pinned
            bottom-left of the video). */}
        <Link
          href={`/${locale}/c/${localeCategorySlug(locale, "isqueiros")}?col=Cohiba`}
          className="reveal reveal-d2 absolute bottom-32 left-1/2 z-20 -translate-x-1/2 text-center text-cream sm:hidden"
        >
          <h2 className="font-serif text-xl whitespace-nowrap uppercase tracking-wide">
            {dict.hero.cohibaWordmark}
          </h2>
          <span className="mt-2 inline-block border-b border-cream/60 pb-1 text-[0.65rem] tracking-[0.22em] uppercase">
            {dict.hero.discover}
          </span>
        </Link>

        {/* Scroll cue — bottom centre. Points to #categories and uses the
            "Find the perfect gift" label so it matches the section it
            scrolls to. */}
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <ScrollCue label={dict.home.findGiftTitle} href="#categories" />
        </div>
      </section>

      {/* 8 category tiles — mirrors the official st-dupont.com homepage grid.
          Title + subtitle introduce the section ("Find the perfect gift").
          Each card opens to its destination in our catalogue. */}
      <section id="categories" className="scroll-mt-20 bg-cream">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="reveal mb-12 text-center">
            <h2 className="font-serif text-4xl text-ink md:text-5xl">{dict.home.findGiftTitle}</h2>
            <p className="mt-4 text-muted md:text-lg">{dict.home.findGiftSub}</p>
            <div className="gold-rule mx-auto mt-7" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {tiles.map((t, i) => (
              <Link
                key={t.key}
                href={t.href}
                className={`lux-hover reveal reveal-d${i % 4} group relative flex aspect-[4/5] flex-col justify-end overflow-hidden border border-line/40`}
              >
                <Image
                  src={t.img}
                  alt={locale === "pt" ? t.labelPt : t.labelEn}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                <div className="relative z-10 w-full px-4 pb-5 text-center">
                  <h3 className="font-serif text-base text-cream md:text-lg">
                    {locale === "pt" ? t.labelPt : t.labelEn}
                  </h3>
                  <span className="mx-auto mt-2 block h-px w-6 bg-cream/40 transition-all duration-300 group-hover:w-12 group-hover:bg-gold-soft" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Novidades grid — top padding kept tight; the maisons grid above
          already has pb-16/20/24 of breathing room. */}
      <section className="mx-auto max-w-7xl px-6 pb-28 pt-10 sm:pt-12 lg:pt-16">
        <div className="reveal text-center">
          <p className="overline">{dict.sections.novelties}</p>
          <h2 className="mt-5 font-serif text-4xl text-ink">{dict.sections.noveltiesSub}</h2>
          <div className="gold-rule mx-auto mt-7" />
        </div>
        <div className="product-grid mt-14 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8">
          {novelties.flatMap(expandProductCards).slice(0, 8).map(({ product, sku }, i) => (
            <div
              key={`${product.slug}-${sku}`}
              className={`reveal reveal-d${i % 4} ${i >= 6 ? "hidden lg:block" : ""}`}
            >
              <ProductCard product={product} lang={locale} variantSku={sku} />
            </div>
          ))}
        </div>
      </section>

      {/* Heritage — gold-on-black */}
      <section className="monogram-bg text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-28 md:grid-cols-2">
          <div className="reveal text-center">
            <p className="overline text-gold-soft">{dict.sections.heritageEyebrow}</p>
            <h2 className="mt-6 font-serif text-4xl leading-snug md:text-5xl">
              {dict.sections.heritageTitle}
            </h2>
            <div className="gold-rule mx-auto my-7" />
            <p className="text-cream/70">{dict.sections.heritageBody}</p>
            <Link
              href={`/${locale}/historia`}
              className="mt-9 inline-block text-xs tracking-[0.22em] text-gold-soft uppercase transition-colors hover:text-cream"
            >
              {dict.sections.heritageCta} →
            </Link>
          </div>
          <div className="reveal reveal-d2 relative aspect-square overflow-hidden border border-gold-soft/30">
            <Image
              src="/heritage/heritage-1872.png"
              alt="S.T. Dupont — 1872"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-95"
            />
          </div>
        </div>
      </section>

      {/* Boutique */}
      <section className="reveal mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="overline">{dict.sections.boutiqueEyebrow}</p>
        <h2 className="mt-6 font-serif text-4xl text-ink">{dict.sections.boutiqueTitle}</h2>
        <div className="gold-rule mx-auto my-8" />
        <p className="text-muted">{dict.sections.boutiqueBody}</p>
        <p className="mt-8 text-sm tracking-widest text-ink uppercase">
          {STORE.venue} · {STORE.street} · {locale === "pt" ? "Piso 0" : "Floor 0"}
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href={`/${locale}/loja`}
            className="inline-block bg-ink px-10 py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            {dict.footer.viewStore}
          </Link>
        </div>
      </section>
    </>
  );
}
