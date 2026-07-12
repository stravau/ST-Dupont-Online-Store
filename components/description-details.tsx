"use client";

import { useState } from "react";

// Collapsible "Descrição / Description" panel — sits above SpecDetails
// on the PDP. Same visual language as SpecDetails (caps title, "+"
// rotates 45° into "×", fade-in on mount) so the two read as a pair.
export function DescriptionDetails({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  if (!body) return null;

  return (
    <section className="mx-auto mt-12 max-w-3xl border-t border-line">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="tap-none flex w-full items-center justify-between py-4 text-left"
        >
          <span className="text-sm tracking-[0.18em] text-ink uppercase">{title}</span>
          <span
            className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-gold transition-transform duration-300 ${
              open ? "rotate-45" : ""
            }`}
            aria-hidden
          >
            <span className="absolute h-px w-3 bg-current" />
            <span className="absolute h-3 w-px bg-current" />
          </span>
        </button>
      </h2>

      {open && (
        <div className="overflow-hidden motion-safe:animate-[fadeIn_220ms_ease-out]">
          <p className="pb-8 text-base leading-relaxed text-muted">{body}</p>
        </div>
      )}
    </section>
  );
}
