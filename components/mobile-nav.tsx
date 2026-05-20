"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuCategory } from "@/components/mega-menu";
import { Logo } from "@/components/logo";

// Mobile menu: a full-screen panel with the logo and the primary
// destinations stacked, centred in a single column.
export function MobileNav({
  lang,
  items,
  links,
}: {
  lang: string;
  items: MenuCategory[];
  links: { label: string; href: string }[];
  labels: { viewAll: string; collections: string; products: string };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    queueMicrotask(() => setOpen(false));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Primary column: the four maisons, then "About us".
  const entries = [
    ...items.map((c) => ({ label: c.name, href: `/${lang}/c/${c.slug}` })),
    ...links.filter((l) => l.href.endsWith("/historia")),
  ];

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
        // Full-screen panel. `inset-0` covers the viewport in CSS pixels;
        // `[zoom:1.1112]` composes with the body's `zoom: 0.9` to render
        // at full viewport size (otherwise a ~10% strip is left bare at
        // the bottom on Chromium). `100dvh` handles iOS' URL-bar dance.
        <div className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-cream [zoom:1.1112]">
          <div className="flex items-center justify-end px-6 py-5">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="text-ink transition-colors hover:text-gold"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col items-center justify-center gap-9 px-6 pb-24">
            <Link
              href={`/${lang}`}
              aria-label="S.T. Dupont"
              onClick={() => setOpen(false)}
              className="mb-6"
            >
              <Logo width={340} className="w-[340px] max-w-[80vw]" />
            </Link>

            {entries.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => setOpen(false)}
                className="font-serif text-2xl tracking-[0.06em] text-ink transition-colors hover:text-gold"
              >
                {e.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
