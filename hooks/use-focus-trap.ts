"use client";

import { useEffect, useRef, type RefObject } from "react";

// Keep keyboard focus inside a container while it is "active" (open).
// Wire into modals, mobile-nav drawer, mega-menu panels: pass the ref
// on the panel's root element and a boolean toggle for open state.
//
// On activate: moves focus to the first tabbable child inside the
// container. On Tab / Shift+Tab: cycles focus so it never leaves. On
// deactivate: restores focus to the element that had it before the
// trap engaged (or to `returnFocusRef.current` if provided — useful
// when the trigger element is unmounted with the panel).
//
// Escape key handling is intentionally NOT included — callers wire
// their own Escape listener so they can decide what "close" means
// (mobile-nav slide-out has state to reset first, modals just call
// their onClose, etc.).
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  returnFocusRef?: RefObject<HTMLElement | null>,
): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the first tabbable inside the container on activate. We defer
    // one microtask so the panel's own mount effects have flushed first
    // (Radix-style modals often add tabindex="-1" to background elements
    // via a portal — we want to run after that so we don't grab a
    // wrongly-tabbable descendant).
    const focusFirst = () => {
      const first = getTabbable(container)[0];
      if (first) first.focus();
      else container.focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const tabbables = getTabbable(container!);
      if (tabbables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (activeEl === first || !container!.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
      const restore = returnFocusRef?.current ?? previouslyFocused;
      if (restore && typeof restore.focus === "function") {
        restore.focus();
      }
    };
  }, [active, returnFocusRef]);

  return containerRef;
}

// Descendant tabbable selector — matches native focusable elements
// plus explicit tabindex="0" nodes. Excludes disabled and hidden.
const TABBABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getTabbable(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(TABBABLE_SELECTORS),
  );
  return nodes.filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.tabIndex !== -1 &&
      el.offsetParent !== null,
  );
}
