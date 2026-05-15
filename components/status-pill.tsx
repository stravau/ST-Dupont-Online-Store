import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

// "● Disponível / Available" — the ownable luxury in-stock cue (borrowed and
// refined from st-dupont.com's status pill).
export function StatusPill({ lang, className = "" }: { lang: Locale; className?: string }) {
  const dict = getDictionary(lang);
  return (
    <span
      className={`inline-flex items-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase text-muted ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2bb673] opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2bb673]" />
      </span>
      {dict.common.available}
    </span>
  );
}
