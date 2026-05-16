"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Quiet top-left "back to home" link. Hidden on the home route itself.
export function BackHome({ lang, label }: { lang: string; label: string }) {
  const pathname = usePathname();
  const home = `/${lang}`;
  if (pathname === home || pathname === `${home}/`) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-6">
      <Link
        href={home}
        className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </Link>
    </div>
  );
}
