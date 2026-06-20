"use client";

import { useState } from "react";
import type { Spec } from "@/lib/specs";

// Collapsible "Details & Specifications" panel for the product page.
// Closed by default; the "+" rotates to "×"-like minus and the list
// reveals with a height/opacity transition.
export function SpecDetails({ title, specs }: { title: string; specs: Spec[] }) {
  const [open, setOpen] = useState(false);
  if (specs.length === 0) return null;

  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-line">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between py-6 text-left"
        >
          <span className="text-sm tracking-[0.18em] text-ink uppercase">{title}</span>
          <span
            className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-gold transition-transform duration-300 ${
              open ? "rotate-45" : ""
            }`}
            aria-hidden
          >
            {/* "+" that rotates 45° into an "×" when open */}
            <span className="absolute h-px w-3 bg-current" />
            <span className="absolute h-3 w-px bg-current" />
          </span>
        </button>
      </h2>

      {/* Plain conditional mount — the previous `grid-rows-[0fr → 1fr]`
          animation silently no-ops on iOS Safari 16, which made the
          accordion look empty when expanded. Direct mount/unmount with
          a fade-in is universally compatible. */}
      {open && (
        <div className="overflow-hidden motion-safe:animate-[fadeIn_220ms_ease-out]">
          <dl className="divide-y divide-line/70 pb-8">
            {specs.map((s) => (
              <div key={s.label} className="grid grid-cols-[40%_1fr] gap-4 py-3.5 text-sm">
                <dt className="overline text-[0.6rem] text-muted">{s.label}</dt>
                <dd className="text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
