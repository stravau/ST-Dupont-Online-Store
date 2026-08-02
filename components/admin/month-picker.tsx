"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Month selector for the reports page. Changing it reloads with ?month=YYYY-MM
// so the server re-scopes the summary, log and best-sellers to that month.
//
// Preserva os restantes parâmetros: antes reescrevia a query string inteira,
// portanto mudar de mês limpava silenciosamente o ?boutique= e a página
// saltava de "Lisboa" para "Geral" sem o utilizador perceber porquê.
export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  return (
    <label className="inline-flex items-center gap-2.5 border border-line bg-paper px-3 py-2">
      <span className="text-[0.6rem] tracking-[0.16em] text-muted uppercase">Mês</span>
      <input
        type="month"
        value={month}
        onChange={(e) => {
          if (!e.target.value) return;
          const params = new URLSearchParams(search.toString());
          params.set("month", e.target.value);
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="bg-transparent text-sm text-ink outline-none"
      />
    </label>
  );
}
