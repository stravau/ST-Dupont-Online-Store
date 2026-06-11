"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuCategory } from "@/components/mega-menu";
import { Logo } from "@/components/logo";
import { useHeaderTransparent } from "@/components/header-shell";

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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);
  // Read the header transparent state directly rather than relying on
  // CSS cascade — picking the colour explicitly here is more robust
  // across browsers (Safari's stroke="currentColor" inheritance behaviour
  // in particular kept letting Tailwind's text-ink win).
  const transparent = useHeaderTransparent();
  // Foolproof visibility: when the header is transparent over the video,
  // wrap the icon in a small rounded ink-with-blur backdrop so the cream
  // hamburger is obvious even if the underlying frame is bright or the
  // video failed to load and the page bg is leaking through. On the
  // normal opaque header the backdrop disappears and we just show the
  // ink icon on cream.
  const triggerClasses = transparent
    ? "text-cream bg-ink/55 backdrop-blur-sm rounded-md p-1.5"
    : "text-ink";

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
        // Portal the panel to document.body so it lives OUTSIDE the
        // transparent-header DOM. Otherwise the page-level CSS rule that
        // forces every .text-ink / svg / img descendant of a transparent
        // header to cream also makes every link and the logo inside this
        // overlay cream — invisible against the cream backdrop. The
        // hamburger pill stays inside the header (it needs the transparent
        // styling); only the open panel escapes.
        // [zoom:1.1112] composes with the body's zoom: 0.9 so the panel
        // still fills the viewport on Chromium; 100dvh handles iOS' URL-bar.
        createPortal(
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
          </div>,
          document.body,
        )}
    </div>
  );
}
