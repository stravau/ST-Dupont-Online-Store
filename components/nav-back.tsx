"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { routeLabel } from "@/lib/route-label";
import type { Locale } from "@/lib/i18n";

// Global "Back" control. Tracks the in-app navigation stack (per tab) so it
// shows the *previously visited* page, e.g. "← Writing" after going from
// Writing into Writing Accessories. Falls back to Home on a fresh entry.
export function NavBack({ lang, homeLabel }: { lang: Locale; homeLabel: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [prev, setPrev] = useState<string | null>(null);
  const home = `/${lang}`;
  const isHome = pathname === home || pathname === `${home}/`;

  useEffect(() => {
    const KEY = "navStack";
    let stack: string[] = [];
    try {
      stack = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    } catch {
      stack = [];
    }
    if (stack[stack.length - 2] === pathname) {
      // user went back — drop the page we left
      stack.pop();
    } else if (stack[stack.length - 1] !== pathname) {
      stack.push(pathname);
    }
    sessionStorage.setItem(KEY, JSON.stringify(stack));
    const before = stack[stack.length - 2];
    setPrev(before && before !== pathname ? before : null);
  }, [pathname]);

  if (isHome) return null;

  const label = prev ? routeLabel(prev, lang) : homeLabel;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-6">
      {prev ? (
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold"
        >
          <Arrow />
          {label}
        </button>
      ) : (
        <Link
          href={home}
          className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-gold"
        >
          <Arrow />
          {label}
        </Link>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
