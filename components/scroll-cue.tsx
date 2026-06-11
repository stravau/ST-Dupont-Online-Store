import Link from "next/link";

// Plain in-page anchor. No custom JS scrolling — the browser computes the
// correct target (and honours the section's scroll-margin), which the
// hand-rolled rAF tween could not do under the global CSS `zoom`. The label
// pulses (letter-spacing / opacity) and the chevron gently bounces to draw
// the eye to the cue.
export function ScrollCue({ label, href = "#maisons" }: { label: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex flex-col items-center gap-4 text-gold-soft transition-colors hover:text-cream"
    >
      <span className="cue-glow text-base font-medium uppercase tracking-[0.22em] md:text-[1.35rem]">
        {label}
      </span>
      <svg
        className="cue-bounce h-11 w-11 md:h-16 md:w-16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
