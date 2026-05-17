"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

export interface MenuCategory {
  slug: string;
  name: string;
  tagline: string;
  groups: { label: string; href: string }[];
  collections: string[];
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
    <nav className="hidden lg:block" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
      <ul className="flex items-center gap-9">
        {items.map((c) => (
          <li key={c.slug} className="static">
            <Link
              href={`/${lang}/c/${c.slug}`}
              onMouseEnter={() => show(c.slug)}
              onFocus={() => show(c.slug)}
              aria-expanded={open === c.slug}
              className="group relative block py-2 text-sm tracking-[0.14em] text-ink uppercase"
            >
              {c.name}
              <span
                className={`absolute -bottom-0 left-0 h-px bg-gold transition-all duration-300 ${
                  open === c.slug ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>

            {open === c.slug && (c.groups.length > 0 || c.collections.length > 0) && (
              <div
                onMouseEnter={() => show(c.slug)}
                onMouseLeave={scheduleClose}
                className="absolute left-0 right-0 top-full border-t border-line bg-cream/97 backdrop-blur"
              >
                <span aria-hidden className="absolute -top-4 left-0 right-0 h-4" />
                <div className="mx-auto flex max-w-7xl items-start gap-14 px-6 py-7">
                  {/* Intro */}
                  <div className="w-52 shrink-0 border-r border-line pr-10">
                    <p className="overline">{c.name}</p>
                    <p className="mt-2 font-serif text-lg leading-snug text-ink">
                      {c.tagline}
                    </p>
                    <Link
                      href={`/${lang}/c/${c.slug}`}
                      className="mt-4 inline-block text-[0.7rem] tracking-[0.2em] text-gold uppercase transition-colors hover:text-ink"
                    >
                      {labels.viewAll} →
                    </Link>
                  </div>

                  {/* Product types */}
                  {c.groups.length > 0 && (
                    <div className="min-w-[12rem]">
                      <p className="overline mb-4 text-[0.6rem]">{labels.products}</p>
                      <ul className="space-y-2.5">
                        {c.groups.map((g) => (
                          <li key={g.href}>
                            <Link
                              href={g.href}
                              className="text-sm text-ink transition-colors hover:text-gold"
                            >
                              {g.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Collections */}
                  {c.collections.length > 0 && (
                    <div className="flex-1">
                      <p className="overline mb-4 text-[0.6rem]">{labels.collections}</p>
                      <ul className="grid grid-cols-2 gap-x-12 gap-y-2.5 xl:grid-cols-3">
                        {c.collections.map((col) => (
                          <li key={col}>
                            <Link
                              href={`/${lang}/c/${c.slug}?col=${encodeURIComponent(col)}`}
                              className="text-sm text-muted transition-colors hover:text-gold"
                            >
                              {col}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
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
              className="group relative block py-2 text-sm tracking-[0.14em] text-ink uppercase"
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
