"use client";

// "Our Maisons" + arrow that scrolls to the #maisons section.
// Uses offsetTop layout coordinates (consistent with scrollY under the
// global CSS `zoom`, unlike getBoundingClientRect) + a manual rAF tween,
// so it animates reliably on desktop and mobile.
export function ScrollCue({ label }: { label: string }) {
  function go() {
    const el = document.getElementById("maisons");
    if (!el) return;
    const headerOffset = 72;

    // Absolute document position via the offsetParent chain (layout px).
    let y = 0;
    let n: HTMLElement | null = el;
    while (n) {
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    const targetY = Math.max(0, y - headerOffset);
    const startY = window.scrollY;
    const dist = targetY - startY;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || Math.abs(dist) < 4) {
      window.scrollTo(0, targetY);
      return;
    }

    const duration = 700;
    let t0: number | null = null;
    function frame(ts: number) {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      window.scrollTo(0, startY + dist * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  return (
    <button
      type="button"
      onClick={go}
      aria-label={label}
      className="flex flex-col items-center gap-4 text-gold-soft transition-colors hover:text-cream"
    >
      <span className="text-base font-medium uppercase tracking-[0.22em] md:text-[1.35rem]">
        {label}
      </span>
      <svg
        className="scroll-hint h-11 w-11 md:h-16 md:w-16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
