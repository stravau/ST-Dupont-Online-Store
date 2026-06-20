import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { getCategories, getCollections } from "@/lib/catalog";
import { categoryArt } from "@/lib/category-art";
import { localeCategorySlug } from "@/lib/category-slugs";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";
import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/logo";
import { HeaderShell } from "@/components/header-shell";

export async function SiteHeader({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const categories = await getCategories();
  // Rewrites `/c/<canonical>` → `/c/<en-alias>` when on the EN locale so
  // every link the mega-menu / mobile nav emits respects the SEO-friendly
  // English category slugs (/en/c/lighters, /en/c/writing, …).
  const localizeHref = (href: string): string =>
    href.replace(/\/c\/(isqueiros|escrita|pele|acessorios)\b/g, (_, slug) => `/c/${localeCategorySlug(lang, slug)}`);
  const menuItems = await Promise.all(
    categories.map(async (c) => ({
      slug: localeCategorySlug(lang, c.slug),
      name: c.name[lang],
      tagline: c.tagline[lang],
      groups: (categoryArt[c.slug]?.groups ?? []).map((g) => ({
        label: g.label[lang],
        href: localizeHref(`/${lang}${g.href}`),
      })),
      // Titled columns for the desktop mega-menu (Accessories).
      sections: (categoryArt[c.slug]?.menuSections ?? []).map((s) => ({
        title: s.title[lang],
        items: s.items.map((it) => ({ label: it.label[lang], href: localizeHref(`/${lang}${it.href}`) })),
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
    <HeaderShell>
      {/* Layout flips on xl:
            - Phone -> small laptop (< xl, i.e. < 1280px): flex with
              justify-between. MegaMenu is display:none in this range so
              only hamburger / logo / utilities are visible and they
              spread cleanly. This avoids the mega-menu trying to fit
              alongside the chrome at awkward 1024-1280 widths where the
              6 long English labels (WRITING INSTRUMENTS / LEATHER GOODS
              / ABOUT US…) would have crashed into the logo or wrapped.
            - Desktop (xl+): 3-column grid auto/1fr/auto. Hamburger
              collapses, the three remaining items each take one column —
              logo pinned hard left, mega-menu in the middle (its ul
              centres its own links), utilities pinned hard right. */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 xl:grid xl:grid-cols-[auto_1fr_auto] xl:gap-8">
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

        <Link href={`/${lang}`} aria-label="S.T. Dupont" className="leading-none">
          {/* Scales across the breakpoint bands so the wordmark always has
              room to breathe AND room left for the chrome on its right.
              Below xl the mega-menu is hidden so the logo can be more
              generous; at xl+ it has to share the row with the centred
              mega-menu so it shrinks. */}
          <Logo
            width={520}
            priority
            className="w-[200px] sm:w-[260px] lg:w-[300px] xl:w-[260px] 2xl:w-[320px]"
          />
        </Link>

        {/* Middle column on desktop — display:none on mobile so flex
            justify-between treats it as a non-item. */}
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

        {/* Right column: language, search, store-pin */}
        <div className="flex items-center justify-end gap-6">
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
    </HeaderShell>
  );
}
