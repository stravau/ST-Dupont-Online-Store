import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { STORES, type StoreInfo } from "@/lib/store-info";
import { StoreMap } from "@/components/store-map";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang as Locale);
  return { title: dict.store.title, description: dict.store.lede };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const s = dict.store;
  const floor = locale === "pt" ? "Piso 0" : "Floor 0";

  const heroCta = (store: StoreInfo) => (store.key === "lis" ? s.visitLis : s.visitVng);
  const storeName = (store: StoreInfo) => store.labels[locale].name;

  return (
    <div>
      {/* Hub header — soft cream intro that names the page as a two-
          boutique picker rather than the old single "Visit us in
          Lisbon" hero. Directions live under each boutique's own
          section below. */}
      <header className="mx-auto max-w-4xl px-6 pt-24 pb-14 text-center">
        <p className="overline text-gold">{s.eyebrow}</p>
        <h1 className="mt-6 font-serif text-5xl font-light leading-tight text-ink md:text-6xl">
          {s.title}
        </h1>
        <div className="gold-rule mx-auto my-8" />
        <p className="mx-auto max-w-2xl text-base text-muted md:text-lg">
          {s.lede}
        </p>
      </header>

      {/* Two hero picker cards — a full-bleed photo per boutique with
          the "Visit us in X" title stamped on top and a subtle chevron
          jumping to the matching #<store.contactAnchor> section below.
          Split down the middle on md+, stacks on mobile. */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-2">
          {STORES.map((store) => (
            <a
              key={store.key}
              href={`#${store.contactAnchor}`}
              className="monogram-bg group relative block h-72 overflow-hidden text-cream sm:h-96"
            >
              {/* monogram-bg on the parent guarantees a luxe fallback
                  when the mallImage isn't uploaded yet — the Image
                  layer covers it once the asset lands under
                  /public/store/. */}
              <Image
                src={store.mallImage}
                alt={storeName(store)}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="absolute inset-0 z-0 object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 z-10 bg-gradient-to-b from-ink/40 via-ink/25 to-ink/85 transition-opacity duration-500 group-hover:from-ink/50 group-hover:to-ink/90" />
              <div className="relative z-20 flex h-full flex-col items-center justify-end p-8 text-center md:p-10">
                <p className="overline text-[0.55rem] text-gold-soft">{store.labels[locale].short}</p>
                <h2 className="mt-3 font-serif text-2xl leading-tight md:text-3xl">
                  {heroCta(store)}
                </h2>
                <span className="mt-4 inline-flex items-center gap-2 border-b border-cream/50 pb-1 text-[0.65rem] tracking-[0.22em] uppercase transition-colors group-hover:border-gold-soft group-hover:text-gold-soft">
                  {s.directions}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* One full detail section per boutique — mirror the previous
          single-store layout (address · hours · contact · services on
          the left, map on the right). Alternating background gives the
          two sections visual separation on long-scroll. */}
      {STORES.map((store, i) => (
        <section
          key={store.key}
          id={store.contactAnchor}
          className={`scroll-mt-24 ${i % 2 === 1 ? "bg-paper" : ""}`}
        >
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <div className="mb-14 flex flex-col items-center text-center md:mb-16">
              <p className="overline">
                {String(i + 1).padStart(2, "0")} · {store.labels[locale].short}
              </p>
              <h2 className="mt-4 font-serif text-4xl text-ink md:text-5xl">
                {storeName(store)}
              </h2>
              <div className="gold-rule mx-auto mt-6" />
            </div>

            <div className="grid gap-16 md:grid-cols-2">
              {/* Left column — details */}
              <div className="space-y-14">
                <div>
                  <p className="overline">{s.addressTitle}</p>
                  <div className="gold-rule mt-5" />
                  <address className="mt-6 space-y-1.5 text-base not-italic text-ink">
                    <p className="font-serif text-2xl">{store.venue}</p>
                    <p className="text-muted">{store.street}</p>
                    <p className="text-muted">{store.postcode}</p>
                    <p className="mt-3 text-sm tracking-[0.16em] text-gold uppercase">{floor}</p>
                  </address>
                </div>

                <div>
                  <p className="overline">{s.hoursTitle}</p>
                  <div className="gold-rule mt-5" />
                  <ul className="mt-6 space-y-1 text-sm">
                    {s.hours.map((row) => (
                      <li key={row.d} className="flex justify-between gap-6 border-b border-line py-3">
                        <span className="text-muted">{row.d}</span>
                        <span className="text-ink">{row.h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="overline">{s.contactTitle}</p>
                  <div className="gold-rule mt-5" />
                  <dl className="mt-6 space-y-4 text-sm">
                    <div className="flex gap-4">
                      <dt className="w-20 shrink-0 text-muted">{s.phoneLabel}</dt>
                      <dd>
                        <a href={store.phoneHref} className="text-ink transition-colors hover:text-gold">
                          {store.phone}
                        </a>
                      </dd>
                    </div>
                    <div className="flex gap-4">
                      <dt className="w-20 shrink-0 text-muted">{s.emailLabel}</dt>
                      <dd>
                        <a
                          href={`mailto:${store.email}`}
                          className="text-ink transition-colors hover:text-gold"
                        >
                          {store.email}
                        </a>
                      </dd>
                    </div>
                    <div className="flex gap-4">
                      <dt className="w-20 shrink-0 text-muted">Web</dt>
                      <dd>
                        <a
                          href={store.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink transition-colors hover:text-gold"
                        >
                          {store.officialLabel} ↗
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <p className="overline">{s.servicesTitle}</p>
                  <div className="gold-rule mt-5" />
                  <ul className="mt-6 space-y-3 text-sm text-muted">
                    {s.services.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 text-gold">—</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right column — map */}
              <div className="flex flex-col">
                <p className="overline">{s.mapTitle}</p>
                <div className="gold-rule mt-5" />
                <div className="mt-6 flex md:flex-1">
                  <StoreMap
                    src={store.mapEmbedSrc}
                    title={store.venue}
                    loadLabel={s.loadMap}
                    consent={s.mapConsent}
                    venue={store.venue}
                    street={store.street}
                    postcode={store.postcode}
                  />
                </div>
                <a
                  href={store.mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-3 bg-ink py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {s.directions}
                </a>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
