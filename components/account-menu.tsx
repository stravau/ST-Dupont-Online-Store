"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AccountMenuItem {
  label: string;
  href: string;
}

// Header account button: opens a dropdown sized like the cart popup,
// with Personal Information / Orders / Wishlist / Addresses and a red
// "Sign out" button pinned to the bottom.
export function AccountMenu({
  ariaLabel,
  title,
  items,
  signOutAction,
  signOutLabel,
}: {
  ariaLabel: string;
  title: string;
  items: AccountMenuItem[];
  signOutAction: (formData: FormData) => Promise<void>;
  signOutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => {
    queueMicrotask(() => setOpen(false));
  }, [pathname]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center text-ink transition-colors hover:text-gold"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-3 w-max min-w-[13rem] max-w-[calc(100vw-2rem)] border border-line bg-cream shadow-[0_18px_50px_rgba(10,26,48,0.25)]">
          <p className="overline border-b border-line px-5 py-4">{title}</p>

          <ul className="divide-y divide-line/70">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-4 text-sm tracking-[0.04em] text-ink transition-colors hover:bg-paper hover:text-gold"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>

          <form action={signOutAction} className="border-t border-line p-4">
            <button
              type="submit"
              className="block w-full bg-[#a93226] py-4 text-center text-xs tracking-[0.22em] text-cream uppercase transition-colors duration-300 hover:bg-[#8e2a20]"
            >
              {signOutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
