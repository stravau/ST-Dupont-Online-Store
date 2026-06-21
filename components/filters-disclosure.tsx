"use client";

import { useEffect, useState } from "react";

// One single "Filtros" disclosure on /c/[category] — holds the
// collection switcher, the gender/usage chip rows and the price
// slider. Opens by default on desktop (>=md), collapsed on mobile
// where vertical space is tight. The active filter count renders
// next to the label so users see at a glance whether anything is
// applied without opening the panel.
export function FiltersDisclosure({
  label,
  clearLabel,
  clearHref,
  activeCount,
  children,
}: {
  label: string;
  clearLabel: string;
  clearHref: string;
  activeCount: number;
  children: React.ReactNode;
}) {
  // Default to closed (matches SSR + mobile). The effect below
  // promotes desktop visitors to open after hydration so the filter
  // chrome is visible without a click; mobile stays collapsed.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) setOpen(true);
  }, []);

  return (
    <div className="mt-8 border-y border-line">
      <div className="flex items-center justify-center gap-3 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={activeCount > 0 ? `${label} (${activeCount})` : label}
          className="inline-flex items-center gap-3 text-xs font-medium tracking-[0.22em] text-ink uppercase transition-colors hover:text-gold sm:text-sm sm:tracking-[0.24em]"
        >
          <span aria-hidden className="text-gold">{open ? "—" : "+"}</span>
          <span aria-hidden>{label}</span>
          {activeCount > 0 && (
            <span aria-hidden className="font-serif text-gold normal-case tracking-normal">
              ({activeCount})
            </span>
          )}
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
        {activeCount > 0 && (
          <a
            href={clearHref}
            className="text-[0.65rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold"
          >
            · {clearLabel}
          </a>
        )}
      </div>
      {open && (
        <div className="mx-auto flex max-w-2xl flex-col gap-7 px-4 pb-7 sm:px-8 sm:pb-9">
          {children}
        </div>
      )}
    </div>
  );
}
