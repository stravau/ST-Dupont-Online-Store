"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

type Status = "DISPONIVEL" | "INDISPONIVEL" | "DESCONTINUADO";

// One row of the admin variants table — every editable cell holds
// optimistic state, posts a PATCH /api/admin/variant/:id on blur (or
// select-change for status), and reverts + flashes red on failure.
export function VariantRow({
  id,
  sku,
  ean: eanInit,
  desc,
  priceCents: priceInit,
  status: statusInit,
  stock: stockInit,
  productName,
  productSlug,
}: {
  id: string;
  sku: string;
  ean: string | null;
  desc: string;
  priceCents: number;
  status: Status;
  stock: number;
  productName: string;
  productSlug: string;
}) {
  const [ean, setEan]       = useState<string>(eanInit ?? "");
  const [eurStr, setEurStr] = useState<string>((priceInit / 100).toFixed(2));
  const [status, setStatus] = useState<Status>(statusInit);
  const [stock, setStock]   = useState<number>(stockInit);
  const [savingFlash, setSavingFlash] = useState<null | "saving" | "saved" | "error">(null);
  const [, startTransition] = useTransition();

  async function patch(body: Record<string, unknown>) {
    setSavingFlash("saving");
    try {
      const res = await fetch(`/api/admin/variant/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSavingFlash("saved");
      // Drop the flash after a beat so the row doesn't stay tinted.
      setTimeout(() => setSavingFlash(null), 1200);
    } catch {
      setSavingFlash("error");
      setTimeout(() => setSavingFlash(null), 2500);
    }
  }

  function commitEan() {
    const trimmed = ean.trim();
    if (trimmed === (eanInit ?? "")) return;
    startTransition(() => patch({ ean: trimmed === "" ? null : trimmed }));
  }
  function commitPvp() {
    const cents = Math.round(Number.parseFloat(eurStr.replace(",", ".")) * 100);
    if (!Number.isFinite(cents) || cents < 0) { setEurStr((priceInit / 100).toFixed(2)); return; }
    if (cents === priceInit) return;
    startTransition(() => patch({ priceCents: cents }));
  }
  function commitStatus(next: Status) {
    if (next === status) return;
    setStatus(next);
    startTransition(() => patch({ status: next }));
  }
  function commitStock(next: number) {
    if (next === stock) return;
    setStock(next);
    startTransition(() => patch({ stock: next }));
  }

  const rowBg =
    savingFlash === "saving" ? "bg-cream/40" :
    savingFlash === "saved"  ? "bg-green-50" :
    savingFlash === "error"  ? "bg-red-50"   :
                                "";

  return (
    <tr className={`${rowBg} transition-colors`}>
      <td className="px-3 py-2">
        <input
          value={ean}
          onChange={(e) => setEan(e.target.value)}
          onBlur={commitEan}
          placeholder="—"
          className="w-36 border border-transparent bg-transparent px-2 py-1 text-sm tabular-nums focus:border-line focus:bg-paper"
        />
      </td>
      <td className="px-3 py-2 font-mono text-xs tracking-tight">{sku}</td>
      <td className="px-3 py-2 text-ink">{desc}</td>
      <td className="px-3 py-2 text-right">
        <input
          value={eurStr}
          onChange={(e) => setEurStr(e.target.value)}
          onBlur={commitPvp}
          className="w-20 border border-transparent bg-transparent px-2 py-1 text-right text-sm tabular-nums focus:border-line focus:bg-paper"
        />
        <span className="text-xs text-muted">€</span>
      </td>
      <td className="px-3 py-2">
        <select
          value={status}
          onChange={(e) => commitStatus(e.target.value as Status)}
          className="border border-line bg-paper px-2 py-1 text-xs tracking-[0.12em] uppercase outline-none focus:border-gold"
        >
          <option value="DISPONIVEL">Disponível</option>
          <option value="INDISPONIVEL">Indisponível</option>
          <option value="DESCONTINUADO">Descontinuado</option>
        </select>
      </td>
      <td className="px-3 py-2 text-right">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(Number.parseInt(e.target.value, 10) || 0)}
          onBlur={() => commitStock(stock)}
          className="w-16 border border-transparent bg-transparent px-2 py-1 text-right text-sm tabular-nums focus:border-line focus:bg-paper"
        />
      </td>
      <td className="px-3 py-2 text-xs">
        {productSlug ? (
          <Link href={`/pt/p/${productSlug}`} target="_blank" className="text-muted underline-offset-2 hover:text-gold hover:underline">
            {productName}
          </Link>
        ) : (
          <span className="text-muted">{productName}</span>
        )}
      </td>
    </tr>
  );
}
