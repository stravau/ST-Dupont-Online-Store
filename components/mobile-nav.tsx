"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuCategory } from "@/components/mega-menu";

// Mobile equivalent of the mega-menu: a drawer with one accordion per
// category exposing its product-type groups and collections.
export function MobileNav({
  lang,
  items,
  links,
  labels,
}: {
  lang: string;
  items: MenuCategory[];
  links: { label: string; href: string }[];
  labels: { viewAll: string; collections: string; products: string };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-ink transition-colors hover:text-gold"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[var(--hdr,5.5rem)] z-40 overflow-y-auto border-t border-line bg-cream/98 backdrop-blur">
          <nav className="mx-auto max-w-2xl px-6 py-8">
            {items.map((c) => (
              <details key={c.slug} className="border-b border-line py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm tracking-[0.16em] text-ink uppercase">
                  {c.name}
                  <span className="text-gold">+</span>
                </summary>
                <div className="pb-4 pl-1">
                  <Link
                    href={`/${lang}/c/${c.slug}`}
                    className="block py-2 text-xs tracking-[0.18em] text-gold uppercase"
                  >
                    {labels.viewAll} →
                  </Link>
                  {c.groups.length > 0 && (
                    <>
                      <p className="overline mt-3 mb-2 text-[0.55rem]">{labels.collections}</p>
                      <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {c.groups.map((g) => (
                          <li key={g.href}>
                            <Link href={g.href} className="block py-1 text-sm text-ink">
                              {g.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {c.collections.length > 0 && (
                    <>
                      <p className="overline mt-4 mb-2 text-[0.55rem]">{labels.products}</p>
                      <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {c.collections.map((col) => (
                          <li key={col}>
                            <Link
                              href={`/${lang}/c/${c.slug}?col=${encodeURIComponent(col)}`}
                              className="block py-1 text-sm text-muted"
                            >
                              {col}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </details>
            ))}

            <div className="mt-6 space-y-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block text-sm tracking-[0.16em] text-ink uppercase"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
