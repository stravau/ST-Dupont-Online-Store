"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

export interface MenuCategory {
  slug: string;
  name: string;
  tagline: string;
  collections: string[];
}

export function MegaMenu({
  lang,
  items,
  labels,
}: {
  lang: string;
  items: MenuCategory[];
  labels: { viewAll: string; collections: string };
}) {
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover-intent: cancel any pending close on enter; close only after a short
  // grace period so moving between a category and its panel never drops it.
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
    <nav
      className="hidden lg:block"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
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

            {open === c.slug && c.collections.length > 0 && (
              <div
                onMouseEnter={() => show(c.slug)}
                onMouseLeave={scheduleClose}
                className="absolute left-0 right-0 top-full border-t border-line bg-cream/97 backdrop-blur"
              >
                {/* Invisible bridge so the gap between the link row and the
                    panel never breaks the hover. */}
                <span
                  aria-hidden
                  className="absolute -top-4 left-0 right-0 h-4"
                />
                <div className="mx-auto flex max-w-7xl gap-16 px-6 py-12">
                  <div className="w-56 shrink-0">
                    <p className="overline">{c.name}</p>
                    <p className="mt-3 font-serif text-2xl leading-snug text-ink">
                      {c.tagline}
                    </p>
                    <Link
                      href={`/${lang}/c/${c.slug}`}
                      className="mt-6 inline-block text-xs tracking-[0.2em] text-gold uppercase transition-colors hover:text-ink"
                    >
                      {labels.viewAll} →
                    </Link>
                  </div>
                  <div>
                    <p className="overline mb-5">{labels.collections}</p>
                    <ul className="grid grid-cols-2 gap-x-14 gap-y-3">
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
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
