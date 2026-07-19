"use client";

import { usePathname, useRouter } from "next/navigation";

// Month selector for the reports page. Changing it reloads with ?month=YYYY-MM
// so the server re-scopes the summary, log and best-sellers to that month.
export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <label className="inline-flex items-center gap-2.5 border border-line bg-paper px-3 py-2">
      <span className="text-[0.6rem] tracking-[0.16em] text-muted uppercase">Mês</span>
      <input
        type="month"
        value={month}
        onChange={(e) => e.target.value && router.push(`${pathname}?month=${e.target.value}`)}
        className="bg-transparent text-sm text-ink outline-none"
      />
    </label>
  );
}
