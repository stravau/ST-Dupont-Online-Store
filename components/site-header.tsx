import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { getCategories, getCollections } from "@/lib/catalog";
import { categoryArt } from "@/lib/category-art";
import { currentUserId } from "@/lib/cart";
import { signOutAccount } from "@/lib/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";
import { SearchBar } from "@/components/search-bar";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";

export async function SiteHeader({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const userId = await currentUserId();
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
      // "Accessories" is its own category/menu entry; "Monogram 1872" is
      // shown under Collections (groups), so keep both out of the product-
      // line (Products) column.
      collections: (await getCollections(c.slug)).filter(
        (x) => x !== "Accessories" && x !== "Monogram 1872",
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
            { label: dict.product.bookConsultation, href: `/${lang}/consulta` },
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
            { label: dict.product.bookConsultation, href: `/${lang}/consulta` },
            { label: dict.nav.about, href: `/${lang}/historia` },
          ]}
          labels={{
            viewAll: dict.nav.viewAll,
            collections: dict.nav.collections,
            products: dict.nav.products,
          }}
        />

        {/* Utilities */}
        <div className="flex items-center gap-5">
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
          {userId ? (
            <AccountMenu
              ariaLabel={dict.auth.account}
              title={dict.client.area}
              items={[
                { label: dict.client.profile, href: `/${lang}/conta` },
                { label: dict.client.wishlist, href: `/${lang}/conta/favoritos` },
                { label: dict.client.addresses, href: `/${lang}/conta/moradas` },
              ]}
              signOutAction={signOutAccount.bind(null, lang)}
              signOutLabel={dict.client.signOut}
            />
          ) : (
            <Link
              href={`/${lang}/entrar`}
              aria-label={dict.auth.account}
              className="text-ink transition-colors hover:text-gold"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </Link>
          )}
          {/* Book consultation — calendar icon, opens the consulta page */}
          <Link
            href={`/${lang}/consulta`}
            aria-label={dict.product.bookConsultation}
            title={dict.product.bookConsultation}
            className="text-ink transition-colors hover:text-gold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
              <path d="M8 3.5v3M16 3.5v3M3.5 10h17" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>

    </header>
  );
}
