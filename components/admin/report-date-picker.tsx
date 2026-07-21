"use client";

import { usePathname, useRouter } from "next/navigation";

// Date-range selector for the sales-report page. Two `<input type="date">`
// fields — from + to — reload the page with ?from=…&to=… so the server
// re-fetches that window. The export button links to the same window's
// .xlsx. Same-day export is still possible (from === to) and produces a
// day-shaped report; wider ranges get a period-shaped one.
export function ReportDatePicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function nav(nextFrom: string, nextTo: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextFrom)) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextTo)) return;
    router.push(`${pathname}?from=${nextFrom}&to=${nextTo}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 border border-line bg-paper p-5">
      <label className="block">
        <span className="overline text-[0.55rem] text-muted">De</span>
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => nav(e.target.value, to)}
          className="mt-2 block rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="overline text-[0.55rem] text-muted">Até</span>
        <input
          type="date"
          value={to}
          min={from}
          onChange={(e) => nav(from, e.target.value)}
          className="mt-2 block rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
        />
      </label>
      <a
        href={`/api/admin/reports/export?from=${from}&to=${to}`}
        download
        className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[0.7rem] tracking-[0.18em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink"
      >
        Exportar Excel ↓
      </a>
    </div>
  );
}
