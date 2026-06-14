"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface MenuCategory {
  slug: string;
  name: string;
  tagline: string;
  groups: { label: string; href: string }[];
  collections: string[];
  // Titled columns (e.g. Accessories: New Products / Collections / Smoking /
  // Writing). When present, the panel renders these instead of the generic
  // groups + collections layout.
  sections?: { title: string; items: { label: string; href: string }[] }[];
}

export function MegaMenu({
  lang,
  items,
  links = [],
  labels,
}: {
  lang: string;
  items: MenuCategory[];
  links?: { label: string; href: string }[];
  labels: { viewAll: string; collections: string; products: string };
}) {
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // Collapse any open submenu whenever the route changes — so a fresh
  // page never inherits a stuck-open mega-menu panel.
  useEffect(() => {
    queueMicrotask(() => setOpen(null));
  }, [pathname]);

  const cancelClose = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const show = useCallback(
    (slug: string) => {
      cancelClose();
      setOpen(slug);
    },
    [cancelClose],
  );

  const scheduleClose = useCallback(() => {
    cancelClose();
    timer.current = setTimeout(() => setOpen(null), 220);
  }, [cancelClose]);

  return (
    <nav className="hidden xl:block" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
      <ul className="flex items-center justify-center gap-5 2xl:gap-7">
        {items.map((c) => (
          <li key={c.slug} className="static">
            <Link
              href={`/${lang}/c/${c.slug}`}
              onMouseEnter={() => show(c.slug)}
              onFocus={() => show(c.slug)}
              aria-expanded={open === c.slug}
              className="group relative block py-2 text-[13px] font-medium tracking-[0.12em] whitespace-nowrap text-ink uppercase 2xl:text-sm 2xl:tracking-[0.14em]"
            >
              {c.name}
              <span
                className={`absolute -bottom-0 left-0 h-px bg-gold transition-all duration-300 ${
                  open === c.slug ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>

            {open === c.slug &&
              (c.groups.length > 0 || c.collections.length > 0 || (c.sections?.length ?? 0) > 0) && (
              <div
                onMouseEnter={() => show(c.slug)}
                onMouseLeave={scheduleClose}
                className="menu-panel absolute left-0 right-0 top-full border-t border-line bg-cream/97 backdrop-blur"
              >
                <span aria-hidden className="absolute -top-4 left-0 right-0 h-4" />
                <div className="flex items-start gap-12 px-8 py-7 2xl:gap-14 2xl:px-12 2xl:py-8">
                  {/* Intro */}
                  <div
                    className="menu-item w-52 shrink-0 border-r border-line pr-10"
                    style={{ animationDelay: "0.04s" }}
                  >
                    <p className="overline">{c.name}</p>
                    <p className="mt-2 font-serif text-lg leading-snug text-ink">
                      {c.tagline}
                    </p>
                    <Link
                      href={`/${lang}/c/${c.slug}`}
                      className="link-grow mt-4 inline-block text-[0.7rem] tracking-[0.2em] text-gold uppercase transition-colors hover:text-ink"
                    >
                      {labels.viewAll} →
                    </Link>
                  </div>

                  {/* Titled sections — laid out as a wrapping 4-column grid so
                      categories with 6-8 sections (Lighters / Writing) flow
                      naturally onto a second row instead of overflowing the
                      panel and clipping the rightmost columns. The intro
                      stays pinned to the left at full height. */}
                  {c.sections && c.sections.length > 0 ? (
                    // Compact 4×2 grid mirroring st-dupont.com's panel:
                    // every section is a single tall column with tight row
                    // spacing. The outer flex-1 fills the freed up width
                    // (no more max-w-7xl cap) so sections breathe across
                    // the whole screen at any monitor size.
                    <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
                      {c.sections.map((sec, si) => (
                        <div
                          key={sec.title}
                          className="menu-item min-w-0"
                          style={{ animationDelay: `${0.08 + si * 0.05}s` }}
                        >
                          <p className="overline mb-2.5 text-[0.55rem] tracking-[0.18em]">
                            {sec.title}
                          </p>
                          <ul className="space-y-1.5">
                            {sec.items.map((it, i) => (
                              <li
                                key={`${it.href}${it.label}`}
                                className="menu-item"
                                style={{ animationDelay: `${0.12 + si * 0.05 + i * 0.03}s` }}
                              >
                                <Link
                                  href={it.href}
                                  className="menu-item-hover text-[0.8rem] leading-snug text-ink"
                                >
                                  {it.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                  {/* Item types — labelled "Collections" (inverted). Long
                      lists (e.g. Accessories) flow into two columns. */}
                  {c.groups.length > 0 && (
                    <div className={c.groups.length > 4 ? "min-w-[18rem]" : "min-w-[12rem]"}>
                      <p
                        className="menu-item overline mb-4 text-[0.6rem]"
                        style={{ animationDelay: "0.08s" }}
                      >
                        {labels.collections}
                      </p>
                      <ul
                        className={
                          c.groups.length > 4
                            ? "grid grid-cols-2 gap-x-10 gap-y-3"
                            : "space-y-3"
                        }
                      >
                        {c.groups.map((g, i) => (
                          <li
                            key={g.href}
                            className="menu-item"
                            style={{ animationDelay: `${0.12 + i * 0.045}s` }}
                          >
                            <Link
                              href={g.href}
                              className="menu-item-hover text-sm text-ink"
                            >
                              {g.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Product lines — labelled "Products" (inverted) */}
                  {c.collections.length > 0 && (
                    <div className="flex-1">
                      <p
                        className="menu-item overline mb-4 text-[0.6rem]"
                        style={{ animationDelay: "0.14s" }}
                      >
                        {labels.products}
                      </p>
                      <ul className="grid grid-cols-2 gap-x-12 gap-y-3 xl:grid-cols-3">
                        {c.collections.map((col, i) => (
                          <li
                            key={col}
                            className="menu-item"
                            style={{ animationDelay: `${0.18 + i * 0.035}s` }}
                          >
                            <Link
                              href={`/${lang}/c/${c.slug}?col=${encodeURIComponent(col)}`}
                              className="menu-item-hover text-sm text-muted"
                            >
                              {col}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                    </>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}

        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              onMouseEnter={cancelClose}
              className="group relative block py-2 text-[13px] font-medium tracking-[0.12em] whitespace-nowrap text-ink uppercase 2xl:text-sm 2xl:tracking-[0.14em]"
            >
              {l.label}
              <span className="absolute -bottom-0 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
