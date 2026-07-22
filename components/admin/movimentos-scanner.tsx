"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { BoutiqueCode } from "@/lib/pos";

type MovType = "ENTRADA" | "SAIDA";

interface HistoryEntry {
  id: string;
  at: string; // "HH:MM"
  type: MovType;
  sku: string;
  ean: string | null;
  desc: string;
  brand: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  boutique: BoutiqueCode;
}

const BOUTIQUE_LABEL: Record<BoutiqueCode, string> = { LIS: "Lisboa", VNG: "V. N. de Gaia" };

function hhmm(d = new Date()) {
  return d.toLocaleTimeString("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" });
}

// Scanner UI for stock intake / outtake — one scan = one signed movement.
// Left: scan input + tab (Entrada / Saída) + boutique + quantity + note.
// Right: chronological session history (current tab only, wipes on reload —
// the DB has the audit trail if you need to go back further).
export function MovimentosScanner({ boutiques }: { boutiques: BoutiqueCode[] }) {
  const [boutique, setBoutique] = useState<BoutiqueCode>(boutiques[0]);
  const [type, setType] = useState<MovType>("ENTRADA");
  const [scan, setScan] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const scanRef = useRef<HTMLInputElement>(null);
  const refocus = () => setTimeout(() => scanRef.current?.focus(), 0);

  const totals = useMemo(() => {
    const t = { entradas: 0, saidas: 0, unidades: 0 };
    for (const h of history) {
      if (h.type === "ENTRADA") { t.entradas++; t.unidades += h.quantity; }
      else { t.saidas++; t.unidades -= h.quantity; }
    }
    return t;
  }, [history]);

  const submit = useCallback(
    async (raw: string) => {
      const code = raw.trim();
      if (!code) return;
      setScan("");
      if (busy) return;
      setBusy(true);
      setFlash(null);
      try {
        const payload: Record<string, unknown> = {
          boutique,
          type,
          quantity,
          note: note.trim() || undefined,
        };
        if (/^\d{8}$|^\d{13}$/.test(code)) payload.ean = code;
        else payload.sku = code;

        const res = await fetch("/api/admin/movimentos", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setFlash({ kind: "err", msg: data.error ?? "Falha ao registar movimento" });
        } else {
          setFlash({ kind: "ok", msg: `${type === "ENTRADA" ? "Entrada" : "Saída"} · ${data.article.sku}` });
          setHistory((prev) => [
            {
              id: data.movementId,
              at: hhmm(),
              type,
              sku: data.article.sku,
              ean: data.article.ean,
              desc: data.article.desc,
              brand: data.article.brand,
              quantity,
              stockBefore: data.stockBefore,
              stockAfter: data.stockAfter,
              boutique,
            },
            ...prev,
          ].slice(0, 100));
        }
      } catch {
        setFlash({ kind: "err", msg: "Erro de rede ao registar" });
      } finally {
        setBusy(false);
        refocus();
      }
    },
    [boutique, type, quantity, note, busy],
  );

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Left — controls + scanner */}
      <div className="space-y-5">
        {boutiques.length > 1 && (
          <div className="inline-flex rounded-sm border border-line p-0.5">
            {boutiques.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => { setBoutique(b); setHistory([]); }}
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
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void submit(scan); } }}
            inputMode="numeric"
            placeholder="Aponta o leitor ou escreve o EAN / REF e Enter"
            className="mt-2 w-full border border-line bg-paper px-4 py-3 font-mono text-lg tabular-nums text-ink outline-none focus:border-gold"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="overline text-[0.55rem] text-muted">Quantidade</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="mt-2 w-full border border-line bg-paper px-4 py-2.5 text-lg tabular-nums text-ink outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="overline text-[0.55rem] text-muted">Nota (opcional)</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 300))}
              placeholder="Ex.: fornecedor, transferência LIS→VNG"
              className="mt-2 w-full border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
          </label>
        </div>

        {flash && (
          <p className={`text-sm ${flash.kind === "ok" ? "text-[#3b7551]" : "text-[#b94a3a]"}`}>
            {flash.msg}
          </p>
        )}
      </div>

      {/* Right — session history */}
      <aside className="h-fit border border-line bg-paper p-5 lg:sticky lg:top-6">
        <p className="overline text-[0.55rem] text-muted">Sessão actual</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[0.72rem]">
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

        <div className="mt-4 max-h-[28rem] overflow-y-auto border-t border-line pt-3">
          {history.length === 0 ? (
            <p className="py-6 text-center text-[0.72rem] text-muted">
              Sem movimentos ainda — lê um código para começar.
            </p>
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
