import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { getCategories, getCollections } from "@/lib/catalog";
import { categoryArt } from "@/lib/category-art";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";
import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/logo";

export async function SiteHeader({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const categories = await getCategories();
  const menuItems = await Promise.all(
    categories.map(async (c) => ({
      slug: c.slug,
      name: c.name[lang],
      tagline: c.tagline[lang],
      groups: (categoryArt[c.slug]?.groups ?? []).map((g) => ({
        label: g.label[lang],
        href: `/${lang}${g.href}`,
      })),
      // Titled columns for the desktop mega-menu (Accessories).
      sections: (categoryArt[c.slug]?.menuSections ?? []).map((s) => ({
        title: s.title[lang],
        items: s.items.map((it) => ({ label: it.label[lang], href: `/${lang}${it.href}` })),
      })),
      // The "Products" column lists base lines only. Themed sub-collections
      // (Géode, Popote, DC Comics, …) already live in the "Collections"
      // column on the left as `groups`, so keep them out of Products.
      collections: (await getCollections(c.slug)).filter(
        (x) =>
          x !== "Accessories" &&
          x !== "Monogram 1872" &&
          x !== "DC Comics" &&
          x !== "20,000 Leagues Under The Sea" &&
          x !== "Géode" &&
          x !== "Popote" &&
          x !== "Maki-e" &&
          x !== "Orlinski" &&
          x !== "Horse Mane" &&
          x !== "Fender" &&
          x !== "Fuente" &&
          x !== "Fire X",
      ),
    })),
  );

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Mobile menu trigger (top-left on small screens) */}
        <MobileNav
          lang={lang}
          items={menuItems}
          links={[
            { label: dict.nav.store, href: `/${lang}/loja` },
            { label: dict.nav.about, href: `/${lang}/historia` },
          ]}
          labels={{
            viewAll: dict.nav.viewAll,
            collections: dict.nav.collections,
            products: dict.nav.products,
          }}
        />

        {/* Wordmark */}
        <Link href={`/${lang}`} aria-label="S.T. Dupont" className="leading-none">
          <Logo width={263} priority className="w-[188px] sm:w-[263px]" />
        </Link>

        {/* Primary nav — mega-menu */}
        <MegaMenu
          lang={lang}
          items={menuItems}
          links={[
            { label: dict.nav.store, href: `/${lang}/loja` },
            { label: dict.nav.about, href: `/${lang}/historia` },
          ]}
          labels={{
            viewAll: dict.nav.viewAll,
            collections: dict.nav.collections,
            products: dict.nav.products,
          }}
        />

        {/* Utilities */}
        <div className="flex items-center gap-6">
          <LanguageSwitcher current={lang} />
          <SearchBar
            lang={lang}
            t={{
              placeholder: dict.search.placeholder,
              title: dict.search.title,
              start: dict.search.start,
              searching: dict.search.searching,
              noResults: dict.search.noResults,
              viewAll: dict.search.viewAll,
            }}
          />
          {/* Visit the boutique — map-pin icon, opens the store page */}
          <Link
            href={`/${lang}/loja`}
            aria-label={dict.nav.store}
            title={dict.nav.store}
            className="text-ink transition-colors hover:text-gold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </Link>
        </div>
      </div>

    </header>
  );
}
