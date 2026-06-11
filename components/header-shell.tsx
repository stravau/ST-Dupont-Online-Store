"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Scroll-aware wrapper for the site header. On the homepage the chrome starts
// fully transparent (video hero shows through) and fades to the cream/95
// backdrop as the user scrolls past the hero. Every other route keeps the
// solid cream backdrop from the first paint. Text colour follows the
// transparency via a `data-transparent` attribute (CSS rules in globals.css).
export function HeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/pt" || pathname === "/en";
  const [transparent, setTransparent] = useState(isHome);

  useEffect(() => {
    if (!isHome) {
      queueMicrotask(() => setTransparent(false));
      return;
    }
    const onScroll = () => {
      // Start opaque once we've left the hero — give a small buffer so the
      // swap doesn't happen the moment a finger touches the trackpad.
      setTransparent(window.scrollY < window.innerHeight - 120);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <header
      data-transparent={transparent}
      className={`sticky top-0 z-50 transition-colors duration-500 ${
        transparent ? "bg-transparent" : "bg-cream/95 backdrop-blur"
      }`}
    >
      {children}
    </header>
  );
}
