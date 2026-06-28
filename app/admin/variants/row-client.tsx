"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

type Status = "DISPONIVEL" | "INDISPONIVEL" | "DESCONTINUADO";
type Role   = "ADMIN" | "LOJA_LIS" | "LOJA_VNG";

// One row of the admin variants table — optimistic edits, PATCH on
// blur (or select-change for status). Per-store stock columns:
// LOJA_LIS only edits Stk LIS, LOJA_VNG only Stk VNG, ADMIN both;
// the Total column is read-only and always reflects LIS + VNG.
//
// Concurrent-edit safety: every PATCH carries the `updatedAt` we last
// saw, so the server refuses (409) when another admin edited the row
// in between. We surface the conflict with a toast + router.refresh()
// so the row re-renders against the new server state.
export function VariantRow({
  id,
  role,
  sku,
  ean: eanInit,
  desc,
  priceCents: priceInit,
  status: statusInit,
  stockLis: stockLisInit,
  stockVng: stockVngInit,
  updatedAt: updatedAtInit,
  productName,
  productSlug,
}: {
  id: string;
  role: Role;
  sku: string;
  ean: string | null;
  desc: string;
  priceCents: number;
  status: Status;
  stockLis: number;
  stockVng: number;
  updatedAt: string;
  productName: string;
  productSlug: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [ean, setEan]       = useState<string>(eanInit ?? "");
  const [eurStr, setEurStr] = useState<string>((priceInit / 100).toFixed(2));
  const [status, setStatus] = useState<Status>(statusInit);
  const [lisStr, setLisStr] = useState<string>(String(stockLisInit));
  const [vngStr, setVngStr] = useState<string>(String(stockVngInit));
  const [savedEan, setSavedEan] = useState<string | null>(eanInit);
  const [savedPriceCents, setSavedPriceCents] = useState<number>(priceInit);
  const [savedStatus, setSavedStatus] = useState<Status>(statusInit);
  const [savedLis, setSavedLis] = useState<number>(stockLisInit);
  const [savedVng, setSavedVng] = useState<number>(stockVngInit);
  const [savedUpdatedAt, setSavedUpdatedAt] = useState<string>(updatedAtInit);
  const [, startTransition] = useTransition();

  const isAdmin    = role === "ADMIN";
  const canEditLis = isAdmin || role === "LOJA_LIS";
  const canEditVng = isAdmin || role === "LOJA_VNG";

  async function patch(body: Record<string, unknown>, label: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/variant/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, expectedUpdatedAt: savedUpdatedAt }),
      });
      if (res.status === 409) {
        toast.push("error", `${label}: conflito — alguém editou este artigo entretanto, a recarregar`);
        router.refresh();
        return false;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string }));
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setSavedUpdatedAt(new Date().toISOString());
      toast.push("success", `${label} guardado`);
      return true;
    } catch (e) {
      toast.push("error", `Falha em ${label}: ${(e as Error).message}`);
      return false;
    }
  }

  function commitEan() {
    if (!isAdmin) return;
    const trimmed = ean.trim();
    if (trimmed === (savedEan ?? "")) return;
    if (trimmed !== "" && !/^\d{8}$|^\d{13}$/.test(trimmed)) {
      toast.push("error", "EAN deve ter 8 ou 13 dígitos");
      setEan(savedEan ?? "");
      return;
    }
    const next = trimmed === "" ? null : trimmed;
    startTransition(async () => {
      const ok = await patch({ ean: next }, "EAN");
      if (ok) setSavedEan(next);
      else setEan(savedEan ?? "");
    });
  }
  function commitPvp() {
    if (!isAdmin) return;
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
    if (!isAdmin) return;
    if (next === savedStatus) return;
    if (next === "DESCONTINUADO") {
      const ok = typeof window === "undefined" ? true : window.confirm(
        `Descontinuar ${sku}? Vai desaparecer da loja.`,
      );
      if (!ok) return;
    }
    setStatus(next);
    startTransition(async () => {
      const ok = await patch({ status: next }, "Status");
      if (ok) setSavedStatus(next);
      else setStatus(savedStatus);
    });
  }
  function commitLis() {
    if (!canEditLis) return;
    const parsed = Number.parseInt(lisStr.trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 0) { setLisStr(String(savedLis)); return; }
    if (parsed === savedLis) return;
    startTransition(async () => {
      const ok = await patch({ stockLis: parsed }, "Stock Lisboa");
      if (ok) setSavedLis(parsed);
      else setLisStr(String(savedLis));
    });
  }
  function commitVng() {
    if (!canEditVng) return;
    const parsed = Number.parseInt(vngStr.trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 0) { setVngStr(String(savedVng)); return; }
    if (parsed === savedVng) return;
    startTransition(async () => {
      const ok = await patch({ stockVng: parsed }, "Stock V.N. Gaia");
      if (ok) setSavedVng(parsed);
      else setVngStr(String(savedVng));
    });
  }

  // Optimistic totals — sum the in-flight values so the Total column
  // updates the instant the user changes either store column, even
  // before the PATCH lands.
  const liveLis = Number.parseInt(lisStr.trim(), 10);
  const liveVng = Number.parseInt(vngStr.trim(), 10);
  const total =
    (Number.isFinite(liveLis) ? liveLis : savedLis) +
    (Number.isFinite(liveVng) ? liveVng : savedVng);
  const totalTone =
    total <= 0 ? "text-[#b94a3a]" :
    total <= 5 ? "text-[#7e5e00]" :
                  "text-ink";

  const statusTone =
    status === "DISPONIVEL"   ? "border-[#2bb673]/60 bg-[#2bb673]/15 text-[#155f3a]" :
    status === "INDISPONIVEL" ? "border-[#d4a017]/70 bg-[#d4a017]/15 text-[#6a4f00]" :
                                 "border-[#8b95a6]/70 bg-[#8b95a6]/15 text-[#3a4452]";

  // Per-cell editability cosmetics — read-only cells render as muted
  // text without an input border so it's instantly clear what a
  // boutique role can touch.
  const lockedCell = "cursor-not-allowed bg-cream/20 text-muted";
  const editableCell = "hover:bg-cream/50 focus:border-gold focus:bg-paper focus:outline-none";

  return (
    <tr className="transition-colors hover:bg-cream/40">
      <td className="px-4 py-2 align-middle">
        <input
          value={ean}
          onChange={(e) => setEan(e.target.value)}
          onBlur={commitEan}
          readOnly={!isAdmin}
          placeholder="—"
          aria-label={`EAN de ${sku}`}
          inputMode="numeric"
          className={`w-36 rounded-sm border border-transparent bg-transparent px-2 py-2 font-mono text-xs tabular-nums transition-colors sm:py-1 ${isAdmin ? editableCell : lockedCell}`}
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
          readOnly={!isAdmin}
          aria-label={`PVP de ${sku} em euros`}
          inputMode="decimal"
          className={`w-20 rounded-sm border border-transparent bg-transparent px-2 py-2 text-right text-sm font-medium tabular-nums transition-colors sm:py-1 ${isAdmin ? editableCell : lockedCell}`}
        />
        <span className="ml-0.5 text-xs text-muted">€</span>
      </td>
      <td className="px-4 py-2 align-middle">
        {isAdmin ? (
          <select
            value={status}
            onChange={(e) => commitStatus(e.target.value as Status)}
            aria-label={`Estado de ${sku}`}
            className={`appearance-none rounded-sm border px-2.5 py-1.5 pr-6 text-[0.65rem] tracking-[0.12em] uppercase outline-none transition-colors focus:border-gold ${statusTone}`}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23999' stroke-width='1.5' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center", backgroundSize: "12px" }}
          >
            <option value="DISPONIVEL">Disponível</option>
            <option value="INDISPONIVEL">Indisponível</option>
            <option value="DESCONTINUADO">Descontinuado</option>
          </select>
        ) : (
          <span className={`inline-block rounded-sm border px-2.5 py-1.5 text-[0.65rem] tracking-[0.12em] uppercase ${statusTone}`}>
            {status === "DISPONIVEL" ? "Disponível" : status === "INDISPONIVEL" ? "Indisponível" : "Descontinuado"}
          </span>
        )}
      </td>
      {/* Stk LIS */}
      <td className="px-4 py-2 text-right align-middle">
        <input
          value={lisStr}
          onChange={(e) => setLisStr(e.target.value)}
          onBlur={commitLis}
          readOnly={!canEditLis}
          aria-label={`Stock Lisboa de ${sku}`}
          inputMode="numeric"
          className={`w-16 rounded-sm border border-transparent bg-transparent px-2 py-2 text-right text-sm tabular-nums transition-colors sm:py-1 ${canEditLis ? editableCell : lockedCell}`}
        />
      </td>
      {/* Stk VNG */}
      <td className="px-4 py-2 text-right align-middle">
        <input
          value={vngStr}
          onChange={(e) => setVngStr(e.target.value)}
          onBlur={commitVng}
          readOnly={!canEditVng}
          aria-label={`Stock V.N. Gaia de ${sku}`}
          inputMode="numeric"
          className={`w-16 rounded-sm border border-transparent bg-transparent px-2 py-2 text-right text-sm tabular-nums transition-colors sm:py-1 ${canEditVng ? editableCell : lockedCell}`}
        />
      </td>
      {/* Total — derived, always read-only */}
      <td className="px-4 py-2 text-right align-middle">
        <span className={`inline-block px-2 py-1 text-sm font-semibold tabular-nums ${totalTone}`}>{total}</span>
      </td>
      <td className="px-4 py-2 align-middle text-xs">
        <div className="flex flex-col gap-0.5">
          {productSlug ? (
            <Link href={`/pt/p/${productSlug}`} target="_blank" className="truncate text-muted transition-colors hover:text-gold">{productName}</Link>
          ) : (
            <span className="truncate text-muted">{productName}</span>
          )}
          {isAdmin && (
            <div className="flex gap-3 text-[0.6rem] tracking-[0.16em] text-gold uppercase">
              <Link href={`/admin/variants/${sku}/images`} className="transition-colors hover:underline">Imagens →</Link>
              <Link href={`/admin/variants/${sku}/description`} className="transition-colors hover:underline">Descrição →</Link>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
