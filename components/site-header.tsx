import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { getCategories, getCollections } from "@/lib/catalog";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MegaMenu } from "@/components/mega-menu";

export async function SiteHeader({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const categories = await getCategories();
  const menuItems = await Promise.all(
    categories.map(async (c) => ({
      slug: c.slug,
      name: c.name[lang],
      tagline: c.tagline[lang],
      collections: await getCollections(c.slug),
    })),
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Wordmark */}
        <Link href={`/${lang}`} className="leading-none">
          <span className="block font-serif text-2xl tracking-[0.18em] text-ink">
            S.T. DUPONT
          </span>
          <span className="overline mt-1 block text-[0.6rem]">Paris · 1872</span>
        </Link>

        {/* Primary nav — mega-menu */}
        <MegaMenu
          lang={lang}
          items={menuItems}
          labels={{ viewAll: dict.nav.viewAll, collections: dict.nav.collections }}
        />

        {/* Utilities */}
        <div className="flex items-center gap-5">
          <LanguageSwitcher current={lang} />
          <button aria-label={dict.nav.search} className="text-ink transition-colors hover:text-gold">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            href={`/${lang}/conta`}
            aria-label={dict.auth.account}
            className="text-ink transition-colors hover:text-gold"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
          </Link>
          <button aria-label={dict.nav.cart} className="relative text-ink transition-colors hover:text-gold">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[0.6rem] text-paper">
              0
            </span>
          </button>
        </div>
      </div>

      {/* Mobile category strip */}
      <nav className="flex items-center justify-center gap-6 overflow-x-auto border-t border-line px-6 py-3 lg:hidden">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/${lang}/c/${c.slug}`}
            className="whitespace-nowrap text-xs tracking-[0.14em] text-muted uppercase"
          >
            {c.name[lang]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
