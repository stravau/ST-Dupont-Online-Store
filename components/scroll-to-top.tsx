"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Forces a scroll-to-top whenever the pathname OR search params change — with
// one important exception. Same-page param flips like the "Show all" toggle
// (?all=1) or a page-number bump (?page=2) should LEAVE the user where they
// are so they can keep reading from the same spot. Anything else (a new
// pathname, a new filter, a new sort) still scrolls.
//
// To detect that: remember the previous (pathname, params) and compare. If
// only `all` or `page` changed, we skip the scroll.
const STAY_PUT_KEYS = new Set(["all", "page"]);

export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prev = useRef<{ pathname: string; serialized: string } | null>(null);

  useEffect(() => {
    const serialized = searchParams.toString();
    const previous = prev.current;
    prev.current = { pathname, serialized };

    // First render — no scroll, just record the baseline.
    if (!previous) return;

    // Different path = real navigation, always scroll.
    if (previous.pathname !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    // Same path. Diff the params; if every changed key is in the stay-put
    // set, hold position. Otherwise (new filter, sort, gender, etc.) scroll.
    const before = new URLSearchParams(previous.serialized);
    const after = new URLSearchParams(serialized);
    const changed = new Set<string>();
    for (const k of new Set([...before.keys(), ...after.keys()])) {
      if (before.get(k) !== after.get(k)) changed.add(k);
    }
    const onlyStayPut = changed.size > 0 && [...changed].every((k) => STAY_PUT_KEYS.has(k));
    if (changed.size > 0 && !onlyStayPut) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname, searchParams]);

  return null;
}
