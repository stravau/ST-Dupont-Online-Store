"use client";

import { useEffect } from "react";

// Fires a single POST /api/product-view after mount with the current
// product's slug. The endpoint bumps Product.viewCount + appends a row
// to ProductView (admin analytics). sessionStorage gate stops the same
// session from inflating its own counts during a quick re-mount (e.g.
// switching ?v= colourways triggers a soft remount of the page tree).
export function TrackProductView({ slug }: { slug: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `pv:${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* private mode / quota — proceed anyway */
    }
    fetch("/api/product-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      // keepalive lets the request finish even if the user navigates
      // away immediately after landing on the page.
      keepalive: true,
    }).catch(() => {
      /* swallow — a missed impression is fine */
    });
  }, [slug]);
  return null;
}
