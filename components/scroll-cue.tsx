"use client";

// "Our Maisons" + arrow that scrolls to the #maisons section.
// Manual rAF tween (easeOutCubic) — native smooth scroll is broken on
// desktop Chrome when an ancestor uses CSS `zoom`, so we animate ourselves.
export function ScrollCue({ label }: { label: string }) {
  function go() {
    const el = document.getElementById("maisons");
    if (!el) return;

    const targetY = el.getBoundingClientRect().top + window.scrollY - 72;
    const startY = window.scrollY;
    const dist = targetY - startY;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || Math.abs(dist) < 4) {
      window.scrollTo(0, targetY);
      return;
    }

    const duration = 750;
    let t0: number | null = null;
    function step(ts: number) {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      window.scrollTo(0, startY + dist * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return (
    <button
      type="button"
      onClick={go}
      aria-label={label}
      className="mt-14 flex flex-col items-center gap-4 text-gold-soft transition-colors hover:text-cream"
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
