"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/toast";

type Status = "DISPONIVEL" | "INDISPONIVEL" | "DESCONTINUADO";

// One row of the admin variants table — optimistic edits, PATCH on
// blur (or select-change for status). Status renders inline as a
// styled <select> that adopts the colour of the chosen tone so the
// table reads at a glance.
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
  const toast = useToast();
  const [ean, setEan]       = useState<string>(eanInit ?? "");
  const [eurStr, setEurStr] = useState<string>((priceInit / 100).toFixed(2));
  const [status, setStatus] = useState<Status>(statusInit);
  const [stock, setStock]   = useState<number>(stockInit);
  // Server-confirmed values — `ean`/`eurStr`/`status`/`stock` are the
  // optimistic local state, these are what's actually persisted. After a
  // successful PATCH we update both; on failure we roll the optimistic
  // state back here. Previously the row would silently lie when the
  // server rejected (UI showed the new value, DB held the old).
  const [savedEan, setSavedEan] = useState<string | null>(eanInit);
  const [savedPriceCents, setSavedPriceCents] = useState<number>(priceInit);
  const [savedStatus, setSavedStatus] = useState<Status>(statusInit);
  const [savedStock, setSavedStock] = useState<number>(stockInit);
  const [, startTransition] = useTransition();

  async function patch(body: Record<string, unknown>, label: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/variant/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.push("success", `${label} guardado`);
      return true;
    } catch (e) {
      toast.push("error", `Falha em ${label}: ${(e as Error).message}`);
      return false;
    }
  }

  function commitEan() {
    const trimmed = ean.trim();
    if (trimmed === (savedEan ?? "")) return;
    const next = trimmed === "" ? null : trimmed;
    startTransition(async () => {
      const ok = await patch({ ean: next }, "EAN");
      if (ok) setSavedEan(next);
      else setEan(savedEan ?? ""); // roll back the input
    });
  }
  function commitPvp() {
    const cents = Math.round(Number.parseFloat(eurStr.replace(",", ".")) * 100);
    if (!Number.isFinite(cents) || cents < 0) { setEurStr((savedPriceCents / 100).toFixed(2)); return; }
    if (cents === savedPriceCents) return;
    startTransition(async () => {
      const ok = await patch({ priceCents: cents }, "PVP");
      if (ok) setSavedPriceCents(cents);
      else setEurStr((savedPriceCents / 100).toFixed(2));
    });
  }
  function commitStatus(next: Status) {
    if (next === savedStatus) return;
    setStatus(next);
    startTransition(async () => {
      const ok = await patch({ status: next }, "Status");
      if (ok) setSavedStatus(next);
      else setStatus(savedStatus); // dropdown snaps back
    });
  }
  function commitStock(next: number) {
    if (next === savedStock) return;
    if (next < 0) { setStock(savedStock); return; }
    setStock(next);
    startTransition(async () => {
      const ok = await patch({ stock: next }, "Stock");
      if (ok) setSavedStock(next);
      else setStock(savedStock);
    });
  }

  const statusTone =
    status === "DISPONIVEL"   ? "border-[#2bb673]/40 bg-[#2bb673]/8 text-[#1f7a4d]" :
    status === "INDISPONIVEL" ? "border-[#d4a017]/50 bg-[#d4a017]/10 text-[#7e5e00]" :
                                 "border-[#8b95a6]/50 bg-[#8b95a6]/10 text-[#4a5466]";

  return (
    <tr className="transition-colors hover:bg-cream/40">
      <td className="px-4 py-2 align-middle">
        <input
          value={ean}
          onChange={(e) => setEan(e.target.value)}
          onBlur={commitEan}
          placeholder="—"
          className="w-36 rounded-sm border border-transparent bg-transparent px-2 py-1 font-mono text-xs tabular-nums transition-colors hover:bg-cream/50 focus:border-gold focus:bg-paper focus:outline-none"
        />
      </td>
      <td className="px-4 py-2 align-middle font-mono text-[0.7rem] tracking-tight text-muted">{sku}</td>
      <td className="px-4 py-2 align-middle">
        <span className="block max-w-[28rem] truncate text-sm text-ink" title={desc}>{desc}</span>
      </td>
      <td className="px-4 py-2 text-right align-middle">
        <input
          value={eurStr}
          onChange={(e) => setEurStr(e.target.value)}
          onBlur={commitPvp}
          className="w-20 rounded-sm border border-transparent bg-transparent px-2 py-1 text-right text-sm font-medium tabular-nums transition-colors hover:bg-cream/50 focus:border-gold focus:bg-paper focus:outline-none"
        />
        <span className="ml-0.5 text-xs text-muted">€</span>
      </td>
      <td className="px-4 py-2 align-middle">
        <select
          value={status}
          onChange={(e) => commitStatus(e.target.value as Status)}
          className={`appearance-none rounded-sm border px-2.5 py-1 pr-6 text-[0.65rem] tracking-[0.12em] uppercase outline-none transition-colors focus:border-gold ${statusTone}`}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23999' stroke-width='1.5' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center", backgroundSize: "12px" }}
        >
          <option value="DISPONIVEL">Disponível</option>
          <option value="INDISPONIVEL">Indisponível</option>
          <option value="DESCONTINUADO">Descontinuado</option>
        </select>
      </td>
      <td className="px-4 py-2 text-right align-middle">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(Number.parseInt(e.target.value, 10) || 0)}
          onBlur={() => commitStock(stock)}
          className={`w-16 rounded-sm border border-transparent bg-transparent px-2 py-1 text-right text-sm tabular-nums transition-colors hover:bg-cream/50 focus:border-gold focus:bg-paper focus:outline-none ${stock <= 0 ? "text-[#b94a3a]" : stock <= 5 ? "text-[#7e5e00]" : "text-ink"}`}
        />
      </td>
      <td className="px-4 py-2 align-middle text-xs">
        <div className="flex flex-col gap-0.5">
          {productSlug ? (
            <Link href={`/pt/p/${productSlug}`} target="_blank" className="truncate text-muted transition-colors hover:text-gold">{productName}</Link>
          ) : (
            <span className="truncate text-muted">{productName}</span>
          )}
          <div className="flex gap-3 text-[0.6rem] tracking-[0.16em] text-gold uppercase">
            <Link href={`/admin/variants/${sku}/images`} className="transition-colors hover:underline">
              Imagens →
            </Link>
            <Link href={`/admin/variants/${sku}/description`} className="transition-colors hover:underline">
              Descrição →
            </Link>
          </div>
        </div>
      </td>
    </tr>
  );
}
