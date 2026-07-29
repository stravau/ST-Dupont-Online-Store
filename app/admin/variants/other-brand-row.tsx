"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import { OBRowCheckbox } from "./other-brand-selection";

type Role = "ADMIN" | "LOJA_LIS" | "LOJA_VNG";

// Uma linha da tabela de outras marcas (VNG). Espelho leve do VariantRow
// do lado Dupont, sem imagens, descrição-page ou split de stock (VNG-only).
// Editar: marca / EAN / PVP / stock / active. SKU fica imutável (chave natural
// que bate com o REF do Excel ECI VNG). PATCH on blur, com optimistic
// concurrency via expectedUpdatedAt.
//
// Acesso: só ADMIN e LOJA_VNG podem editar; LOJA_LIS não vê esta tabela.
export function OtherBrandRow({
  id,
  role,
  sku,
  brand: brandInit,
  ean: eanInit,
  descricao: descInit,
  pvpCents: priceInit,
  stock: stockInit,
  active: activeInit,
  updatedAt: updatedAtInit,
}: {
  id: string;
  role: Role;
  sku: string;
  brand: string;
  ean: string | null;
  descricao: string;
  pvpCents: number | null;
  stock: number;
  active: boolean;
  updatedAt: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [brand, setBrand] = useState(brandInit);
  const [ean, setEan] = useState<string>(eanInit ?? "");
  const [desc, setDesc] = useState(descInit);
  const [eurStr, setEurStr] = useState<string>(priceInit == null ? "" : (priceInit / 100).toFixed(2));
  const [stockStr, setStockStr] = useState<string>(String(stockInit));
  const [active, setActive] = useState(activeInit);

  const [savedBrand, setSavedBrand] = useState(brandInit);
  const [savedEan, setSavedEan] = useState<string | null>(eanInit);
  const [savedDesc, setSavedDesc] = useState(descInit);
  const [savedPvp, setSavedPvp] = useState<number | null>(priceInit);
  const [savedStock, setSavedStock] = useState(stockInit);
  const [savedActive, setSavedActive] = useState(activeInit);
  const [savedUpdatedAt, setSavedUpdatedAt] = useState(updatedAtInit);
  const [, startTransition] = useTransition();

  const canEdit = role === "ADMIN" || role === "LOJA_VNG";

  async function patch(body: Record<string, unknown>, label: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/other-brand/${id}`, {
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

  function commitBrand() {
    if (!canEdit) return;
    const trimmed = brand.trim().toUpperCase();
    if (trimmed === savedBrand) return;
    if (!trimmed) { setBrand(savedBrand); return; }
    startTransition(async () => {
      const ok = await patch({ brand: trimmed }, "Marca");
      if (ok) { setSavedBrand(trimmed); setBrand(trimmed); }
      else setBrand(savedBrand);
    });
  }
  function commitEan() {
    if (!canEdit) return;
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
  function commitDesc() {
    if (!canEdit) return;
    const trimmed = desc.trim();
    if (trimmed === savedDesc) return;
    if (!trimmed) { setDesc(savedDesc); return; }
    startTransition(async () => {
      const ok = await patch({ descricao: trimmed }, "Descrição");
      if (ok) { setSavedDesc(trimmed); setDesc(trimmed); }
      else setDesc(savedDesc);
    });
  }
  function commitPvp() {
    if (!canEdit) return;
    const raw = eurStr.trim();
    if (raw === "") {
      // Empty → clear PVP (allowed — some ECI rows genuinely lack a price)
      if (savedPvp === null) return;
      startTransition(async () => {
        const ok = await patch({ pvpCents: null }, "PVP");
        if (ok) setSavedPvp(null);
        else setEurStr(savedPvp == null ? "" : (savedPvp / 100).toFixed(2));
      });
      return;
    }
    const cents = Math.round(Number.parseFloat(raw.replace(",", ".")) * 100);
    if (!Number.isFinite(cents) || cents < 0) {
      setEurStr(savedPvp == null ? "" : (savedPvp / 100).toFixed(2));
      return;
    }
    if (cents === savedPvp) return;
    startTransition(async () => {
      const ok = await patch({ pvpCents: cents }, "PVP");
      if (ok) setSavedPvp(cents);
      else setEurStr(savedPvp == null ? "" : (savedPvp / 100).toFixed(2));
    });
  }
  function commitStock() {
    if (!canEdit) return;
    const parsed = Number.parseInt(stockStr.trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 0) { setStockStr(String(savedStock)); return; }
    if (parsed === savedStock) return;
    startTransition(async () => {
      const ok = await patch({ stock: parsed }, "Stock");
      if (ok) setSavedStock(parsed);
      else setStockStr(String(savedStock));
    });
  }
  function commitActive(next: boolean) {
    if (!canEdit) return;
    if (next === savedActive) return;
    setActive(next);
    startTransition(async () => {
      const ok = await patch({ active: next }, next ? "Activado" : "Desactivado");
      if (ok) setSavedActive(next);
      else setActive(savedActive);
    });
  }

  const stockTone =
    savedStock <= 0 ? "text-[#b94a3a]" :
    savedStock <= 5 ? "text-[#7e5e00]" :
                       "text-ink";

  const lockedCell = "cursor-not-allowed bg-cream/20 text-muted";
  const editableCell = "hover:bg-cream/50 focus:border-gold focus:bg-paper focus:outline-none";

  return (
    <tr className={`transition-colors hover:bg-cream/40 ${!savedActive ? "opacity-60" : ""}`}>
      {canEdit && (
        <td className="px-3 py-2 text-center align-middle">
          <OBRowCheckbox id={id} />
        </td>
      )}
      <td className="px-4 py-2 align-middle">
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          onBlur={commitBrand}
          readOnly={!canEdit}
          aria-label={`Marca de ${sku}`}
          className={`w-32 rounded-sm border border-transparent bg-transparent px-2 py-2 text-[0.72rem] tracking-[0.06em] uppercase text-muted transition-colors sm:py-1 ${canEdit ? editableCell : lockedCell}`}
        />
      </td>
      <td className="px-4 py-2 align-middle">
        <input
          value={ean}
          onChange={(e) => setEan(e.target.value)}
          onBlur={commitEan}
          readOnly={!canEdit}
          placeholder="—"
          aria-label={`EAN de ${sku}`}
          inputMode="numeric"
          className={`w-36 rounded-sm border border-transparent bg-transparent px-2 py-2 font-mono text-xs tabular-nums text-muted transition-colors sm:py-1 ${canEdit ? editableCell : lockedCell}`}
        />
      </td>
      <td className="px-4 py-2 align-middle font-mono text-[0.72rem] tracking-tight text-ink">{sku}</td>
      <td className="px-4 py-2 align-middle">
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={commitDesc}
          readOnly={!canEdit}
          aria-label={`Descrição de ${sku}`}
          className={`w-full min-w-[16rem] max-w-[28rem] rounded-sm border border-transparent bg-transparent px-2 py-2 text-sm text-ink transition-colors sm:py-1 ${canEdit ? editableCell : lockedCell}`}
        />
      </td>
      <td className="px-4 py-2 text-right align-middle">
        <input
          value={eurStr}
          onChange={(e) => setEurStr(e.target.value)}
          onBlur={commitPvp}
          readOnly={!canEdit}
          placeholder="—"
          aria-label={`PVP de ${sku} em euros`}
          inputMode="decimal"
          className={`w-24 rounded-sm border border-transparent bg-transparent px-2 py-2 text-right text-sm font-medium tabular-nums transition-colors sm:py-1 ${canEdit ? editableCell : lockedCell}`}
        />
        {eurStr && <span className="ml-0.5 text-xs text-muted">€</span>}
      </td>
      <td className="px-4 py-2 text-right align-middle">
        <input
          value={stockStr}
          onChange={(e) => setStockStr(e.target.value)}
          onBlur={commitStock}
          readOnly={!canEdit}
          aria-label={`Stock VNG de ${sku}`}
          inputMode="numeric"
          className={`w-16 rounded-sm border border-transparent bg-transparent px-2 py-2 text-right text-sm tabular-nums transition-colors sm:py-1 ${canEdit ? editableCell : lockedCell} ${stockTone}`}
        />
      </td>
      <td className="px-4 py-2 text-center align-middle">
        {canEdit ? (
          <button
            type="button"
            onClick={() => commitActive(!active)}
            aria-label={`${active ? "Desactivar" : "Activar"} ${sku}`}
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[0.62rem] tracking-[0.12em] uppercase transition-colors ${
              active
                ? "border-[#2bb673]/50 bg-[#2bb673]/10 text-[#155f3a] hover:bg-[#2bb673]/20"
                : "border-line bg-cream/40 text-muted hover:bg-cream"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#2bb673]" : "bg-muted"}`} />
            {active ? "Activo" : "Inactivo"}
          </button>
        ) : (
          <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[0.62rem] tracking-[0.12em] uppercase ${
            active
              ? "border-[#2bb673]/50 bg-[#2bb673]/10 text-[#155f3a]"
              : "border-line bg-cream/40 text-muted"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#2bb673]" : "bg-muted"}`} />
            {active ? "Activo" : "Inactivo"}
          </span>
        )}
      </td>
    </tr>
  );
}
