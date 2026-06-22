import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { STORE, mapsEmbedSrc, mapsDirectionsUrl } from "@/lib/store-info";
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

  return (
    <div>
      {/* Hero — full-bleed photo of the El Corte Inglés Lisbon entrance
          (the building the boutique is in) with the same ink scrim + gold
          accents used on the category pages, so the page reads as part of
          the brand chrome rather than a generic info page. */}
      <section className="relative overflow-hidden text-cream">
        <Image
          src="/store/eci-mall.jpg"
          alt={STORE.venue}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 object-cover object-center"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink/70 via-ink/55 to-ink/80" />
        <div className="relative z-20 mx-auto max-w-4xl px-6 py-28 text-center md:py-36">
          <p className="overline text-gold-soft">{s.eyebrow}</p>
          <h1 className="mt-6 font-serif text-5xl font-light leading-tight md:text-6xl">
            {s.title}
          </h1>
          <div className="gold-rule mx-auto my-8" />
          <p className="mx-auto max-w-2xl text-base font-light text-cream/85 md:text-lg">
            {s.lede}
          </p>
          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 border border-gold-soft bg-ink/30 px-10 py-4 text-xs tracking-[0.22em] text-cream uppercase backdrop-blur-sm transition-colors duration-300 hover:bg-gold-soft hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {s.directions}
          </a>
        </div>
      </section>

      {/* Details + map */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="grid gap-16 md:grid-cols-2">
          {/* Left: details */}
          <div className="space-y-14">
            <div>
              <p className="overline">{s.addressTitle}</p>
              <div className="gold-rule mt-5" />
              <address className="mt-6 space-y-1.5 text-base not-italic text-ink">
                <p className="font-serif text-2xl">{STORE.venue}</p>
                <p className="text-muted">{STORE.street}</p>
                <p className="text-muted">{STORE.postcode}</p>
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

            <div id="contacto" className="scroll-mt-28">
              <p className="overline">{s.contactTitle}</p>
              <div className="gold-rule mt-5" />
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-muted">{s.phoneLabel}</dt>
                  <dd>
                    <a href={STORE.phoneHref} className="text-ink transition-colors hover:text-gold">
                      {STORE.phone}
                    </a>
                  </dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-muted">{s.emailLabel}</dt>
                  <dd>
                    <a
                      href={`mailto:${STORE.email}`}
                      className="text-ink transition-colors hover:text-gold"
                    >
                      {STORE.email}
                    </a>
                  </dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-20 shrink-0 text-muted">Web</dt>
                  <dd>
                    <a
                      href={STORE.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink transition-colors hover:text-gold"
                    >
                      {STORE.officialLabel} ↗
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

          {/* Right: map */}
          <div id="map" className="flex scroll-mt-28 flex-col">
            <p className="overline">{s.mapTitle}</p>
            <div className="gold-rule mt-5" />
            <div className="mt-6 flex md:flex-1">
              <StoreMap
                src={mapsEmbedSrc}
                title={STORE.venue}
                loadLabel={s.loadMap}
                consent={s.mapConsent}
                venue={STORE.venue}
                street={STORE.street}
                postcode={STORE.postcode}
              />
            </div>
            <a
              href={mapsDirectionsUrl}
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
      </section>
    </div>
  );
}
