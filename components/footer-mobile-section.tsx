"use client";

import { useState, type ReactNode } from "react";

// Mobile-only accordion row used inside the site footer. Mirrors the
// mobile-nav row style: caps-lock label, chevron, hairline divider,
// content slides open on tap. Desktop uses the existing 3-column grid
// instead and never renders this component.
export function FooterMobileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-cream/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-[0.75rem] font-medium tracking-[0.22em] text-cream uppercase transition-colors hover:text-gold"
      >
        <span>{title}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="pb-5 text-center">{children}</div>}
    </div>
  );
}
