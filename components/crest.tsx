// A small, refined maison emblem — a guilloché-style diamond lozenge in
// gold, flanked by thin rules. Gives page headers a sense of "support"
// without shouting. Decorative only.
export function Crest({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 text-gold ${className}`}
      aria-hidden
    >
      <span className="h-px w-20 bg-gradient-to-r from-transparent to-gold/60" />
      <svg width="76" height="76" viewBox="0 0 32 32" fill="none" stroke="currentColor">
        <path d="M16 2 L30 16 L16 30 L2 16 Z" strokeWidth="0.7" />
        <path d="M16 8 L24 16 L16 24 L8 16 Z" strokeWidth="0.6" opacity="0.7" />
        <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      <span className="h-px w-20 bg-gradient-to-l from-transparent to-gold/60" />
    </div>
  );
}
