"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuCategory } from "@/components/mega-menu";
import { Logo } from "@/components/logo";
import { useHeaderTransparent } from "@/components/header-shell";
import { ACCESSORIES_NAV, LEATHER_NAV, WRITING_NAV, type MobileNavEntry, type MobileNavItem, type MobileNavSection } from "@/lib/collection-order";
import { isNavPathLive, type LiveNavSignalsSerialized } from "@/lib/nav-liveness-shared";

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
  liveSignals,
  labels,
}: {
  lang: string;
  items: MenuCategory[];
  links: { label: string; href: string }[];
  liveSignals: LiveNavSignalsSerialized;
  labels: {
    viewAll: string;
    collections: string;
    products: string;
    contactUs?: string;
    findStore?: string;
    close?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<MenuCategory | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // Focus trap engages while `open` is true. Focus is restored to the
  // hamburger trigger on close. This does NOT interfere with the
  // deferred state reset that fixed the slide-out (commits 27bfaec /
  // f111b73) — the trap only manages Tab movement, not open state.
  const panelRef = useFocusTrap<HTMLDivElement>(open, triggerRef);
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

  // Body scroll lock + close-side cleanup live together so we can
  // delay BOTH until after the 300 ms slide-out. Without the delay,
  // `setSelected(null)` + `setExpanded(new Set())` (fresh reference
  // → React can't Object.is-bail) fire in the same passive-effect
  // flush as the transform change, both commits batch to the DOM
  // before the compositor's next paint, and the transition has no
  // "from" state to interpolate — the drawer snaps closed.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return;
    }
    const t = setTimeout(() => {
      document.body.style.overflow = "";
      setSelected(null);
      setExpanded((prev) => (prev.size === 0 ? prev : new Set()));
    }, 300);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    // Guarded: only refresh `expanded` when it actually has entries.
    // A blind `setExpanded(new Set())` schedules a re-render even
    // when the set is already empty, which would restart the
    // batching problem the [open] effect above is designed to
    // avoid.
    if (!selected) {
      setExpanded((prev) => (prev.size === 0 ? prev : new Set()));
    }
  }, [selected]);

  // Root entries — the four maisons + About Us.
  const aboutLink = links.find((l) => l.href.endsWith("/historia"));
  const contactLabel = labels.contactUs ?? (lang === "pt" ? "Contactar" : "Contact us");
  const findStoreLabel = labels.findStore ?? (lang === "pt" ? "Encontrar Loja" : "Find Store");

  // Just flip `open` — the useEffect above already resets selected +
  // expanded on close, and running setSelected here in the same tick
  // would rip the drilled-in panel content out mid slide-out and read
  // as a "flash close" instead of the intended left-to-right glide.
  function close() {
    setOpen(false);
  }

  // Escape closes the drawer. Focus return is handled by useFocusTrap
  // — it snapshots document.activeElement on activate and restores.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
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

      {mounted &&
        createPortal(
          <div
            ref={panelRef}
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label={labels.close ?? "Menu"}
            aria-hidden={!open}
            className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-cream"
            style={{
              transform: open ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s ease-out",
              pointerEvents: open ? "auto" : "none",
              willChange: "transform",
            }}
          >
          <div className="flex min-h-[100dvh] flex-1 flex-col [zoom:1.1112]">
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
                aria-label={labels.close ?? "Close"}
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
                const isLeather =
                  selected.slug === "pele" || selected.slug === "leather";
                const isWriting =
                  selected.slug === "escrita" || selected.slug === "writing";
                const tt = (l: { pt: string; en: string }) =>
                  lang === "pt" ? l.pt : l.en;
                // Resolve an item's href: prefer the explicit /t/... or
                // /c/escrita?... path when supplied (leather + writing
                // navs); fall back to the accessory-style ?col= URL.
                const itemHref = (it: MobileNavItem | { collection?: string; href?: string }) => {
                  if (it.href) return `/${lang}${it.href}`;
                  return `/${lang}/c/${selected.slug}?col=${encodeURIComponent(it.collection ?? "")}`;
                };
                // Structured sub-panel used by three of the four
                // universes — same visual language, different data.
                const rawNav: readonly MobileNavEntry[] | null =
                  isAccessories ? ACCESSORIES_NAV :
                  isLeather     ? LEATHER_NAV     :
                  isWriting     ? WRITING_NAV     : null;
                // Prune entries whose destinations have zero live products.
                // Sections whose items all die drop out entirely; flat
                // items drop individually.
                const pruneItem = (it: MobileNavItem): MobileNavItem | null => {
                  if (it.children && it.children.length > 0) {
                    const kids = it.children.filter((c) => isNavPathLive(itemHref(c), liveSignals));
                    if (kids.length === 0) return null;
                    return { ...it, children: kids };
                  }
                  return isNavPathLive(itemHref(it), liveSignals) ? it : null;
                };
                const nav: MobileNavEntry[] | null = rawNav
                  ? rawNav
                      .map((entry): MobileNavEntry | null => {
                        if (entry.kind === "item") {
                          return isNavPathLive(itemHref(entry), liveSignals) ? entry : null;
                        }
                        const items = entry.items
                          .map(pruneItem)
                          .filter((x): x is MobileNavItem => x !== null);
                        if (items.length === 0) return null;
                        const section: MobileNavSection = { ...entry, items };
                        return section;
                      })
                      .filter((x): x is MobileNavEntry => x !== null)
                  : null;
                if (nav) {
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
                      {nav.map((entry, i) => {
                        if (entry.kind === "item") {
                          return (
                            <li key={`flat-${i}`} className="border-b border-line/60">
                              <Link
                                href={itemHref(entry)}
                                onClick={close}
                                className="block py-3.5 text-[0.8rem] font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:text-gold"
                              >
                                {tt(entry.label)}
                              </Link>
                            </li>
                          );
                        }
                        // Section header — same caps-lock button style as the
                        // other rows. Set apart by a hairline gold rule
                        // above (not a background tint), so the visual
                        // language stays consistent.
                        const sectionKey = `section:${entry.title.en}`;
                        const sectionOpen = expanded.has(sectionKey);
                        return (
                          <li key={`sec-${i}`} className="border-b border-line/60">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(sectionKey)}
                              aria-expanded={sectionOpen}
                              className="flex w-full items-center justify-between py-3.5 text-left text-[0.8rem] font-medium tracking-[0.18em] text-ink uppercase transition-colors hover:text-gold"
                            >
                              <span>{tt(entry.title)}</span>
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                className={`transition-transform duration-200 ${sectionOpen ? "rotate-90" : ""}`}
                              >
                                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            {sectionOpen && (
                              <ul className="border-t border-line/40 pl-2">
                                {entry.allHref && (
                                  <li className="border-t border-line/40 first:border-t-0">
                                    <Link
                                      href={`/${lang}${entry.allHref}`}
                                      onClick={close}
                                      className="block py-3 pr-3 text-[0.75rem] tracking-[0.16em] text-gold uppercase transition-colors hover:text-ink"
                                    >
                                      {labels.viewAll}
                                    </Link>
                                  </li>
                                )}
                                {entry.items.map((it) => {
                                  const key = it.label.en;
                                  if (it.children) {
                                    const isOpen = expanded.has(key);
                                    return (
                                      <li key={key} className="border-t border-line/40 first:border-t-0">
                                        <button
                                          type="button"
                                          onClick={() => toggleExpanded(key)}
                                          aria-expanded={isOpen}
                                          className="flex w-full items-center justify-between py-3 pr-3 text-left text-[0.75rem] tracking-[0.16em] text-ink uppercase transition-colors hover:text-gold"
                                        >
                                          <span>{tt(it.label)}</span>
                                          <svg
                                            width="14"
                                            height="14"
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
                                          <ul className="ml-3 mb-2 border-l border-gold/40 pl-3">
                                            {it.children.map((child) => (
                                              <li key={child.label.en}>
                                                <Link
                                                  href={itemHref(child)}
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
                                    <li key={key} className="border-t border-line/40 first:border-t-0">
                                      <Link
                                        href={itemHref(it)}
                                        onClick={close}
                                        className="block py-3 pr-3 text-[0.75rem] tracking-[0.16em] text-ink uppercase transition-colors hover:text-gold"
                                      >
                                        {tt(it.label)}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
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
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
