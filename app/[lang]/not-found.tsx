import Link from "next/link";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { STORE_LIS } from "@/lib/store-info";
import { Crest } from "@/components/crest";

// Next 16 not-found boundaries don't receive route params, so we
// render the default locale. Full-bleed monogram background matches
// the luxury tone; three bordered "escape" cards let the visitor
// pivot cleanly instead of hitting a dead-end.
export default function NotFound() {
  const lang = defaultLocale;
  const dict = getDictionary(lang);
  const nf = dict.notFound;

  const cards = [
    {
      href: `/${lang}`,
      title: nf.homeTitle,
      body: nf.homeBody,
      cta: nf.homeCta,
    },
    {
      href: `/${lang}/colecao`,
      title: nf.collectionTitle,
      body: nf.collectionBody,
      cta: nf.collectionCta,
    },
    {
      href: `/${lang}/loja`,
      title: nf.contactTitle,
      body: nf.contactBody,
      cta: nf.contactBoutique,
    },
  ];

  return (
    <section className="monogram-bg relative overflow-hidden text-cream">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink/85" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 md:py-28">
        <div className="flex flex-col items-center text-center">
          <Crest className="mb-6 text-gold-soft" />
          <p className="overline text-gold-soft">{nf.eyebrow}</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
            {nf.title}
          </h1>
          <div className="gold-rule mx-auto my-7" />
          <p className="max-w-xl text-sm text-cream/80 md:text-base">{nf.body}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col border border-cream/25 bg-ink/40 p-7 backdrop-blur transition-colors duration-300 hover:border-gold"
            >
              <p className="overline text-gold-soft">{card.title}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-cream/80">
                {card.body}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 border-b border-cream/40 pb-1 text-[0.65rem] tracking-[0.22em] uppercase transition-colors group-hover:border-gold group-hover:text-gold">
                {card.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-14 text-center text-xs tracking-[0.18em] text-cream/60 uppercase">
          <a
            href={`mailto:${STORE_LIS.email}`}
            className="transition-colors hover:text-gold"
          >
            {nf.contactEmail} · {STORE_LIS.email}
          </a>
        </p>
      </div>
    </section>
  );
}
