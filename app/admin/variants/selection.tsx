"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import type { VariantFilterParams } from "@/lib/variant-filter";

// Multi-select for /admin/variants. Checkboxes on rows + a header "select page"
// + "select all filtered" feed a bulk toolbar that applies promo / PVP / status
// to the lot in one request — so the boss never edits them one by one.

interface Ctx {
  pageIds: string[];
  totalFiltered: number;
  filter: VariantFilterParams;
  selected: Set<string>;
  allFiltered: boolean;
  count: number;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAllPage: () => void;
  selectAllFiltered: () => void;
  clear: () => void;
}

const SelectionContext = createContext<Ctx | null>(null);
export function useSelection() {
  const c = useContext(SelectionContext);
  if (!c) throw new Error("useSelection must be used inside SelectionProvider");
  return c;
}

export function SelectionProvider({
  pageIds,
  totalFiltered,
  filter,
  children,
}: {
  pageIds: string[];
  totalFiltered: number;
  filter: VariantFilterParams;
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allFiltered, setAllFiltered] = useState(false);

  const isSelected = useCallback((id: string) => allFiltered || selected.has(id), [allFiltered, selected]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      // Leaving "all filtered" mode: seed the explicit set from the page.
      const base = allFiltered ? new Set(pageIds) : new Set(prev);
      if (base.has(id)) base.delete(id); else base.add(id);
      return base;
    });
    setAllFiltered(false);
  }, [allFiltered, pageIds]);

  const toggleAllPage = useCallback(() => {
    setAllFiltered(false);
    setSelected((prev) => {
      const everyOn = pageIds.length > 0 && pageIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (everyOn) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }, [pageIds]);

  const selectAllFiltered = useCallback(() => setAllFiltered(true), []);
  const clear = useCallback(() => { setSelected(new Set()); setAllFiltered(false); }, []);

  const count = allFiltered ? totalFiltered : selected.size;

  const value = useMemo<Ctx>(
    () => ({ pageIds, totalFiltered, filter, selected, allFiltered, count, isSelected, toggle, toggleAllPage, selectAllFiltered, clear }),
    [pageIds, totalFiltered, filter, selected, allFiltered, count, isSelected, toggle, toggleAllPage, selectAllFiltered, clear],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

// A single row's checkbox.
export function RowCheckbox({ id }: { id: string }) {
  const { isSelected, toggle } = useSelection();
  return (
    <input
      type="checkbox"
      checked={isSelected(id)}
      onChange={() => toggle(id)}
      aria-label="Selecionar artigo"
      className="h-4 w-4 cursor-pointer accent-gold"
    />
  );
}

// Header checkbox — selects/clears every row on the current page.
export function SelectAllCheckbox() {
  const { pageIds, selected, allFiltered, toggleAllPage } = useSelection();
  const allOn = allFiltered || (pageIds.length > 0 && pageIds.every((id) => selected.has(id)));
  const someOn = !allOn && pageIds.some((id) => selected.has(id));
  return (
    <input
      type="checkbox"
      checked={allOn}
      ref={(el) => { if (el) el.indeterminate = someOn; }}
      onChange={toggleAllPage}
      aria-label="Selecionar todos nesta página"
      className="h-4 w-4 cursor-pointer accent-gold"
    />
  );
}

type ActionKind = "promo" | "pvp" | "status" | null;

// The floating bulk-action bar. Only shows when something is selected.
export function SelectionToolbar() {
  const sel = useSelection();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<ActionKind>(null);
  const [busy, setBusy] = useState(false);

  if (sel.count === 0) return null;

  const target = sel.allFiltered ? { filter: sel.filter } : { ids: [...sel.selected] };

  async function apply(payload: Record<string, unknown>, label: string) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/variant/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      toast.push("success", `${label} · ${data.affected} artigos`);
      setOpen(null);
      sel.clear();
      router.refresh();
    } catch (e) {
      toast.push("error", `Falha: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sticky top-0 z-20 mb-3 border border-gold/50 bg-paper shadow-lg">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-sm font-medium text-ink">
          {sel.count} {sel.count === 1 ? "artigo selecionado" : "artigos selecionados"}
        </span>
        {!sel.allFiltered && sel.totalFiltered > sel.selected.size && (
          <button type="button" onClick={sel.selectAllFiltered}
            className="text-[0.65rem] tracking-[0.14em] text-gold uppercase underline-offset-2 hover:underline">
            Selecionar todos os {sel.totalFiltered} filtrados
          </button>
        )}
        <span className="mx-1 h-4 w-px bg-line" />
        <ToolbarButton active={open === "promo"} onClick={() => setOpen(open === "promo" ? null : "promo")}>Promoção</ToolbarButton>
        <ToolbarButton active={open === "pvp"} onClick={() => setOpen(open === "pvp" ? null : "pvp")}>PVP</ToolbarButton>
        <ToolbarButton active={open === "status"} onClick={() => setOpen(open === "status" ? null : "status")}>Estado</ToolbarButton>
        <button type="button" onClick={sel.clear}
          className="ml-auto text-[0.65rem] tracking-[0.14em] text-muted uppercase hover:text-ink">
          Limpar seleção
        </button>
      </div>

      {open === "promo" && <PromoForm busy={busy} apply={apply} />}
      {open === "pvp" && <PvpForm busy={busy} apply={apply} />}
      {open === "status" && <StatusForm busy={busy} apply={apply} />}
    </div>
  );
}

function ToolbarButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 text-[0.65rem] tracking-[0.15em] uppercase transition-colors ${active ? "bg-ink text-cream" : "border border-line text-ink hover:border-gold"}`}>
      {children}
    </button>
  );
}

const fieldCls = "border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold";
const applyBtn = "bg-ink px-5 py-2 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:opacity-40";

function PromoForm({ busy, apply }: { busy: boolean; apply: (p: Record<string, unknown>, label: string) => void }) {
  const [mode, setMode] = useState<"percent" | "price">("percent");
  const [percent, setPercent] = useState("20");
  const [price, setPrice] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const submit = () => {
    const promo =
      mode === "percent"
        ? { mode, percent: Number(percent), startDate: start || null, endDate: end }
        : { mode, priceCents: Math.round(Number(price) * 100), startDate: start || null, endDate: end };
    apply({ action: "promo", promo }, "Promoção aplicada");
  };
  return (
    <div className="flex flex-wrap items-end gap-3 border-t border-line bg-cream/40 px-4 py-3">
      <label className="block">
        <span className="overline mb-1 block text-[0.55rem] text-muted">Tipo</span>
        <select value={mode} onChange={(e) => setMode(e.target.value as "percent" | "price")} className={fieldCls}>
          <option value="percent">Desconto %</option>
          <option value="price">Preço promo (€)</option>
        </select>
      </label>
      {mode === "percent" ? (
        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Desconto</span>
          <div className="flex items-center gap-1">
            <input type="number" min={1} max={99} value={percent} onChange={(e) => setPercent(e.target.value)} className={`${fieldCls} w-20 text-right`} />
            <span className="text-muted">%</span>
          </div>
        </label>
      ) : (
        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Preço promo</span>
          <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={`${fieldCls} w-28 text-right`} />
        </label>
      )}
      <label className="block">
        <span className="overline mb-1 block text-[0.55rem] text-muted">Início (opc.)</span>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={fieldCls} />
      </label>
      <label className="block">
        <span className="overline mb-1 block text-[0.55rem] text-muted">Fim</span>
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={fieldCls} />
      </label>
      <button type="button" disabled={busy} onClick={submit} className={applyBtn}>Aplicar</button>
      <button type="button" disabled={busy} onClick={() => apply({ action: "promo", promo: null }, "Promoção removida")}
        className="px-4 py-2 text-[0.65rem] tracking-[0.15em] text-[#b94a3a] uppercase hover:underline">
        Remover promoção
      </button>
    </div>
  );
}

function PvpForm({ busy, apply }: { busy: boolean; apply: (p: Record<string, unknown>, label: string) => void }) {
  const [mode, setMode] = useState<"set" | "percent">("set");
  const [price, setPrice] = useState("");
  const [percent, setPercent] = useState("-10");
  const submit = () => {
    const pvp =
      mode === "set"
        ? { mode, priceCents: Math.round(Number(price) * 100) }
        : { mode, percent: Number(percent) };
    apply({ action: "pvp", pvp }, "PVP atualizado");
  };
  return (
    <div className="flex flex-wrap items-end gap-3 border-t border-line bg-cream/40 px-4 py-3">
      <label className="block">
        <span className="overline mb-1 block text-[0.55rem] text-muted">Modo</span>
        <select value={mode} onChange={(e) => setMode(e.target.value as "set" | "percent")} className={fieldCls}>
          <option value="set">Definir preço (€)</option>
          <option value="percent">Ajustar %</option>
        </select>
      </label>
      {mode === "set" ? (
        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Novo PVP</span>
          <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className={`${fieldCls} w-28 text-right`} />
        </label>
      ) : (
        <label className="block">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Ajuste (± %)</span>
          <div className="flex items-center gap-1">
            <input type="number" value={percent} onChange={(e) => setPercent(e.target.value)} className={`${fieldCls} w-24 text-right`} />
            <span className="text-muted">%</span>
          </div>
        </label>
      )}
      <button type="button" disabled={busy} onClick={submit} className={applyBtn}>Aplicar</button>
    </div>
  );
}

function StatusForm({ busy, apply }: { busy: boolean; apply: (p: Record<string, unknown>, label: string) => void }) {
  const [status, setStatus] = useState("DISPONIVEL");
  return (
    <div className="flex flex-wrap items-end gap-3 border-t border-line bg-cream/40 px-4 py-3">
      <label className="block">
        <span className="overline mb-1 block text-[0.55rem] text-muted">Novo estado</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldCls}>
          <option value="DISPONIVEL">Disponível (tornar visível)</option>
          <option value="INDISPONIVEL">Indisponível</option>
          <option value="DESCONTINUADO">Descontinuado</option>
        </select>
      </label>
      <button type="button" disabled={busy} onClick={() => apply({ action: "status", status }, "Estado atualizado")} className={applyBtn}>
        Aplicar
      </button>
      {status === "DISPONIVEL" && (
        <p className="text-[0.7rem] text-muted">Nota: só ficam visíveis os que tiverem stock &gt; 0.</p>
      )}
    </div>
  );
}
