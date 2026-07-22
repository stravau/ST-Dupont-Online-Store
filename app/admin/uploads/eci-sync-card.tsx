"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/admin/toast";
import { IconUpload } from "@/components/admin/icons";

interface SheetReport {
  sheet: string;
  status: "ok" | "pending" | "missing";
  rows?: number;
  detail?: string;
  changes?: Record<string, number>;
  sampleUnmatched?: string[];
}
interface SyncResult {
  ok: boolean;
  store?: "LIS" | "VNG";
  applied?: boolean;
  file?: string;
  reports?: SheetReport[];
  error?: string;
  needStore?: boolean;
}

// The unified "Sincronizar ECI Controlo" card. Upload → DRY-RUN preview (see the
// per-sheet report) → "Aplicar" to commit. Detects LIS/VNG from the filename;
// falls back to a manual picker when it can't. Nothing is written until Aplicar.
export function EciSyncCard() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [store, setStore] = useState<"" | "LIS" | "VNG">("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function run(f: File, apply: boolean) {
    setBusy(true);
    if (!apply) setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("apply", apply ? "true" : "false");
      if (store) fd.append("store", store);
      const res = await fetch("/api/admin/sync/eci", { method: "POST", body: fd });
      const data: SyncResult = await res.json().catch(() => ({ ok: false, error: "resposta inválida" }));
      setResult(data);
      if (data.ok) {
        toast.push("success", apply ? `Sincronização aplicada (${data.store})` : `Pré-visualização pronta (${data.store})`);
      } else {
        toast.push("error", data.error ?? "falha");
      }
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message.slice(0, 200) });
      toast.push("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function pick(f: File) {
    setFile(f);
    setResult(null);
    void run(f, false); // auto-preview on pick
  }

  const previewed = result?.ok && result.applied === false;

  return (
    <div className="border border-gold/50 bg-paper p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="overline text-[0.55rem] text-gold">Sincronização</p>
          <h2 className="mt-1 font-serif text-2xl text-ink">Sincronizar ECI Controlo</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Arrasta o ficheiro ECI (LIS ou VNG). Vês primeiro uma <strong>pré-visualização</strong> do que muda;
            só grava quando clicares em <strong>Aplicar</strong>. Cobre stock, PVP, artigos novos e outras marcas.
          </p>
        </div>
        <label className="shrink-0 text-xs">
          <span className="overline mb-1 block text-[0.55rem] text-muted">Loja</span>
          <select value={store} onChange={(e) => setStore(e.target.value as "" | "LIS" | "VNG")}
            className="border border-line bg-paper px-2 py-1.5 text-sm outline-none focus:border-gold">
            <option value="">Auto</option>
            <option value="LIS">Lisboa</option>
            <option value="VNG">V. N. Gaia</option>
          </select>
        </label>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) pick(f); }}
        className={`mt-5 flex h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed text-center transition-colors ${
          busy ? "border-gold/60 bg-gold/5 text-ink" : dragOver ? "border-gold bg-gold/10 text-ink" : "border-line text-muted hover:border-gold hover:text-ink"
        }`}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); }} />
        {busy ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
            <span className="text-[0.65rem] tracking-[0.18em] uppercase">A processar…</span>
          </>
        ) : (
          <>
            <IconUpload className="h-5 w-5" />
            <span className="text-[0.65rem] tracking-[0.18em] uppercase">{file ? file.name : "Arrasta o ECI_LIS / ECI_VNG .xlsx"}</span>
          </>
        )}
      </label>

      {result && !result.ok && (
        <div className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-900">
          <p className="font-semibold uppercase tracking-[0.16em]">Falhou</p>
          <p className="mt-1 font-mono">{result.error}</p>
          {result.needStore && <p className="mt-1">Escolhe a loja no seletor acima e arrasta o ficheiro outra vez.</p>}
        </div>
      )}

      {result?.ok && result.reports && (
        <div className="mt-5">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <p className="text-[0.6rem] tracking-[0.16em] text-muted uppercase">
              {result.applied ? "Aplicado" : "Pré-visualização"} · loja {result.store}
            </p>
            <span className="font-mono text-[0.6rem] text-muted">{result.file}</span>
          </div>
          <ul className="mt-3 divide-y divide-line/60">
            {result.reports.map((r) => (
              <li key={r.sheet} className="grid grid-cols-[10rem_5rem_1fr] items-baseline gap-3 py-2 text-xs">
                <span className="font-mono text-ink">{r.sheet}</span>
                <span className={`text-[0.6rem] tracking-[0.12em] uppercase ${
                  r.status === "ok" ? "text-[#1f7a4d]" : r.status === "pending" ? "text-[#7e5e00]" : "text-muted"
                }`}>
                  {r.status === "ok" ? "pronto" : r.status === "pending" ? "pendente" : "ausente"}
                </span>
                <span className="text-muted">
                  {r.changes ? (
                    <span className="font-mono text-[0.68rem] text-ink">
                      {Object.entries(r.changes).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · ") || "sem alterações"}
                    </span>
                  ) : r.detail}
                </span>
              </li>
            ))}
          </ul>

          {previewed && (
            <button type="button" disabled={busy} onClick={() => file && run(file, true)}
              className="mt-5 w-full bg-ink py-3 text-xs tracking-[0.2em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:opacity-40">
              Aplicar sincronização
            </button>
          )}
          {result.applied && (
            <p className="mt-4 text-center text-[0.7rem] text-[#1f7a4d]">✓ Gravado. As outras folhas ligam-se num próximo passo.</p>
          )}
        </div>
      )}
    </div>
  );
}
