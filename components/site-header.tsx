import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { getCategories, getCollections } from "@/lib/catalog";
import { categoryArt } from "@/lib/category-art";
import { currentUserId, getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { updateCartItemQty, removeCartItemQuick } from "@/lib/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";
import { SearchBar } from "@/components/search-bar";
import { CartMenu } from "@/components/cart-menu";
import { Logo } from "@/components/logo";

export async function SiteHeader({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const userId = await currentUserId();
  const cart = userId
    ? await getCart(userId, lang)
    : { lines: [], subtotalCents: 0, count: 0, currency: "EUR" };
  const cartCount = cart.count;
  const cartLines = cart.lines.map((l) => ({
    itemId: l.itemId,
    productSlug: l.productSlug,
    productName: l.productName,
    variantName: l.variantName,
    quantity: l.quantity,
    linePrice: formatPrice(l.lineCents, l.currency, lang),
    image: l.image,
  }));
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
      // "Accessories" is its own category/menu entry — don't repeat it as a
      // product line under Writing/Accessories.
      collections: (await getCollections(c.slug)).filter((x) => x !== "Accessories"),
    })),
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
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
          links={[{ label: dict.nav.about, href: `/${lang}/historia` }]}
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
          <CartMenu
            count={cartCount}
            cartHref={`/${lang}/carrinho`}
            lines={cartLines}
            subtotal={formatPrice(cart.subtotalCents, cart.currency, lang)}
            updateAction={updateCartItemQty.bind(null, lang)}
            removeAction={removeCartItemQuick.bind(null, lang)}
            labels={{
              title: dict.cart.title,
              empty: dict.cart.empty,
              subtotal: dict.cart.subtotal,
              finalize: dict.cart.finalize,
              qty: dict.cart.qty,
              remove: dict.cart.remove,
            }}
          />
        </div>
      </div>

    </header>
  );
}
