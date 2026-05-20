"use client";

import { createPortal } from "react-dom";

// Full-viewport spinner shown while an action is in flight (add-to-cart,
// etc.). Portalled to document.body so no ancestor transform/zoom can
// trap or off-centre it. `[zoom: 1.1112]` cancels the body's `zoom: 0.9`
// so the overlay genuinely fills the viewport and the spinner sits in
// the true visual centre.
export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show || typeof document === "undefined") return null;
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/35 backdrop-blur-sm [zoom:1.1112]"
    >
      <svg
        className="h-14 w-14 animate-spin text-gold"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.25"
        />
        <path
          d="M21 12a9 9 0 0 1-9 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    document.body,
  );
}
