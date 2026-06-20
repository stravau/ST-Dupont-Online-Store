"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

// Static "Back" control derived from the route hierarchy, not browser
// history. Every non-home page links to the maison's home, except product
// pages where the in-page Breadcrumbs already covers the parent path and
// rendering both was redundant.
export function NavBack({ lang, homeLabel }: { lang: Locale; homeLabel: string }) {
  const pathname = usePathname();
  const home = `/${lang}`;
  const isHome = pathname === home || pathname === `${home}/`;
  // Product detail pages have their own Breadcrumbs at the top of the body
  // (Home > Category > Product). Render nothing here.
  const isProductPage = /^\/[a-z]{2}\/p\/[^/]+/.test(pathname);
  if (isHome || isProductPage) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-6">
      <Link
        href={home}
        className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {homeLabel}
      </Link>
    </div>
  );
}
