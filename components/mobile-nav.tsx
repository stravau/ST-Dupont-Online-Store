"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuCategory } from "@/components/mega-menu";
import { Logo } from "@/components/logo";
import { useHeaderTransparent } from "@/components/header-shell";
import { ACCESSORIES_NAV } from "@/lib/collection-order";

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
  // Inline-expand state for Accessories sub-items that hold nested
  // children (Cigar Cases → 1/2/3). Keyed by the item's EN label so PT/EN
  // share one toggle target.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  function toggleExpanded(key: string): void {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
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

  // Reset to the root view + collapse any expanded sub-items whenever the
  // panel re-opens or the user backs out of a maison sub-panel.
  useEffect(() => {
    if (open) {
      setSelected(null);
      setExpanded(new Set());
    }
  }, [open]);
  useEffect(() => {
    if (!selected) setExpanded(new Set());
  }, [selected]);

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

              {/* Category view. For Lighters / Writing / Leather: flat
                  list of model lines via selected.collections. For
                  Accessories: structured layout — two grouped sections
                  (Smoking, Writing Accessories) with Cigar Cases nested
                  into 1/2/3, plus the remaining accessory categories as
                  flat top-level rows below. */}
              {selected && (() => {
                const isAccessories =
                  selected.slug === "acessorios" || selected.slug === "accessories";
                const tt = (l: { pt: string; en: string }) =>
                  lang === "pt" ? l.pt : l.en;
                if (isAccessories) {
                  return (
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
                      {ACCESSORIES_NAV.map((entry, i) => {
                        if (entry.kind === "item") {
                          return (
                            <li key={`flat-${i}`} className="border-b border-line/60">
                              <Link
                                href={`/${lang}/c/${selected.slug}?col=${encodeURIComponent(entry.collection)}`}
                                onClick={close}
                                className="block py-3.5 text-[0.8rem] font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:text-gold"
                              >
                                {tt(entry.label)}
                              </Link>
                            </li>
                          );
                        }
                        return (
                          <li key={`sec-${i}`} className="border-b border-line/60">
                            <p className="pt-5 pb-3 text-[0.65rem] font-semibold tracking-[0.22em] text-gold uppercase">
                              {tt(entry.title)}
                            </p>
                            <ul className="pb-2">
                              {entry.items.map((it) => {
                                const key = it.label.en;
                                if (it.children) {
                                  const isOpen = expanded.has(key);
                                  return (
                                    <li key={key} className="border-t border-line/40">
                                      <button
                                        type="button"
                                        onClick={() => toggleExpanded(key)}
                                        aria-expanded={isOpen}
                                        className="flex w-full items-center justify-between py-3 text-left text-[0.75rem] tracking-[0.16em] text-ink uppercase transition-colors hover:text-gold"
                                      >
                                        <span>{tt(it.label)}</span>
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.6"
                                          className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                                        >
                                          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </button>
                                      {isOpen && (
                                        <ul className="ml-4 mb-2 border-l border-gold/40 pl-4">
                                          {it.children.map((child) => (
                                            <li key={child.label.en}>
                                              <Link
                                                href={`/${lang}/c/${selected.slug}?col=${encodeURIComponent(child.collection ?? "")}`}
                                                onClick={close}
                                                className="block py-2 text-[0.7rem] tracking-[0.14em] text-muted uppercase transition-colors hover:text-gold"
                                              >
                                                {tt(child.label)}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </li>
                                  );
                                }
                                return (
                                  <li key={key} className="border-t border-line/40">
                                    <Link
                                      href={`/${lang}/c/${selected.slug}?col=${encodeURIComponent(it.collection ?? "")}`}
                                      onClick={close}
                                      className="block py-3 text-[0.75rem] tracking-[0.16em] text-ink uppercase transition-colors hover:text-gold"
                                    >
                                      {tt(it.label)}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }
                return (
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
                );
              })()}
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
