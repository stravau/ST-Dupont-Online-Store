"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VAT_DIVISOR, ECI_COMMISSION_RATE, type BoutiqueCode } from "@/lib/pos";

interface OperatorLite {
  boutique: BoutiqueCode;
  initials: string;
}

interface Line {
  source: "DUPONT" | "OTHER_BRAND";
  variantId: string | null;
  sku: string;
  ean: string | null;
  brand: string | null; // shown for OTHER_BRAND lines
  desc: string;
  unitPriceCents: number;
  quantity: number;
  discountPct: number; // 0..1
}

type PosType = "VENDA" | "DEVOLUCAO" | "REPARACAO";
type RepairSubtype = "ESCRITA" | "ISQUEIRO" | "PELE";
interface RepairHit {
  id: string;
  customerName: string;
  reference: string;
  subject: string;
  firstVisitAt: string | null;
}

const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = { LIS: "Lisboa", VNG: "V. N. de Gaia" };
const REPAIR_LABEL: Record<RepairSubtype, string> = { ESCRITA: "Escrita", ISQUEIRO: "Isqueiro", PELE: "Pele" };

const eur = (cents: number) =>
  (cents / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

// In-store sales terminal. Three modes (tabs) sharing the same operator +
// observations + confirm bar:
//   • Venda / Devolução — scan a barcode, basket builds up, ring up totals.
//   • Reparação — pick a customer waiting to collect (only rows in
//     AGUARDANDO_CLIENTE are searchable), choose subtype (escrita/isqueiro/
//     pele), set the labour fee, confirm. The same transaction closes the
//     Repair (→ RESOLVIDO). No stock movement.
// Totals mirror the ECI Excel (net = gross/1.23, ECI fee = net * rate).
// The store is fixed for LOJA_* logins and switchable for ADMIN (the boss).
export function PosTerminal({
  operators,
  boutiques,
}: {
  operators: OperatorLite[];
  boutiques: BoutiqueCode[];
}) {
  const [boutique, setBoutique] = useState<BoutiqueCode>(boutiques[0]);
  const [type, setType] = useState<PosType>("VENDA");
  const [operator, setOperator] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [scan, setScan] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  // Reparação state — kept separate from the basket so switching tabs doesn't
  // wipe an in-progress reparação (until the operator explicitly confirms /
  // clears / changes boutique).
  const [repairSearch, setRepairSearch] = useState("");
  const [repairHits, setRepairHits] = useState<RepairHit[]>([]);
  const [repairPicked, setRepairPicked] = useState<RepairHit | null>(null);
  const [repairSubtype, setRepairSubtype] = useState<RepairSubtype>("ESCRITA");
  const [repairPrice, setRepairPrice] = useState<string>("");
  const [repairSearchOpen, setRepairSearchOpen] = useState(false);

  const storeOperators = useMemo(
    () => operators.filter((o) => o.boutique === boutique).map((o) => o.initials),
    [operators, boutique],
  );

  // ----- Venda / Devolução totals -----
  const lineGross = (l: Line) => Math.round(l.quantity * l.unitPriceCents * (1 - l.discountPct));
  const basketGross = lines.reduce((s, l) => s + lineGross(l), 0);
  const basketNet = lines.reduce((s, l) => s + Math.round(lineGross(l) / VAT_DIVISOR), 0);

  // ----- Reparação totals (one line, fixed qty=1) -----
  const repairPriceCents = Math.max(0, Math.round((parseFloat(repairPrice) || 0) * 100));
  const repairGross = repairPriceCents;
  const repairNet = Math.round(repairGross / VAT_DIVISOR);

  // Active totals per tab so the summary block stays honest.
  const grossTotal = type === "REPARACAO" ? repairGross : basketGross;
  const netTotal = type === "REPARACAO" ? repairNet : basketNet;
  const eciRate = ECI_COMMISSION_RATE[boutique];
  const eciTotal = Math.round(netTotal * eciRate);

  const refocus = () => setTimeout(() => scanRef.current?.focus(), 0);

  // ----- Scan → basket (Venda / Devolução) -----
  const addByCode = useCallback(
    async (raw: string) => {
      const code = raw.trim();
      if (!code) return;
      setScan("");
      const existing = lines.find((l) => l.ean === code || l.sku.toUpperCase() === code.toUpperCase());
      if (existing) {
        setLines((ls) => ls.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l)));
        setFlash({ kind: "ok", msg: `+1 ${existing.sku}` });
        refocus();
        return;
      }
      const param = /^\d{8}$|^\d{13}$/.test(code) ? `ean=${encodeURIComponent(code)}` : `sku=${encodeURIComponent(code)}`;
      try {
        const res = await fetch(`/api/admin/pos/scan?${param}&boutique=${boutique}`);
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setFlash({ kind: "err", msg: `Não encontrado: ${code}` });
          refocus();
          return;
        }
        const v = data.variant;
        const isOther = data.source === "OTHER_BRAND";
        const name = (v.name?.pt ?? v.name?.en ?? v.sku) as string;
        const pName = (v.product?.name?.pt ?? v.product?.name?.en ?? "") as string;
        setLines((ls) => [
          ...ls,
          {
            source: isOther ? "OTHER_BRAND" : "DUPONT",
            variantId: isOther ? null : v.id,
            sku: v.sku,
            ean: v.ean,
            brand: isOther ? (v.brand ?? null) : null,
            desc: `${pName} ${name}`.trim() || v.sku,
            unitPriceCents: v.priceCents ?? 0,
            quantity: 1,
            discountPct: 0,
          },
        ]);
        setFlash({ kind: "ok", msg: `Adicionado ${v.sku}${isOther ? ` · ${v.brand}` : ""}` });
      } catch {
        setFlash({ kind: "err", msg: "Erro de rede ao ler o código" });
      }
      refocus();
    },
    [lines, boutique],
  );

  const setQty = (i: number, q: number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, quantity: Math.max(1, q || 1) } : l)));
  const setDisc = (i: number, pctInput: number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, discountPct: Math.min(0.99, Math.max(0, (pctInput || 0) / 100)) } : l)));
  const setPrice = (i: number, euros: number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, unitPriceCents: Math.max(0, Math.round((euros || 0) * 100)) } : l)));
  const removeLine = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));

  // ----- Reparação — customer search (debounced 250ms) -----
  useEffect(() => {
    if (type !== "REPARACAO") return;
    if (repairPicked) return; // don't chase suggestions while a customer is locked in
    const term = repairSearch.trim();
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const url = `/api/admin/pos/repairs-waiting?boutique=${boutique}${term ? `&q=${encodeURIComponent(term)}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) setRepairHits(data.rows as RepairHit[]);
      } catch {
        if (!cancelled) setRepairHits([]);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [type, repairSearch, repairPicked, boutique]);

  const clearRepair = () => {
    setRepairPicked(null);
    setRepairSearch("");
    setRepairHits([]);
    setRepairPrice("");
  };

  // Boutique switch nukes tab-local selections so we never send a Lisboa
  // repair on a Gaia sale.
  const changeBoutique = (b: BoutiqueCode) => {
    setBoutique(b);
    setOperator("");
    clearRepair();
    setLines([]);
  };

  // ----- Confirm — one path per mode -----
  const confirm = async () => {
    if (busy) return;
    if (!operator) { setFlash({ kind: "err", msg: "Escolhe quem vendeu" }); return; }

    if (type === "REPARACAO") {
      if (!repairPicked) { setFlash({ kind: "err", msg: "Escolhe o cliente" }); return; }
      if (repairPriceCents <= 0) { setFlash({ kind: "err", msg: "Define o preço da reparação" }); return; }
    } else {
      if (lines.length === 0) { setFlash({ kind: "err", msg: "Sem artigos" }); return; }
      const priceless = lines.find((l) => l.source === "OTHER_BRAND" && l.unitPriceCents <= 0);
      if (priceless) { setFlash({ kind: "err", msg: `Define o PVP de ${priceless.sku} (${priceless.brand})` }); return; }
    }

    setBusy(true);
    setFlash(null);
    try {
      const body =
        type === "REPARACAO"
          ? {
              boutique,
              operatorInitials: operator,
              type,
              note: note.trim() || undefined,
              repairId: repairPicked!.id,
              repair: {
                subtype: repairSubtype,
                unitPriceCents: repairPriceCents,
              },
            }
          : {
              boutique,
              operatorInitials: operator,
              type,
              note: note.trim() || undefined,
              items: lines.map((l) => ({
                ean: l.ean ?? undefined,
                sku: l.ean ? undefined : l.sku,
                quantity: l.quantity,
                discountPct: l.discountPct,
                unitPriceCents: l.source === "OTHER_BRAND" ? l.unitPriceCents : undefined,
              })),
            };
      const res = await fetch("/api/admin/pos/sale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFlash({ kind: "err", msg: data.error ?? "Falha ao registar" });
      } else {
        if (type === "REPARACAO") {
          setFlash({ kind: "ok", msg: `Reparação de ${repairPicked!.customerName} fechada · ${eur(repairPriceCents)}` });
          clearRepair();
        } else {
          setFlash({ kind: "ok", msg: `${type === "VENDA" ? "Venda" : "Devolução"} registada · ${eur(basketGross)}` });
          setLines([]);
        }
        setNote("");
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
      {/* Left — depends on mode */}
      <div>
        {boutiques.length > 1 && (
          <div className="mb-4 inline-flex rounded-sm border border-line p-0.5">
            {boutiques.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => changeBoutique(b)}
                className={`px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors ${
                  b === boutique ? "bg-ink text-cream" : "text-ink hover:text-gold"
                }`}
              >
                {BOUTIQUE_LABEL[b]}
              </button>
            ))}
          </div>
        )}

        {type !== "REPARACAO" ? (
          <>
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
                        <p className="font-medium text-ink">
                          {l.sku}
                          {l.source === "OTHER_BRAND" && l.brand && (
                            <span className="ml-2 inline-block border border-gold/60 px-1.5 py-0.5 align-middle text-[0.55rem] tracking-[0.12em] text-gold uppercase">
                              {l.brand}
                            </span>
                          )}
                        </p>
                        <p className="text-[0.72rem] text-muted">{l.desc}</p>
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {l.source === "OTHER_BRAND" ? (
                          <input
                            type="number" min={0} step="0.01" value={l.unitPriceCents ? l.unitPriceCents / 100 : ""}
                            onChange={(e) => setPrice(i, parseFloat(e.target.value))}
                            placeholder="PVP" aria-label="PVP"
                            className={`w-20 border bg-paper px-2 py-1 text-right tabular-nums outline-none focus:border-gold ${l.unitPriceCents > 0 ? "border-line" : "border-[#b94a3a]"}`}
                          />
                        ) : (
                          eur(l.unitPriceCents)
                        )}
                      </td>
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
          </>
        ) : (
          // ---- Reparação form ----
          <div className="space-y-5">
            {flash && (
              <p className={`text-sm ${flash.kind === "ok" ? "text-[#3b7551]" : "text-[#b94a3a]"}`}>{flash.msg}</p>
            )}

            <div className="relative">
              <span className="overline text-[0.55rem] text-muted">Cliente (Aguardando Cliente)</span>
              {repairPicked ? (
                <div className="mt-2 flex items-start justify-between gap-3 border border-gold bg-gold/10 px-4 py-3">
                  <div>
                    <p className="font-medium text-ink">{repairPicked.customerName}</p>
                    <p className="mt-0.5 text-[0.72rem] text-muted">
                      Ref. {repairPicked.reference} · {repairPicked.subject}
                    </p>
                  </div>
                  <button type="button" onClick={clearRepair}
                    className="text-[0.65rem] tracking-[0.16em] text-muted uppercase hover:text-[#b94a3a]">
                    Trocar
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={repairSearch}
                    onChange={(e) => setRepairSearch(e.target.value)}
                    onFocus={() => setRepairSearchOpen(true)}
                    onBlur={() => setTimeout(() => setRepairSearchOpen(false), 150)}
                    placeholder="Escreve o nome — só aparecem os que estão à espera"
                    className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-gold"
                  />
                  {repairSearchOpen && repairHits.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto border border-line bg-paper shadow-lg">
                      {repairHits.map((r) => (
                        <li key={r.id}>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); setRepairPicked(r); setRepairSearch(""); setRepairHits([]); }}
                            className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-cream/60"
                          >
                            <p className="text-sm font-medium text-ink">{r.customerName}</p>
                            <p className="text-[0.7rem] text-muted">
                              Ref. {r.reference} · {r.subject}
                              {r.firstVisitAt && (
                                <span className="ml-2 text-[0.62rem]">
                                  ({new Date(r.firstVisitAt).toLocaleDateString("pt-PT")})
                                </span>
                              )}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {repairSearchOpen && repairSearch && repairHits.length === 0 && (
                    <p className="mt-2 text-[0.7rem] text-muted">Sem reparações à espera para "{repairSearch}".</p>
                  )}
                </>
              )}
            </div>

            <fieldset>
              <legend className="overline text-[0.55rem] text-muted">Tipo de reparação</legend>
              <div className="mt-2 flex rounded-sm border border-line p-0.5">
                {(["ESCRITA", "ISQUEIRO", "PELE"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRepairSubtype(s)}
                    className={`flex-1 py-2 text-xs tracking-[0.14em] uppercase transition-colors ${
                      s === repairSubtype ? "bg-ink text-cream" : "text-ink hover:text-gold"
                    }`}
                  >
                    {REPAIR_LABEL[s]}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="overline text-[0.55rem] text-muted">Preço da reparação (€)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={repairPrice}
                onChange={(e) => setRepairPrice(e.target.value)}
                placeholder="0,00"
                className="mt-2 w-full border border-line bg-paper px-4 py-3 font-mono text-lg tabular-nums text-ink outline-none focus:border-gold"
              />
              <p className="mt-1 text-[0.62rem] text-muted">
                A reparação será marcada como resolvida assim que a cobrança for registada.
              </p>
            </label>
          </div>
        )}
      </div>

      {/* Right — checkout panel (shared across the three tabs) */}
      <aside className="h-fit border border-line bg-paper p-5 lg:sticky lg:top-6">
        <div className="flex rounded-sm border border-line p-0.5">
          {(["VENDA", "DEVOLUCAO", "REPARACAO"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-1.5 text-[0.6rem] tracking-[0.15em] uppercase transition-colors ${
                t === type ? "bg-ink text-cream" : "text-ink hover:text-gold"}`}>
              {t === "VENDA" ? "Venda" : t === "DEVOLUCAO" ? "Devolução" : "Reparação"}
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

        <label className="mt-4 block">
          <span className="overline text-[0.55rem] text-muted">Observações</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            rows={2}
            placeholder="Ex.: cartão turista, cliente pediu factura, etc."
            className="mt-2 w-full resize-y border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          />
        </label>

        <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Bruto (c/ IVA)</dt><dd className="tabular-nums">{eur(grossTotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Líquido (s/ IVA)</dt><dd className="tabular-nums">{eur(netTotal)}</dd></div>
          <div className="flex justify-between text-[0.8rem]"><dt className="text-muted">Comissão ECI ({Math.round(eciRate * 100)}%)</dt><dd className="tabular-nums text-muted">− {eur(eciTotal)}</dd></div>
        </dl>

        <button type="button" onClick={confirm}
          disabled={
            busy ||
            (type !== "REPARACAO" && lines.length === 0) ||
            (type === "REPARACAO" && (!repairPicked || repairPriceCents <= 0))
          }
          className="mt-5 w-full bg-ink py-3 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40">
          {busy
            ? "A registar…"
            : type === "VENDA"
            ? "Registar venda"
            : type === "DEVOLUCAO"
            ? "Registar devolução"
            : "Registar reparação"}
        </button>
        <p className="mt-3 text-center text-[0.65rem] text-muted">Data e hora são registadas automaticamente.</p>
      </aside>
    </div>
  );
}
