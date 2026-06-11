"use client";

import { useState } from "react";
import Link from "next/link";

// Discrete collection switcher used on /c/[category]. Collapsed by default —
// shows a single thin "Browse Collections" button with a chevron. Expanded,
// reveals the full set of pill links. Replaces the previous always-on grid
// of 16+ pills that wrapped into 3-4 rows and ate ~150 px of vertical space
// before users could see any products. The control mirrors how Cartier /
// Louis Vuitton handle in-category navigation: minimal until invoked.
export function CategoryNav({
  items,
  lang,
  browseLabel,
  closeLabel,
}: {
  items: { label: string; href: string }[];
  lang: string;
  browseLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10 border-y border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mx-auto flex w-full items-center justify-center gap-3 py-5 text-xs font-medium tracking-[0.22em] text-ink uppercase transition-colors hover:text-gold sm:text-sm sm:tracking-[0.24em]"
      >
        <span aria-hidden className="text-gold">{open ? "—" : "+"}</span>
        {open ? closeLabel : browseLabel}
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <nav className="flex flex-wrap items-center justify-center gap-2 px-2 pb-6 sm:gap-3 sm:px-6">
          {items.map((g) => (
            <Link
              key={g.href}
              href={`/${lang}${g.href}`}
              className="group inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.65rem] tracking-[0.18em] text-ink uppercase transition-colors duration-300 hover:border-gold hover:bg-ink hover:text-cream sm:px-5 sm:py-2.5 sm:text-xs"
            >
              {g.label}
              <span className="text-gold transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
