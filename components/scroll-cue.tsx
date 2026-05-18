"use client";

// "Our Maisons" + arrow that smooth-scrolls to the #maisons section.
// Uses scrollIntoView so it's reliably smooth regardless of CSS/zoom.
export function ScrollCue({ label }: { label: string }) {
  function go() {
    document
      .getElementById("maisons")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
