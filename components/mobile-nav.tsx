"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuCategory } from "@/components/mega-menu";
import { Logo } from "@/components/logo";
import { useHeaderTransparent } from "@/components/header-shell";

// Mobile menu: a full-screen panel that drills down per maison. The root
// view shows the four maisons + About Us. Tapping a maison swaps to its
// own panel listing every sub-collection (Géode / Popote / Maki-e / …)
// plus a "View all" link. A back button on the second panel returns to
// the root view. Bottom of every panel: Contact Us + Find Store icons
// linking to /loja#contacto and /loja#map.
export function MobileNav({
  lang,
  items,
  links,
  labels,
}: {
  lang: string;
  items: MenuCategory[];
  links: { label: string; href: string }[];
  labels: {
    viewAll: string;
    collections: string;
    products: string;
    contactUs?: string;
    findStore?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<MenuCategory | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);
  const transparent = useHeaderTransparent();
  const triggerClasses = transparent
    ? "text-cream bg-ink/55 backdrop-blur-sm rounded-md p-1.5"
    : "text-ink";

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(false);
      setSelected(null);
    });
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset to the root view whenever the panel re-opens.
  useEffect(() => {
    if (open) setSelected(null);
  }, [open]);

  // Root entries — the four maisons + About Us.
  const aboutLink = links.find((l) => l.href.endsWith("/historia"));
  const contactLabel = labels.contactUs ?? (lang === "pt" ? "Contactar" : "Contact us");
  const findStoreLabel = labels.findStore ?? (lang === "pt" ? "Encontrar Loja" : "Find Store");

  function close() {
    setOpen(false);
    setSelected(null);
  }

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${triggerClasses} transition-colors hover:text-gold`}
      >
        {open ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-cream [zoom:1.1112]">
            {/* Top bar: back button (only when drilled into a category) +
                close button. */}
            <div className="flex items-center justify-between px-6 py-5">
              {selected ? (
                <button
                  type="button"
                  aria-label="Back"
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center gap-2 text-ink transition-colors hover:text-gold"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs tracking-[0.2em] uppercase">{selected.name}</span>
                </button>
              ) : (
                <span aria-hidden />
              )}
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="text-ink transition-colors hover:text-gold"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body — scrollable; pushes the footer icons to the bottom. */}
            <nav className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
              <Link
                href={`/${lang}`}
                aria-label="S.T. Dupont"
                onClick={close}
                className="mx-auto mb-8 inline-block"
              >
                <Logo width={300} className="w-[260px] max-w-[70vw]" />
              </Link>

              {/* Shared item style — every button reads as the same
                  caps-lock chip with a thin bottom border, regardless of
                  whether it's a maison, a model line or "View all". */}
              {(() => null)()}

              {!selected && (
                <ul className="mx-auto flex w-full max-w-sm flex-col">
                  {items.map((c) => (
                    <li key={c.slug} className="border-b border-line/60">
                      <button
                        type="button"
                        onClick={() => setSelected(c)}
                        className="flex w-full items-center justify-between py-4 text-left text-[0.8rem] font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:text-gold"
                      >
                        <span>{c.name}</span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        >
                          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </li>
                  ))}
                  {aboutLink && (
                    <li className="border-b border-line/60">
                      <Link
                        href={aboutLink.href}
                        onClick={close}
                        className="flex w-full items-center justify-between py-4 text-[0.8rem] font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:text-gold"
                      >
                        <span>{aboutLink.label}</span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        >
                          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </li>
                  )}
                </ul>
              )}

              {/* Category view — show every model line (collections) for
                  the chosen maison FIRST. "View all" at the top lands on
                  the unfiltered category. Themed sub-collections live in
                  the desktop mega-menu's Coleções panel; mobile keeps
                  things uncluttered with just the base lines. */}
              {selected && (
                <ul className="mx-auto flex w-full max-w-sm flex-col">
                  <li className="border-b border-line/60">
                    <Link
                      href={`/${lang}/c/${selected.slug}`}
                      onClick={close}
                      className="block py-4 text-[0.8rem] font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:text-gold"
                    >
                      {labels.viewAll}
                    </Link>
                  </li>
                  {selected.collections.map((col) => (
                    <li key={col} className="border-b border-line/60">
                      <Link
                        href={`/${lang}/c/${selected.slug}?col=${encodeURIComponent(col)}`}
                        onClick={close}
                        className="block py-3.5 text-[0.8rem] font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:text-gold"
                      >
                        {col}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </nav>

            {/* Footer — Contact + Find Store icons. Pinned to the bottom
                of the panel; visible across both views. */}
            <div className="border-t border-line/60 bg-cream">
              <div className="mx-auto grid w-full max-w-sm grid-cols-2">
                <Link
                  href={`/${lang}/loja#contacto`}
                  onClick={close}
                  className="flex flex-col items-center gap-2 border-r border-line/60 py-5 text-ink transition-colors hover:text-gold"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path
                      d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[0.65rem] tracking-[0.2em] uppercase">{contactLabel}</span>
                </Link>
                <Link
                  href={`/${lang}/loja#map`}
                  onClick={close}
                  className="flex flex-col items-center gap-2 py-5 text-ink transition-colors hover:text-gold"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span className="text-[0.65rem] tracking-[0.2em] uppercase">{findStoreLabel}</span>
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
