"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SORT_KEYS, type SortKey } from "@/lib/sort";

export interface SortLabels {
  label: string;
  featured: string;
  "price-asc": string;
  "price-desc": string;
  newest: string;
  name: string;
}

export function SortSelect({
  value,
  labels,
}: {
  value: SortKey;
  labels: SortLabels;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value as SortKey;
    const p = new URLSearchParams(params.toString());
    if (v && v !== "featured") p.set("sort", v);
    else p.delete("sort");
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="flex w-full max-w-full flex-col items-start gap-2 text-[0.7rem] tracking-[0.16em] text-muted uppercase sm:inline-flex sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      <span className="whitespace-nowrap">{labels.label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full min-w-0 appearance-none border border-line bg-paper bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2308172e%22%20stroke-width%3D%221.5%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1rem_1rem] bg-[right_0.75rem_center] bg-no-repeat py-2 pl-4 pr-9 text-xs tracking-[0.1em] text-ink uppercase outline-none transition-colors hover:border-gold focus:border-gold sm:w-auto sm:min-w-[13rem]"
      >
        {SORT_KEYS.map((k) => (
          <option key={k} value={k}>
            {labels[k]}
          </option>
        ))}
      </select>
    </label>
  );
}
