"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// One observer per page: finds every `.reveal` element that hasn't yet
// become visible and adds `.is-visible` (which the CSS transitions to).
// Re-runs on route change so newly-rendered elements get observed.
export function RevealRoot() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"),
    );
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
