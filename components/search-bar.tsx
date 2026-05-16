"use client";

import { useState, useRef, useEffect } from "react";

export function SearchBar({
  lang,
  placeholder,
  label,
}: {
  lang: string;
  placeholder: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="block text-ink transition-colors hover:text-gold"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <form
          action={`/${lang}/pesquisa`}
          method="get"
          className="absolute right-0 top-9 z-50 flex w-72 border border-line bg-paper shadow-xl"
        >
          <input
            ref={inputRef}
            type="search"
            name="q"
            placeholder={placeholder}
            aria-label={label}
            className="w-full bg-transparent px-4 py-3 text-sm text-ink outline-none"
          />
          <button
            type="submit"
            aria-label={label}
            className="bg-ink px-4 text-cream transition-colors hover:bg-gold hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
