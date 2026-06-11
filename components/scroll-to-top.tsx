"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Forces a scroll-to-top whenever the pathname OR search params change. Next's
// default scroll-restoration handles full route changes, but same-path
// navigations (?col=Cohiba → ?col=Ligne 2 from the mega-menu) leave the user
// halfway down the previous listing. This component fixes that.
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Use 'auto' rather than 'smooth' so it feels like a real page change
    // instead of a long scroll animation that fights the page transition.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, searchParams]);

  return null;
}
