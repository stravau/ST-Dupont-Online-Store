import Link from "next/link";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { getCategories } from "@/lib/catalog";

// Not-found boundaries don't receive route params, so we present the default
// locale with category re-entry — a curated salvage, not a dead end.
export default function NotFound() {
  const lang = defaultLocale;
  const dict = getDictionary(lang);
  const categories = getCategories();

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
      <p className="overline">404</p>
      <h1 className="mt-5 font-serif text-5xl text-ink">{dict.notFound.title}</h1>
      <div className="gold-rule mx-auto my-7" />
      <p className="max-w-md text-muted">{dict.notFound.body}</p>

      <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/${lang}/c/${c.slug}`}
            className="text-sm tracking-[0.14em] text-ink uppercase transition-colors hover:text-gold"
          >
            {c.name[lang]}
          </Link>
        ))}
      </div>

      <Link
        href={`/${lang}`}
        className="mt-12 inline-block bg-ink px-10 py-4 text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-gold hover:text-ink"
      >
        {dict.notFound.cta}
      </Link>
    </section>
  );
}
