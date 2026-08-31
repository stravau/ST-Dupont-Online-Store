"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import { imgSrc } from "@/lib/img";

export interface PickerItem {
  sku: string;
  title: string;
  variant: string;
  collection: string;
  category: string;
  image: string | null;
  priceCents: number;
  stock: number;
  status: string;
}

const eur = (c: number) => (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
const MAX = 24;
// 25 filas da grelha. A grelha vai até 3 colunas no ecrã largo, portanto
// 25 × 3 = 75 artigos por página.
const PER_PAGE = 75;

// Duas colunas: à esquerda o catálogo com pesquisa, à direita a selecção pela
// ordem em que vai aparecer no site. Escolher é um clique; ordenar é subir /
// descer. Grava tudo de uma vez (PUT com a lista inteira) — não há estado
// meio-aplicado se o pedido falhar.
export function FeaturedPicker({
  items,
  initial,
  rail,
}: {
  items: PickerItem[];
  initial: string[];
  rail: string;
}) {
  const router = useRouter();
  const toast = useToast();
  // A ordem da selecção é o que manda no site, por isso é um array e não um Set.
  const [selected, setSelected] = useState<string[]>(initial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [stockFilter, setStockFilter] = useState<"" | "com" | "sem">("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  // Mudar de filtro volta à primeira página — senão ficava-se numa página que
  // já não existe no resultado novo e a lista aparecia vazia sem razão óbvia.
  function reset<T>(set: (v: T) => void) {
    return (v: T) => { set(v); setPage(1); };
  }

  const bySku = useMemo(() => new Map(items.map((i) => [i.sku, i])), [items]);
  const chosen = useMemo(
    () => selected.map((s) => bySku.get(s)).filter((x): x is PickerItem => !!x),
    [selected, bySku],
  );
  const dirty = useMemo(
    () => selected.length !== initial.length || selected.some((s, i) => s !== initial[i]),
    [selected, initial],
  );

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      if (cat && i.category !== cat) return false;
      if (stockFilter === "com" && i.stock <= 0) return false;
      if (stockFilter === "sem" && i.stock > 0) return false;
      if (!term) return true;
      return (
        i.sku.toLowerCase().includes(term) ||
        i.title.toLowerCase().includes(term) ||
        i.variant.toLowerCase().includes(term) ||
        i.collection.toLowerCase().includes(term)
      );
    });
  }, [items, q, cat, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // Clamp em vez de deixar a página passar do fim: apagar o texto da pesquisa
  // encolhe o resultado e a página actual podia ficar fora de alcance.
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function toggle(sku: string) {
    setSelected((prev) => {
      if (prev.includes(sku)) return prev.filter((s) => s !== sku);
      if (prev.length >= MAX) {
        toast.push("error", `Máximo ${MAX} artigos no carrossel`);
        return prev;
      }
      return [...prev, sku];
    });
  }

  function move(i: number, dir: -1 | 1) {
    setSelected((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home-carousel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rail, skus: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        toast.push("error", data.error ?? `HTTP ${res.status}`);
        return;
      }
      toast.push(
        "success",
        selected.length === 0
          ? "Carrossel vazio — a secção deixa de aparecer no site"
          : `${selected.length} artigo(s) no carrossel`,
      );
      router.refresh();
    } catch (e) {
      toast.push("error", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_22rem]">
      {/* Catálogo */}
      <section className="min-w-0">
        <div className="flex flex-wrap items-end gap-3 border border-line bg-paper p-4">
          <label className="min-w-[14rem] flex-1">
            <span className="overline mb-1.5 block text-[0.55rem] text-muted">Pesquisar</span>
            <input
              value={q}
              onChange={(e) => reset(setQ)(e.target.value)}
              placeholder="REF, nome, colecção…"
              className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="min-w-[10rem]">
            <span className="overline mb-1.5 block text-[0.55rem] text-muted">Categoria</span>
            <select
              value={cat}
              onChange={(e) => reset(setCat)(e.target.value)}
              className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="">Todas</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="min-w-[9rem]">
            <span className="overline mb-1.5 block text-[0.55rem] text-muted">Stock</span>
            <select
              value={stockFilter}
              onChange={(e) => reset(setStockFilter)(e.target.value as "" | "com" | "sem")}
              className="w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
            >
              <option value="">Todos</option>
              <option value="com">Em stock</option>
              <option value="sem">Esgotado</option>
            </select>
          </label>
          <p className="ml-auto text-[0.7rem] text-muted tabular-nums">
            {filtered.length.toLocaleString("pt-PT")} artigos
            {totalPages > 1 ? ` · página ${safePage} / ${totalPages}` : ""}
          </p>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {pageItems.map((i) => {
            const on = selected.includes(i.sku);
            return (
              <li key={i.sku}>
                <button
                  type="button"
                  onClick={() => toggle(i.sku)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 border p-2.5 text-left transition-colors ${
                    on ? "border-gold bg-gold/8" : "border-line bg-paper hover:border-gold/50"
                  }`}
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden border border-line bg-white">
                    {i.image && (
                      <Image src={imgSrc(i.image)!} alt="" fill sizes="56px" className="object-contain" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.78rem] font-medium text-ink">{i.title}</span>
                    <span className="block truncate text-[0.68rem] text-muted">
                      {i.variant || i.collection || "—"}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-[0.66rem] text-muted tabular-nums">
                      <span className="font-mono">{i.sku}</span>
                      <span>·</span>
                      <span>{eur(i.priceCents)}</span>
                      {/* Stock e status à vista: pôr em destaque um artigo
                          esgotado ou indisponível é uma decisão possível, mas
                          tem de ser consciente. */}
                      {i.stock <= 0 && <span className="text-[#b94a3a]">esgotado</span>}
                      {i.status === "INDISPONIVEL" && <span className="text-[#7e5e00]">indisp.</span>}
                    </span>
                  </span>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center border text-[0.7rem] ${
                      on ? "border-gold bg-gold text-ink" : "border-line text-transparent"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {pageItems.length === 0 && (
          <p className="mt-4 border border-dashed border-line px-3 py-8 text-center text-[0.75rem] text-muted">
            Nenhum artigo com estes filtros.
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="border border-line bg-paper px-3 py-2 tracking-[0.18em] uppercase transition-colors hover:border-gold disabled:opacity-30"
            >
              ← Anterior
            </button>
            <span className="text-muted tabular-nums">
              Página {safePage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="border border-line bg-paper px-3 py-2 tracking-[0.18em] uppercase transition-colors hover:border-gold disabled:opacity-30"
            >
              Seguinte →
            </button>
          </div>
        )}
      </section>

      {/* Selecção */}
      <aside className="xl:sticky xl:top-[calc(var(--admin-header-h)+1.5rem)] xl:self-start">
        <div className="border border-line bg-paper p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg text-ink">No carrossel</h2>
            <span className="text-[0.65rem] text-muted tabular-nums">{selected.length} / {MAX}</span>
          </div>
          <p className="mt-1 text-[0.68rem] text-muted">
            Esta é a ordem em que aparecem no site.
          </p>

          {chosen.length === 0 ? (
            <p className="mt-5 border border-dashed border-line px-3 py-6 text-center text-[0.72rem] text-muted">
              Sem artigos escolhidos.<br />A secção “Em Destaque” não aparece no site.
            </p>
          ) : (
            <ol className="mt-4 space-y-2">
              {chosen.map((i, idx) => (
                <li key={i.sku} className="flex items-center gap-2 border border-line bg-cream/40 p-2">
                  <span className="w-4 shrink-0 text-center font-serif text-[0.8rem] text-gold tabular-nums">{idx + 1}</span>
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden border border-line bg-white">
                    {i.image && <Image src={imgSrc(i.image)!} alt="" fill sizes="36px" className="object-contain" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.72rem] text-ink">{i.title}</span>
                    <span className="block truncate font-mono text-[0.62rem] text-muted">{i.sku}</span>
                  </span>
                  <span className="flex shrink-0 flex-col">
                    <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Subir" className="px-1 text-[0.6rem] text-muted transition-colors hover:text-gold disabled:opacity-25">▲</button>
                    <button type="button" onClick={() => move(idx, 1)} disabled={idx === chosen.length - 1} aria-label="Descer" className="px-1 text-[0.6rem] text-muted transition-colors hover:text-gold disabled:opacity-25">▼</button>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(i.sku)}
                    aria-label="Remover"
                    className="shrink-0 px-1 text-muted transition-colors hover:text-[#b94a3a]"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ol>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="mt-5 w-full bg-ink py-3 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:opacity-40"
          >
            {saving ? "A gravar…" : dirty ? "Guardar carrossel" : "Sem alterações"}
          </button>
        </div>
      </aside>
    </div>
  );
}
