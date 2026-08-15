"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";

export interface ProductOption {
  slug: string;
  label: string;
  collection: string;
  category: string;
}

export interface UnmappedRow {
  sku: string;
  ean: string | null;
  desc: string;
  priceCents: number;
  stockLis: number;
  stockVng: number;
  suggestion: string | null;
  valorCents: number;
}

const eur = (c: number) => (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

// Uma linha por artigo sem ficha, com o produto de destino a escolher. A
// sugestão vem pré-seleccionada quando o servidor encontrou uma com confiança
// suficiente — mas fica sempre editável, porque a semelhança de texto acerta
// muitas vezes e erra outras tantas.
export function RemapTable({ rows, options }: { rows: UnmappedRow[]; options: ProductOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const [escolha, setEscolha] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.sku, r.suggestion ?? ""])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [feito, setFeito] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState("");

  const visiveis = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.sku.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || (r.ean ?? "").includes(q),
    );
  }, [rows, filtro]);

  const porSugerir = rows.filter((r) => !r.suggestion && !feito.has(r.sku)).length;

  async function ligar(sku: string) {
    const slug = escolha[sku];
    if (!slug) { toast.push("error", "Escolhe o produto de destino"); return; }
    setBusy(sku);
    try {
      const res = await fetch("/api/admin/variants/remap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, productSlug: slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { toast.push("error", data.error ?? `HTTP ${res.status}`); return; }
      setFeito((prev) => new Set(prev).add(sku));
      toast.push("success", `${sku} ligado a ${slug}`);
      // Sem router.refresh() aqui: recarregar a lista a meio faria as linhas
      // saltar debaixo do cursor. A linha fica marcada como feita e a página
      // actualiza-se quando o utilizador quiser.
    } catch (e) {
      toast.push("error", (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtrar por REF, EAN ou descrição…"
          className="min-w-[18rem] flex-1 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <div className="flex items-center gap-4 text-[0.7rem] text-muted">
          {feito.size > 0 && (
            <span className="text-[#1f7a4d]">{feito.size} ligados nesta sessão</span>
          )}
          {porSugerir > 0 && <span>{porSugerir} sem sugestão</span>}
          {feito.size > 0 && (
            <button
              type="button"
              onClick={() => router.refresh()}
              className="border border-line bg-paper px-3 py-1.5 tracking-[0.14em] uppercase transition-colors hover:border-gold"
            >
              Actualizar lista
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto border border-line bg-paper">
        <table className="min-w-full text-sm">
          <thead className="bg-cream/50 text-[0.6rem] tracking-[0.16em] text-muted uppercase">
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-left font-medium">REF</th>
              <th className="px-4 py-3 text-left font-medium">Descrição</th>
              <th className="px-4 py-3 text-right font-medium">PVP</th>
              <th className="px-4 py-3 text-right font-medium">LIS</th>
              <th className="px-4 py-3 text-right font-medium">VNG</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-left font-medium">Ligar ao produto</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {visiveis.map((r) => {
              const done = feito.has(r.sku);
              return (
                <tr key={r.sku} className={done ? "opacity-40" : undefined}>
                  <td className="px-4 py-2.5 font-mono text-[0.75rem] whitespace-nowrap text-ink">{r.sku}</td>
                  <td className="max-w-[20rem] px-4 py-2.5 text-[0.8rem] text-ink/90">
                    {r.desc}
                    {r.ean && <span className="mt-0.5 block font-mono text-[0.65rem] text-muted">{r.ean}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap text-muted">{eur(r.priceCents)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.stockLis || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.stockVng || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums whitespace-nowrap text-ink">
                    {eur(r.valorCents)}
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={escolha[r.sku] ?? ""}
                      onChange={(e) => setEscolha((p) => ({ ...p, [r.sku]: e.target.value }))}
                      disabled={done}
                      className={`w-full min-w-[16rem] border bg-paper px-2 py-1.5 text-[0.78rem] outline-none focus:border-gold ${
                        r.suggestion && escolha[r.sku] === r.suggestion ? "border-gold/60" : "border-line"
                      }`}
                    >
                      <option value="">— escolher —</option>
                      {options.map((o) => (
                        <option key={o.slug} value={o.slug}>
                          {o.label} {o.collection ? `· ${o.collection}` : ""}
                        </option>
                      ))}
                    </select>
                    {r.suggestion && escolha[r.sku] === r.suggestion && (
                      <span className="mt-1 block text-[0.62rem] text-gold">sugerido — confirma antes de ligar</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => ligar(r.sku)}
                      disabled={done || busy === r.sku || !escolha[r.sku]}
                      className="border border-gold bg-gold px-3 py-1.5 text-[0.62rem] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream disabled:opacity-30"
                    >
                      {done ? "Ligado" : busy === r.sku ? "…" : "Ligar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-3xl text-[0.72rem] text-muted">
        Ligar move a variante para o produto escolhido e torna-a visível no site.
        O stock, o EAN e o PVP não mudam. A variante passa a herdar a página, a
        categoria e — se não tiver imagem própria — a fotografia desse produto,
        por isso vale a pena confirmar que a foto faz sentido para a cor certa.
      </p>
    </div>
  );
}
