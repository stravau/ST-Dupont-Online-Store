"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { BoutiqueCode } from "@/lib/pos";
import { BOUTIQUE_LABEL } from "@/components/admin/boutique-scope";

type MovType = "ENTRADA" | "SAIDA";

// A scanned-but-not-yet-registered article, sitting in the basket awaiting
// confirmation — mirrors the sales terminal.
interface Line {
  sku: string;
  ean: string | null;
  desc: string;
  brand: string;
  unitPriceCents: number; // PVP, shown for reference
  quantity: number;
}

interface HistoryEntry {
  id: string;
  at: string; // "HH:MM"
  type: MovType;
  sku: string;
  desc: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
}

const eur = (c: number) => (c / 100).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

// Motivos possíveis para um movimento. Fechado numa lista em vez de texto
// livre: o campo era opcional e ficava vazio, o que tornava o histórico
// impossível de ler — "entrou stock" sem se saber de onde. Com a lista fixa o
// livro passa a responder "veio do fornecedor", "veio da outra loja" ou
// "veio do armazém".
const NOTE_OPTIONS = [
  { value: "TRF VNG", label: "TRF VNG — transferência de/para V. N. Gaia" },
  { value: "TRF LIS", label: "TRF LIS — transferência de/para Lisboa" },
  { value: "FORN", label: "FORN — fornecedor" },
  { value: "ARMAZEM", label: "ARMAZÉM — entrada/saída do armazém" },
] as const;

function hhmm(d = new Date()) {
  return d.toLocaleTimeString("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" });
}

// Stock intake / outtake scanner — same flow as sales: each scan drops the
// article into a basket (stand-by, with PVP + editable quantity); nothing is
// written until "Registar entrada / saída". Left: scan + basket. Right: the
// session log of what has been committed + running totals.
export function MovimentosScanner({
  boutiques,
  operators,
}: {
  boutiques: BoutiqueCode[];
  operators: { boutique: BoutiqueCode; initials: string }[];
}) {
  const [boutique, setBoutique] = useState<BoutiqueCode>(boutiques[0]);
  const [type, setType] = useState<MovType>("ENTRADA");
  const [scan, setScan] = useState("");
  const [note, setNote] = useState("");
  const [operator, setOperator] = useState("");

  // Operadores da loja seleccionada. No admin chegam os das duas, e trocar de
  // loja tem de limpar a escolha — senão ficava lá o operador da outra.
  const storeOperators = useMemo(
    () => operators.filter((o) => o.boutique === boutique).map((o) => o.initials),
    [operators, boutique],
  );
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const scanRef = useRef<HTMLInputElement>(null);
  const refocus = () => setTimeout(() => scanRef.current?.focus(), 0);

  const basketUnits = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);

  const totals = useMemo(() => {
    const t = { entradas: 0, saidas: 0, unidades: 0 };
    for (const h of history) {
      if (h.type === "ENTRADA") { t.entradas++; t.unidades += h.quantity; }
      else { t.saidas++; t.unidades -= h.quantity; }
    }
    return t;
  }, [history]);

  // Scan → resolve the article and drop it in the basket (bump qty if already
  // there). Nothing is committed here.
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
        const name = (v.name?.pt ?? v.name?.en ?? v.sku) as string;
        const pName = (v.product?.name?.pt ?? v.product?.name?.en ?? "") as string;
        setLines((ls) => [
          ...ls,
          {
            sku: v.sku,
            ean: v.ean,
            desc: `${pName} ${name}`.trim() || v.sku,
            brand: (v.brand as string) ?? "S.T. Dupont",
            unitPriceCents: v.priceCents ?? 0,
            quantity: 1,
          },
        ]);
        setFlash({ kind: "ok", msg: `Adicionado ${v.sku}` });
      } catch {
        setFlash({ kind: "err", msg: "Erro de rede ao ler o código" });
      }
      refocus();
    },
    [lines, boutique],
  );

  const setQty = (i: number, q: number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, quantity: Math.max(1, q || 1) } : l)));
  const removeLine = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));

  // Register the whole basket — one movement per line. Sequential so a mid-list
  // failure still commits (and reports) the ones that worked.
  const register = useCallback(async () => {
    if (busy) return;
    if (lines.length === 0) { setFlash({ kind: "err", msg: "Sem artigos — lê um código primeiro" }); return; }
    // Operador e motivo passaram a obrigatórios: sem eles o histórico não
    // diz quem fez nem porquê, que são as duas perguntas que se faz a um
    // livro de movimentos.
    if (!operator) { setFlash({ kind: "err", msg: "Escolhe o operador" }); return; }
    if (!note) { setFlash({ kind: "err", msg: "Escolhe o motivo do movimento" }); return; }
    setBusy(true);
    setFlash(null);
    let ok = 0;
    const failed: string[] = [];
    const committed: HistoryEntry[] = [];
    for (const l of lines) {
      try {
        const res = await fetch("/api/admin/movimentos", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            boutique,
            type,
            quantity: l.quantity,
            note,
            operatorInitials: operator,
            ...(l.ean ? { ean: l.ean } : { sku: l.sku }),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) { failed.push(`${l.sku}: ${data.error ?? "falha"}`); continue; }
        ok++;
        committed.push({
          id: data.movementId, at: hhmm(), type, sku: data.article.sku, desc: data.article.desc,
          quantity: l.quantity, stockBefore: data.stockBefore, stockAfter: data.stockAfter,
        });
      } catch {
        failed.push(`${l.sku}: erro de rede`);
      }
    }
    if (committed.length) setHistory((prev) => [...committed.reverse(), ...prev].slice(0, 200));
    if (failed.length === 0) {
      setFlash({ kind: "ok", msg: `${type === "ENTRADA" ? "Entrada" : "Saída"} registada · ${ok} artigos` });
      setLines([]);
      // Motivo e operador ficam preenchidos: numa recepção de fornecedor
      // registam-se vários lotes seguidos com os mesmos dois valores.
    } else {
      setLines(lines.filter((l) => failed.some((f) => f.startsWith(l.sku)))); // keep only the ones that failed
      setFlash({ kind: "err", msg: `${ok} registados · ${failed.length} falharam (${failed[0]})` });
    }
    setBusy(false);
    refocus();
  }, [busy, lines, boutique, type, note, operator]);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Left — controls + scanner + basket */}
      <div className="space-y-5">
        {boutiques.length > 1 && (
          <div className="inline-flex rounded-sm border border-line p-0.5">
            {boutiques.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => { setBoutique(b); setLines([]); setHistory([]); setOperator(""); }}
                className={`px-4 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors ${
                  b === boutique ? "bg-ink text-cream" : "text-ink hover:text-gold"
                }`}
              >
                {BOUTIQUE_LABEL[b]}
              </button>
            ))}
          </div>
        )}

        <div className="flex rounded-sm border border-line p-0.5">
          {(["ENTRADA", "SAIDA"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2 text-xs tracking-[0.16em] uppercase transition-colors ${
                t === type ? (t === "ENTRADA" ? "bg-[#3b7551] text-cream" : "bg-[#b94a3a] text-cream") : "text-ink hover:text-gold"
              }`}
            >
              {t === "ENTRADA" ? "Entrada" : "Saída"}
            </button>
          ))}
        </div>

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
          <p className={`text-sm ${flash.kind === "ok" ? "text-[#3b7551]" : "text-[#b94a3a]"}`}>{flash.msg}</p>
        )}

        {/* Basket — scanned articles awaiting confirmation */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                <th className="py-2 pr-3">Artigo</th>
                <th className="py-2 px-2 text-right">PVP</th>
                <th className="py-2 px-2 text-center">Qtd</th>
                <th className="py-2 pl-2"></th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-muted">Sem artigos — lê um código para começar.</td></tr>
              ) : (
                lines.map((l, i) => (
                  <tr key={`${l.sku}-${i}`} className="border-b border-line/60 align-middle">
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-ink">
                        {l.sku}
                        {l.brand && l.brand !== "S.T. Dupont" && (
                          <span className="ml-2 inline-block border border-gold/60 px-1.5 py-0.5 align-middle text-[0.55rem] tracking-[0.12em] text-gold uppercase">{l.brand}</span>
                        )}
                      </p>
                      <p className="text-[0.72rem] text-muted">{l.desc}</p>
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-muted">{eur(l.unitPriceCents)}</td>
                    <td className="py-2.5 px-2 text-center">
                      <input type="number" min={1} value={l.quantity}
                        onChange={(e) => setQty(i, parseInt(e.target.value, 10))}
                        className="w-16 border border-line bg-paper px-2 py-1 text-center tabular-nums outline-none focus:border-gold" />
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <button type="button" onClick={() => removeLine(i)} aria-label="Remover"
                        className="text-muted transition-colors hover:text-[#b94a3a]">✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right — confirm panel + session history */}
      <aside className="h-fit border border-line bg-paper p-5 lg:sticky lg:top-6">
        <label className="block">
          <span className="overline text-[0.55rem] text-muted">Motivo *</span>
          <select
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          >
            <option value="">— escolher —</option>
            {NOTE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        {/* Operador — quem fez o movimento. Obrigatório: sem ele o histórico
            regista o quê e o quando mas não o quem. Lista filtrada pela loja
            escolhida, como no /admin/pos. */}
        <label className="mt-4 block">
          <span className="overline text-[0.55rem] text-muted">Operador *</span>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          >
            <option value="">— escolher —</option>
            {storeOperators.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {storeOperators.length === 0 && (
            <span className="mt-1.5 block text-[0.68rem] text-[#8c2a2a]">
              Sem operadores activos nesta loja — cria um antes de registar.
            </span>
          )}
        </label>

        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4 text-sm">
          <span className="text-muted">No cesto</span>
          <span className="tabular-nums text-ink">{lines.length} artigos · {basketUnits} un.</span>
        </div>

        <button type="button" onClick={register} disabled={busy || lines.length === 0}
          className={`mt-4 w-full py-3 text-xs tracking-[0.2em] text-cream uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            type === "ENTRADA" ? "bg-[#3b7551] hover:bg-[#2f5f42]" : "bg-[#b94a3a] hover:bg-[#9d3e30]"
          }`}>
          {busy ? "A registar…" : type === "ENTRADA" ? "Registar entrada" : "Registar saída"}
        </button>

        {/* Session totals */}
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center text-[0.72rem]">
          <div>
            <p className="font-serif text-xl text-[#3b7551] tabular-nums">{totals.entradas}</p>
            <p className="text-[0.55rem] tracking-[0.12em] text-muted uppercase">Entradas</p>
          </div>
          <div>
            <p className="font-serif text-xl text-[#b94a3a] tabular-nums">{totals.saidas}</p>
            <p className="text-[0.55rem] tracking-[0.12em] text-muted uppercase">Saídas</p>
          </div>
          <div>
            <p className="font-serif text-xl text-ink tabular-nums">{totals.unidades >= 0 ? `+${totals.unidades}` : totals.unidades}</p>
            <p className="text-[0.55rem] tracking-[0.12em] text-muted uppercase">Un. líq.</p>
          </div>
        </div>

        <div className="mt-4 max-h-[24rem] overflow-y-auto border-t border-line pt-3">
          {history.length === 0 ? (
            <p className="py-6 text-center text-[0.72rem] text-muted">Nada registado nesta sessão ainda.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="border-l-2 pl-2.5 text-[0.72rem]"
                    style={{ borderColor: h.type === "ENTRADA" ? "#3b7551" : "#b94a3a" }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="tabular-nums text-muted">{h.at}</span>
                    <span className={`text-[0.55rem] tracking-[0.14em] uppercase ${h.type === "ENTRADA" ? "text-[#3b7551]" : "text-[#b94a3a]"}`}>
                      {h.type === "ENTRADA" ? `+${h.quantity}` : `−${h.quantity}`}
                    </span>
                  </div>
                  <p className="mt-0.5 font-medium text-ink">{h.sku}</p>
                  <p className="text-[0.68rem] text-muted">{h.desc}</p>
                  <p className="mt-0.5 text-[0.62rem] tabular-nums text-muted">
                    Stock: {h.stockBefore} → <span className="font-medium text-ink">{h.stockAfter}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-4 text-center text-[0.6rem] text-muted">
          A hora e o operador são gravados automaticamente em auditoria.
        </p>
      </aside>
    </div>
  );
}
