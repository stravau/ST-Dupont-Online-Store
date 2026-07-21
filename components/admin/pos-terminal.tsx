"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { VAT_DIVISOR, ECI_COMMISSION_RATE, type BoutiqueCode } from "@/lib/pos";

interface OperatorLite {
  boutique: BoutiqueCode;
  initials: string;
}

interface Line {
  variantId: string;
  sku: string;
  ean: string | null;
  desc: string;
  unitPriceCents: number;
  quantity: number;
  discountPct: number; // 0..1
}

const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = { LIS: "Lisboa", VNG: "V. N. de Gaia" };

const eur = (cents: number) =>
  (cents / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

// In-store sales terminal. Scan a barcode → line is added; set quantity /
// discount; pick who sold it; confirm. Totals mirror the ECI Excel (net =
// gross/1.23, ECI fee = net*0.19). The store is fixed for LOJA_* logins and
// switchable for ADMIN (the boss).
export function PosTerminal({
  operators,
  boutiques,
}: {
  operators: OperatorLite[];
  boutiques: BoutiqueCode[];
}) {
  const [boutique, setBoutique] = useState<BoutiqueCode>(boutiques[0]);
  const [type, setType] = useState<"VENDA" | "DEVOLUCAO">("VENDA");
  const [operator, setOperator] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [scan, setScan] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  const storeOperators = useMemo(
    () => operators.filter((o) => o.boutique === boutique).map((o) => o.initials),
    [operators, boutique],
  );

  const lineGross = (l: Line) => Math.round(l.quantity * l.unitPriceCents * (1 - l.discountPct));
  const grossTotal = lines.reduce((s, l) => s + lineGross(l), 0);
  const netTotal = lines.reduce((s, l) => s + Math.round(lineGross(l) / VAT_DIVISOR), 0);
  // Commission rate is per-boutique now — LIS 22%, VNG 19% — so read
  // from the map keyed on the currently-selected boutique.
  const eciRate = ECI_COMMISSION_RATE[boutique];
  const eciTotal = Math.round(netTotal * eciRate);

  const refocus = () => setTimeout(() => scanRef.current?.focus(), 0);

  const addByCode = useCallback(
    async (raw: string) => {
      const code = raw.trim();
      if (!code) return;
      setScan("");
      // Already in the basket? just bump the quantity.
      const existing = lines.find((l) => l.ean === code || l.sku.toUpperCase() === code.toUpperCase());
      if (existing) {
        setLines((ls) => ls.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l)));
        setFlash({ kind: "ok", msg: `+1 ${existing.sku}` });
        refocus();
        return;
      }
      const param = /^\d{8}$|^\d{13}$/.test(code) ? `ean=${encodeURIComponent(code)}` : `sku=${encodeURIComponent(code)}`;
      try {
        const res = await fetch(`/api/admin/pos/scan?${param}`);
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setFlash({ kind: "err", msg: `Não encontrado: ${code}` });
          refocus();
          return;
        }
        const v = data.variant;
        const name = (v.name?.pt ?? v.name?.en ?? v.sku) as string;
        const pName = (v.product?.name?.pt ?? v.product?.name?.en ?? "") as string;
        setLines((ls) => [
          ...ls,
          {
            variantId: v.id,
            sku: v.sku,
            ean: v.ean,
            desc: `${pName} ${name}`.trim() || v.sku,
            unitPriceCents: v.priceCents,
            quantity: 1,
            discountPct: 0,
          },
        ]);
        setFlash({ kind: "ok", msg: `Adicionado ${v.sku}` });
      } catch {
        setFlash({ kind: "err", msg: "Erro de rede ao ler o código" });
      }
      refocus();
    },
    [lines],
  );

  const setQty = (i: number, q: number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, quantity: Math.max(1, q || 1) } : l)));
  const setDisc = (i: number, pctInput: number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, discountPct: Math.min(0.99, Math.max(0, (pctInput || 0) / 100)) } : l)));
  const removeLine = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));

  const confirm = async () => {
    if (busy) return;
    if (!operator) return setFlash({ kind: "err", msg: "Escolhe quem vendeu" });
    if (lines.length === 0) return setFlash({ kind: "err", msg: "Sem artigos" });
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/pos/sale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          boutique,
          operatorInitials: operator,
          type,
          items: lines.map((l) => ({ ean: l.ean ?? undefined, sku: l.ean ? undefined : l.sku, quantity: l.quantity, discountPct: l.discountPct })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFlash({ kind: "err", msg: data.error ?? "Falha ao registar" });
      } else {
        setFlash({ kind: "ok", msg: `${type === "VENDA" ? "Venda" : "Devolução"} registada · ${eur(grossTotal)}` });
        setLines([]);
      }
    } catch {
      setFlash({ kind: "err", msg: "Erro de rede ao registar" });
    } finally {
      setBusy(false);
      refocus();
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Left — scan + basket */}
      <div>
        {boutiques.length > 1 && (
          <div className="mb-4 inline-flex rounded-sm border border-line p-0.5">
            {boutiques.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => { setBoutique(b); setOperator(""); }}
                className={`px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors ${
                  b === boutique ? "bg-ink text-cream" : "text-ink hover:text-gold"
                }`}
              >
                {BOUTIQUE_LABEL[b]}
              </button>
            ))}
          </div>
        )}

        <label className="block">
          <span className="overline text-[0.55rem] text-muted">Ler código de barras</span>
          <input
            ref={scanRef}
            autoFocus
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void addByCode(scan); } }}
            inputMode="numeric"
            placeholder="Aponta o leitor ou escreve o EAN / REF e Enter"
            className="mt-2 w-full border border-line bg-paper px-4 py-3 font-mono text-lg tabular-nums text-ink outline-none focus:border-gold"
          />
        </label>

        {flash && (
          <p className={`mt-3 text-sm ${flash.kind === "ok" ? "text-[#3b7551]" : "text-[#b94a3a]"}`}>{flash.msg}</p>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                <th className="py-2 pr-3">Artigo</th>
                <th className="py-2 px-2 text-right">PVP</th>
                <th className="py-2 px-2 text-center">Qtd</th>
                <th className="py-2 px-2 text-center">Desc %</th>
                <th className="py-2 pl-2 text-right">Total</th>
                <th className="py-2 pl-2"></th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted">Sem artigos — lê um código para começar.</td></tr>
              )}
              {lines.map((l, i) => (
                <tr key={`${l.sku}-${i}`} className="border-b border-line/60 align-middle">
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-ink">{l.sku}</p>
                    <p className="text-[0.72rem] text-muted">{l.desc}</p>
                  </td>
                  <td className="py-2.5 px-2 text-right tabular-nums">{eur(l.unitPriceCents)}</td>
                  <td className="py-2.5 px-2 text-center">
                    <input type="number" min={1} value={l.quantity}
                      onChange={(e) => setQty(i, parseInt(e.target.value, 10))}
                      className="w-14 border border-line bg-paper px-2 py-1 text-center tabular-nums outline-none focus:border-gold" />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <input type="number" min={0} max={99} value={Math.round(l.discountPct * 100)}
                      onChange={(e) => setDisc(i, parseInt(e.target.value, 10))}
                      className="w-14 border border-line bg-paper px-2 py-1 text-center tabular-nums outline-none focus:border-gold" />
                  </td>
                  <td className="py-2.5 pl-2 text-right tabular-nums font-medium">{eur(lineGross(l))}</td>
                  <td className="py-2.5 pl-2 text-right">
                    <button type="button" onClick={() => removeLine(i)} aria-label="Remover"
                      className="text-muted transition-colors hover:text-[#b94a3a]">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right — checkout panel */}
      <aside className="h-fit border border-line bg-paper p-5 lg:sticky lg:top-6">
        <div className="flex rounded-sm border border-line p-0.5">
          {(["VENDA", "DEVOLUCAO"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-1.5 text-[0.65rem] tracking-[0.15em] uppercase transition-colors ${
                t === type ? "bg-ink text-cream" : "text-ink hover:text-gold"}`}>
              {t === "VENDA" ? "Venda" : "Devolução"}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="overline text-[0.55rem] text-muted">Operador</span>
          <select value={operator} onChange={(e) => setOperator(e.target.value)}
            className="mt-2 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-gold">
            <option value="">— escolher —</option>
            {storeOperators.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>

        <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Bruto (c/ IVA)</dt><dd className="tabular-nums">{eur(grossTotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Líquido (s/ IVA)</dt><dd className="tabular-nums">{eur(netTotal)}</dd></div>
          <div className="flex justify-between text-[0.8rem]"><dt className="text-muted">Comissão ECI ({Math.round(eciRate * 100)}%)</dt><dd className="tabular-nums text-muted">− {eur(eciTotal)}</dd></div>
        </dl>

        <button type="button" onClick={confirm} disabled={busy || lines.length === 0}
          className="mt-5 w-full bg-ink py-3 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? "A registar…" : type === "VENDA" ? "Registar venda" : "Registar devolução"}
        </button>
        <p className="mt-3 text-center text-[0.65rem] text-muted">Data e hora são registadas automaticamente.</p>
      </aside>
    </div>
  );
}
