"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// One observer per page: finds every `.reveal` element and TOGGLES
// `.is-visible` based on intersection — so the entry animation replays
// each time an element scrolls back into view (up or down), not just on
// first reveal.
//
// A `loading.tsx` Suspense boundary means the page content can stream into
// the DOM AFTER this effect first runs (the pathname flips while the loading
// fallback — which has no `.reveal` nodes — is still on screen). If we only
// queried once, that late content would stay stuck at `opacity: 0`. So we also
// watch the tree with a MutationObserver and observe any `.reveal` node as it
// arrives. `.reveal` elements are hidden until revealed, so this is what makes
// a page visible at all after a client-side navigation.
export function RevealRoot() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // Promote to GPU layer just for the duration of the
            // transition (.is-revealing in CSS), then drop it on
            // arrival (.is-visible resets will-change: auto) so we
            // don't keep dozens of compositor layers alive at rest.
            e.target.classList.add("is-revealing");
            e.target.classList.add("is-visible");
          } else {
            e.target.classList.remove("is-visible");
            e.target.classList.remove("is-revealing");
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const observed = new WeakSet<Element>();
    const scan = () => {
      for (const el of document.querySelectorAll<HTMLElement>(".reveal")) {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      }
    };

    scan();
    // Content streamed in after this effect (Suspense/loading.tsx) is caught
    // here so its `.reveal` nodes get observed and revealed.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);
  return null;
}
