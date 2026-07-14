import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { getCategories, getCollections } from "@/lib/catalog";
import { categoryArt } from "@/lib/category-art";
import { localeCategorySlug } from "@/lib/category-slugs";
import { MODEL_COLLECTIONS_BY_CATEGORY } from "@/lib/collection-order";
import { getLiveNavSignals, isNavPathLive } from "@/lib/nav-liveness";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";
import { SearchBar } from "@/components/search-bar";
import { Logo } from "@/components/logo";
import { HeaderShell } from "@/components/header-shell";

export async function SiteHeader({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const categories = await getCategories();
  // Liveness signals — hide nav entries whose destination has zero
  // non-DESCONTINUADO variants with stock. Computed once per request
  // and shared with the mobile drawer via a small serialisable prop.
  const signals = await getLiveNavSignals();
  const isLive = (href: string) => isNavPathLive(href, signals);
  const liveSignals = {
    collections: [...signals.collections],
    types: [...signals.types],
    genders: [...signals.genders],
    usages: [...signals.usages],
    categories: [...signals.categories],
  };
  // Rewrites `/c/<canonical>` → `/c/<en-alias>` when on the EN locale so
  // every link the mega-menu / mobile nav emits respects the SEO-friendly
  // English category slugs (/en/c/lighters, /en/c/writing, …).
  const localizeHref = (href: string): string =>
    href.replace(/\/c\/(isqueiros|escrita|pele|acessorios)\b/g, (_, slug) => `/c/${localeCategorySlug(lang, slug)}`);
  const menuItems = await Promise.all(
    categories.map(async (c) => {
      // The "Products" column (desktop) + the mobile sub-panel both
      // surface the model lines only. Themed sub-collections (Géode /
      // Cohiba / DC Comics / Maki-e / …) live in the mega-menu's
      // Collections column on the left and the catalogue page's themed
      // sections — keeping them OUT here is what the user asked for.
      // Allow-list keyed by category so the order matches the editorial
      // sequence in MODEL_COLLECTIONS_BY_CATEGORY (and the catalogue
      // grid doesn't drift from the navbar).
      const allowedModels = MODEL_COLLECTIONS_BY_CATEGORY[c.slug] ?? [];
      const availableCollections = new Set(
        (await getCollections(c.slug)).filter((x) => x.length > 0),
      );
      // Every menu list is sorted alphabetically (locale-aware) so the navbar
      // reads A→Z in every section, desktop and mobile alike.
      const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label, lang);
      return {
        slug: localeCategorySlug(lang, c.slug),
        name: c.name[lang],
        tagline: c.tagline[lang],
        groups: (categoryArt[c.slug]?.groups ?? [])
          .filter((g) => isLive(g.href))
          .map((g) => ({ label: g.label[lang], href: localizeHref(`/${lang}${g.href}`) }))
          .sort(byLabel),
        // Titled columns for the desktop mega-menu (Accessories).
        sections: (categoryArt[c.slug]?.menuSections ?? [])
          .map((s) => {
            const live = s.items
              .filter((it) => isLive(it.href))
              .map((it) => ({
                label: it.label[lang],
                href: localizeHref(`/${lang}${it.href}`),
                viewAll: it.viewAll ?? false,
              }));
            // Alphabetical items first; any "View all …" link is pinned last so
            // the mega-menu can render it as a gold-underlined footer action.
            const regular = live.filter((it) => !it.viewAll).sort(byLabel);
            const viewAlls = live.filter((it) => it.viewAll);
            return { title: s.title[lang], items: [...regular, ...viewAlls] };
          })
          .filter((s) => s.items.length > 0),
        collections: allowedModels
          .filter((m) => availableCollections.has(m) && signals.collections.has(m))
          .sort((a, b) => a.localeCompare(b, lang)),
      };
    }),
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
          liveSignals={liveSignals}
          labels={{
            viewAll: dict.nav.viewAll,
            collections: dict.nav.collections,
            products: dict.nav.products,
            close: dict.common.closeMenu,
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
