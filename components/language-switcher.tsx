"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === current) return;
    const rest = pathname.replace(/^\/(pt|en)/, "");
    router.push(`/${next}${rest || ""}`);
  }

  return (
    <div className="flex items-center gap-2 text-xs tracking-widest">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-line">/</span>}
          <button
            type="button"
            onClick={() => switchTo(l)}
            aria-current={l === current}
            className={`uppercase transition-colors ${
              l === current ? "text-gold" : "text-muted hover:text-ink"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
