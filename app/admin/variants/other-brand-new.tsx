"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

// Botão "+ Novo artigo" + modal para criar OtherBrandItem manualmente.
// A REF é obrigatória e única — não gera automaticamente para não colidir
// com uma futura sincronia do ECI que traga a mesma linha.
export function NewOtherBrandButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-gold bg-gold px-4 py-2 text-[0.68rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
      >
        + Novo artigo
      </button>
      {open && <NewOtherBrandModal onClose={() => setOpen(false)} />}
    </>
  );
}

function NewOtherBrandModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [ref, setRef] = useState("");
  const [brand, setBrand] = useState("");
  const [ean, setEan] = useState("");
  const [descricao, setDescricao] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [stockStr, setStockStr] = useState("0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    // Client-side validation antes de bater no servidor
    const refT = ref.trim();
    const brandT = brand.trim().toUpperCase();
    const descT = descricao.trim();
    if (!refT) return setError("REF obrigatório");
    if (!brandT) return setError("Marca obrigatória");
    if (!descT) return setError("Descrição obrigatória");
    const eanT = ean.trim();
    if (eanT && !/^\d{8}$|^\d{13}$/.test(eanT)) return setError("EAN deve ter 8 ou 13 dígitos");

    const priceRaw = priceStr.trim();
    let pvpCents: number | null = null;
    if (priceRaw) {
      const cents = Math.round(Number.parseFloat(priceRaw.replace(",", ".")) * 100);
      if (!Number.isFinite(cents) || cents < 0) return setError("PVP inválido");
      pvpCents = cents;
    }
    const stockN = Number.parseInt(stockStr.trim(), 10);
    if (!Number.isFinite(stockN) || stockN < 0) return setError("Stock inválido");

    setBusy(true);
    try {
      const res = await fetch("/api/admin/other-brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref: refT,
          brand: brandT,
          ean: eanT || undefined,
          descricao: descT,
          pvpCents,
          stock: stockN,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      toast.push("success", `Criado: ${refT} · ${brandT}`);
      router.refresh();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-ob-title"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg border border-gold/40 bg-paper p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="new-ob-title" className="font-serif text-xl text-ink">Novo artigo · Outras marcas</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted transition-colors hover:text-ink">✕</button>
        </div>
        <p className="mb-4 text-[0.72rem] text-muted">
          Só para artigos que ainda não estão no ficheiro ECI VNG. Se a REF já vier de lá numa sincronia futura,
          usa-a aqui exactamente para evitar duplicar.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-1">
            <span className="overline mb-1 block text-[0.55rem] text-muted">REF (obrigatório)</span>
            <input
              autoFocus
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="ex.: LY1200152"
              className="w-full border border-line bg-paper px-3 py-2 font-mono text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="overline mb-1 block text-[0.55rem] text-muted">Marca (obrigatório)</span>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value.toUpperCase())}
              placeholder="ex.: LAMY"
              className="w-full border border-line bg-paper px-3 py-2 text-sm uppercase outline-none focus:border-gold"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="overline mb-1 block text-[0.55rem] text-muted">Descrição (obrigatório)</span>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="ex.: Recarga esferográfica azul"
              className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="overline mb-1 block text-[0.55rem] text-muted">EAN (opcional, 8 ou 13 dígitos)</span>
            <input
              value={ean}
              onChange={(e) => setEan(e.target.value)}
              placeholder="—"
              inputMode="numeric"
              className="w-full border border-line bg-paper px-3 py-2 font-mono text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="overline mb-1 block text-[0.55rem] text-muted">PVP em € (opcional)</span>
            <input
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full border border-line bg-paper px-3 py-2 text-right text-sm tabular-nums outline-none focus:border-gold"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="overline mb-1 block text-[0.55rem] text-muted">Stock inicial</span>
            <input
              value={stockStr}
              onChange={(e) => setStockStr(e.target.value)}
              inputMode="numeric"
              className="w-full border border-line bg-paper px-3 py-2 text-right text-sm tabular-nums outline-none focus:border-gold"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 border border-[#b94a3a]/40 bg-[#b94a3a]/10 px-3 py-2 text-sm text-[#8c2a2a]">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="border border-line bg-paper px-4 py-2 text-[0.65rem] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="bg-ink px-5 py-2 text-[0.65rem] tracking-[0.14em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:opacity-40"
          >
            {busy ? "A criar…" : "Criar artigo"}
          </button>
        </div>
      </form>
    </div>
  );
}
