"use client";

import { useEffect } from "react";

// Measures the fixed footer's rendered height and writes it onto the
// body as `--footer-h`, so the `padding-bottom: var(--footer-h)` rule
// in globals.css leaves exactly the right amount of "scroll-past" space
// to reveal the footer beneath the page content.
export function FooterReveal() {
  useEffect(() => {
    const f = document.querySelector<HTMLElement>("footer.app-footer-fixed");
    if (!f) return;
    const update = () => {
      // Body has `zoom: 0.9`, so its own padding is rendered at 0.9×.
      // The footer's `[zoom: 1.1112]` cancels the body zoom, rendering at
      // 1.0×. To leave space VISUALLY equal to the footer's actual height,
      // body's padding (which gets scaled by 0.9) must be set to
      // visualH / 0.9 in body CSS pixels.
      const visualH = f.getBoundingClientRect().height;
      document.body.style.setProperty(
        "--footer-h",
        `${Math.ceil(visualH / 0.9)}px`,
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(f);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      document.body.style.removeProperty("--footer-h");
    };
  }, []);
  return null;
}
