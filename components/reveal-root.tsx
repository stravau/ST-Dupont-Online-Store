"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// One observer per page: finds every `.reveal` element and TOGGLES
// `.is-visible` based on intersection — so the entry animation replays
// each time an element scrolls back into view (up or down), not just on
// first reveal. Re-runs on route change to pick up freshly rendered DOM.
export function RevealRoot() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
          else e.target.classList.remove("is-visible");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
