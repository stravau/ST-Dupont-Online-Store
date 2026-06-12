"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Exposes the header's transparent state to descendants (MobileNav, Logo,
// utility icons) so they can pick explicit cream-vs-ink colours instead of
// relying on the CSS cascade to override Tailwind's text-ink utilities — a
// fight we kept losing on certain browsers / Safari builds.
const HeaderTransparentContext = createContext(false);
export function useHeaderTransparent() {
  return useContext(HeaderTransparentContext);
}

// Scroll-aware wrapper for the site header. On the homepage the chrome starts
// fully transparent (video hero shows through) and fades to the cream/95
// backdrop as the user scrolls past the hero. Every other route keeps the
// solid cream backdrop from the first paint.
//
// Hover behaviour: while the header is in its transparent state, hovering
// anywhere on it temporarily flips it to the opaque cream backdrop (and the
// text + logo follow, because the React context value flips too). Mouse-leave
// brings it back. Touch devices don't fire hover so the default transparent
// look stays on mobile.
export function HeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/pt" || pathname === "/en";
  const [transparent, setTransparent] = useState(isHome);
  const [hovered, setHovered] = useState(false);

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

  // Effective state — transparency only when the user isn't hovering the
  // chrome. The context, data attribute, bg class and CSS rules all flow
  // from this one value, so logo, text and bg flip together.
  const effective = transparent && !hovered;

  return (
    <HeaderTransparentContext.Provider value={effective}>
      <header
        // Pointer events instead of mouse events so we can filter out
        // touch — otherwise tapping the hamburger on mobile fires a
        // synthetic mouseenter, the header flips to opaque cream, and
        // when the menu closes the user is left looking at a white bar
        // instead of the video again.
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setHovered(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setHovered(false);
        }}
        data-transparent={effective}
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          effective ? "bg-transparent" : "bg-cream/95 backdrop-blur"
        }`}
      >
        {children}
      </header>
    </HeaderTransparentContext.Provider>
  );
}
