"use client";

// "Our Maisons" + arrow that scrolls to the #maisons section.
// Manual rAF tween (easeOutCubic) — native smooth scroll is broken on
// desktop Chrome when an ancestor uses CSS `zoom`, so we animate ourselves.
export function ScrollCue({ label }: { label: string }) {
  function go() {
    const el = document.getElementById("maisons");
    if (!el) return;
    const offset = 72;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      window.scrollBy(0, el.getBoundingClientRect().top - offset);
      return;
    }

    // Self-correcting easing: each frame move a fraction of the element's
    // *current* distance from the top. No precomputed absolute target, so
    // the CSS `zoom` unit mismatch can't break it; it just converges.
    let frames = 0;
    function tick() {
      const remaining = el!.getBoundingClientRect().top - offset;
      if (Math.abs(remaining) < 2 || frames > 150) return;
      window.scrollBy(0, remaining * 0.18);
      frames += 1;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
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
