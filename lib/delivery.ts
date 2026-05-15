import type { Locale } from "@/lib/i18n";

// Indicative delivery estimate: ~5 working days out, skipping weekends.
// (Replace with the real carrier SLA per shipping method in Phase 4/5.)
export function estimatedDeliveryDate(locale: Locale, workingDays = 5): string {
  const d = new Date();
  let added = 0;
  while (added < workingDays) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}
