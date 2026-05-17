"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { routeLabel } from "@/lib/route-label";
import type { Locale } from "@/lib/i18n";

interface Entry {
  p: string;
  t?: string;
}

// Global "Back" control. Tracks the in-app navigation stack (per tab) and
// shows the *previously visited* page by its real title, e.g.
// "← Isqueiro Ligne 2" or "← Writing". Falls back to Home on a fresh entry.
export function NavBack({ lang, homeLabel }: { lang: Locale; homeLabel: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [prev, setPrev] = useState<Entry | null>(null);
  const home = `/${lang}`;
  const isHome = pathname === home || pathname === `${home}/`;

  useEffect(() => {
    const KEY = "navStack";
    const cleanTitle = () =>
      document.title.replace(/\s*[·|]\s*S\.?T\.?\s*Dupont.*$/i, "").trim() || undefined;

    let stack: Entry[] = [];
    try {
      stack = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    } catch {
      stack = [];
    }
    if (stack[stack.length - 2]?.p === pathname) {
      stack.pop(); // went back
    } else if (stack[stack.length - 1]?.p !== pathname) {
      stack.push({ p: pathname });
    }
    // Capture the current page's title (settles a tick after navigation).
    stack[stack.length - 1].t = cleanTitle();
    sessionStorage.setItem(KEY, JSON.stringify(stack));
    const before = stack[stack.length - 2];
    setPrev(before && before.p !== pathname ? before : null);

    const id = setTimeout(() => {
      try {
        const s: Entry[] = JSON.parse(sessionStorage.getItem(KEY) || "[]");
        if (s[s.length - 1]?.p === pathname) {
          s[s.length - 1].t = cleanTitle();
          sessionStorage.setItem(KEY, JSON.stringify(s));
        }
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [pathname]);

  if (isHome) return null;

  const label = prev ? prev.t || routeLabel(prev.p, lang) : homeLabel;

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
