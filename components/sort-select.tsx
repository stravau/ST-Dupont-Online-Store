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
    <label className="inline-flex items-center gap-3 text-[0.7rem] tracking-[0.16em] text-muted uppercase">
      {labels.label}
      <select
        value={value}
        onChange={onChange}
        className="border border-line bg-paper px-4 py-2 text-xs tracking-[0.1em] text-ink uppercase outline-none transition-colors hover:border-gold focus:border-gold"
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
