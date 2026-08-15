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
export interface CategoryOption {
  slug: string;
  label: string;
}

export function RemapTable({
  rows,
  options,
  categories,
}: {
  rows: UnmappedRow[];
  options: ProductOption[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  // Artigo em que se carregou "Criar produto" — abre a caixa por baixo da
  // linha. Nem tudo o que está no saco pertence a um produto existente: um
  // Line D Vitruvian é uma linha que nunca foi criada, e ligá-lo a outra
  // coisa qualquer seria pior do que deixá-lo invisível.
  const [criar, setCriar] = useState<UnmappedRow | null>(null);
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
                    <div className="flex flex-col items-stretch gap-1.5">
                      <button
                        type="button"
                        onClick={() => ligar(r.sku)}
                        disabled={done || busy === r.sku || !escolha[r.sku]}
                        className="border border-gold bg-gold px-3 py-1.5 text-[0.62rem] tracking-[0.14em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream disabled:opacity-30"
                      >
                        {done ? "Ligado" : busy === r.sku ? "…" : "Ligar"}
                      </button>
                      {!done && (
                        <button
                          type="button"
                          onClick={() => setCriar(r)}
                          className="border border-line px-3 py-1.5 text-[0.6rem] tracking-[0.12em] text-muted uppercase transition-colors hover:border-gold hover:text-ink"
                        >
                          Criar produto
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-3xl text-[0.72rem] text-muted">
        <strong>Ligar</strong> move a variante para um produto que já existe — herda a
        página, a categoria e a fotografia dele. <strong>Criar produto</strong> é para
        quando não existe onde encaixar: nasce uma página nova, publicada mas sem
        fotografia, que fica a faltar. Em qualquer dos casos o stock, o EAN e o PVP
        não mudam.
      </p>

      {criar && (
        <CriarProdutoModal
          row={criar}
          categories={categories}
          onClose={() => setCriar(null)}
          onDone={(sku) => {
            setFeito((prev) => new Set(prev).add(sku));
            setCriar(null);
          }}
        />
      )}
    </div>
  );
}

// Criar uma página de raiz a partir da variante. O nome vem pré-preenchido com
// a descrição do ECI, que costuma ser abreviada e em maiúsculas — por isso o
// campo é editável e o aviso pede para o rever antes de gravar.
function CriarProdutoModal({
  row,
  categories,
  onClose,
  onDone,
}: {
  row: UnmappedRow;
  categories: CategoryOption[];
  onClose: () => void;
  onDone: (sku: string) => void;
}) {
  const toast = useToast();
  const [nome, setNome] = useState(row.desc);
  const [categoria, setCategoria] = useState(categories[0]?.slug ?? "");
  const [colecao, setColecao] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!nome.trim()) { setErro("O nome é obrigatório."); return; }
    if (!categoria) { setErro("Escolhe a categoria."); return; }
    setBusy(true);
    setErro(null);
    try {
      const res = await fetch("/api/admin/variants/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: row.sku, nome: nome.trim(), categorySlug: categoria, collection: colecao.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) { setErro(data.error ?? `HTTP ${res.status}`); return; }
      toast.push("success", `Produto criado: /${data.slug}`);
      onDone(row.sku);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={busy ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg border border-gold/40 bg-paper p-6 shadow-2xl"
      >
        <h2 className="font-serif text-xl text-ink">Criar produto</h2>
        <p className="mt-1 font-mono text-[0.72rem] text-muted">
          {row.sku}
          {row.ean ? ` · ${row.ean}` : ""} · {eur(row.priceCents)}
        </p>

        <label className="mt-5 block">
          <span className="overline mb-1.5 block text-[0.55rem] text-muted">Nome do produto *</span>
          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <span className="mt-1.5 block text-[0.66rem] text-muted italic">
            Vem da descrição do ECI, abreviada e em maiúsculas. É este o nome que
            o cliente vê — vale a pena reescrevê-lo por extenso.
          </span>
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="overline mb-1.5 block text-[0.55rem] text-muted">Categoria *</span>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="overline mb-1.5 block text-[0.55rem] text-muted">Colecção</span>
            <input
              value={colecao}
              onChange={(e) => setColecao(e.target.value)}
              placeholder="Ex.: Line D Vitruvian"
              className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
        </div>

        <p className="mt-4 border border-gold/40 bg-gold/5 px-3 py-2 text-[0.72rem] text-[#7e5e00]">
          O produto fica publicado <strong>sem fotografia</strong> — essa não vem do
          Excel. Aparece com a imagem provisória até alguém carregar a foto em
          Consultar Stock → imagens.
        </p>

        {erro && (
          <p className="mt-3 border border-[#b94a3a]/40 bg-[#b94a3a]/10 px-3 py-2 text-sm text-[#8c2a2a]">{erro}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="border border-line bg-paper px-4 py-2 text-[0.65rem] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="bg-ink px-5 py-2 text-[0.65rem] tracking-[0.14em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:opacity-40"
          >
            {busy ? "A criar…" : "Criar e publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
