"use client";

import { usePathname, useRouter } from "next/navigation";

// Day selector for the sales-report page. Changing the date reloads the page
// with ?date=…, so the server re-fetches that day. The export button links to
// the same day's .xlsx.
export function ReportDatePicker({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-end gap-4 border border-line bg-paper p-5">
      <label className="block">
        <span className="overline text-[0.55rem] text-muted">Dia</span>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && router.push(`${pathname}?date=${e.target.value}`)}
          className="mt-2 block rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
        />
      </label>
      <a
        href={`/api/admin/reports/export?date=${date}`}
        download
        className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[0.7rem] tracking-[0.18em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink"
      >
        Exportar Excel ↓
      </a>
    </div>
  );
}
