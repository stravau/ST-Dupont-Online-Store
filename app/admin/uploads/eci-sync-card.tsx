"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/admin/toast";
import { IconUpload } from "@/components/admin/icons";

interface SheetReport {
  sheet: string;
  status: "ok" | "pending" | "missing" | "failed";
  rows?: number;
  detail?: string;
  changes?: Record<string, number>;
  sampleUnmatched?: string[];
  errorMessage?: string;
}
interface SyncResult {
  ok: boolean;
  store?: "LIS" | "VNG";
  applied?: boolean;
  file?: string;
  reports?: SheetReport[];
  error?: string;
  trace?: string;
  needStore?: boolean;
  warning?: string;
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

      // Try JSON first; if it fails (413/504/500 returning HTML from Vercel),
      // surface the HTTP status + body snippet so the operator knows what
      // actually broke (payload too large? timeout? crash?).
      let data: SyncResult;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text().catch(() => "");
        const snippet = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
        const knownError =
          res.status === 413 ? `Ficheiro demasiado grande para o Vercel (limite 4.5MB por request). O ficheiro tem ${(f.size / 1024 / 1024).toFixed(1)}MB.`
          : res.status === 504 ? `Timeout — o sync demorou mais que o permitido no Vercel. Volta a tentar; se persistir, temos de dividir o processamento.`
          : res.status === 401 || res.status === 403 ? "Sessão expirou. Recarrega a página e volta a fazer login."
          : `HTTP ${res.status} · ${snippet || res.statusText || "sem detalhe"}`;
        data = { ok: false, error: knownError };
      }
      setResult(data);
      if (data.ok) {
        toast.push("success", apply ? `Sincronização aplicada (${data.store})` : `Pré-visualização pronta (${data.store})`);
      } else {
        toast.push("error", data.error ?? "falha");
      }
    } catch (e) {
      // Network abort, connection reset, etc.
      const msg = (e as Error).message.slice(0, 200);
      setResult({ ok: false, error: `Rede: ${msg}` });
      toast.push("error", msg);
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
            só grava quando clicares em <strong>Aplicar</strong>. Cobre stock, PVP, novos artigos, outras marcas,
            histórico de vendas, movimentos internos, danificados, reservas, operadores e as três folhas de reparações.
          </p>
          <p className="mt-3 max-w-xl text-[0.72rem] text-[#7e5e00]">
            <strong>Modo autoritativo total:</strong> o Excel é a fonte <strong>única</strong>. Tudo o que existir na
            app fora do ficheiro é apagado &mdash; <strong>vendas registadas no POS</strong>, movimentos de stock
            criados na página de Entradas/Saídas, reservas, reparações e artigos de outras marcas.
            Variantes Dupont ausentes ficam com stock desta loja a <strong>zero</strong>. Nada da app
            sobrevive a um sync se não estiver também no Excel. A pré-visualização mostra as contagens
            antes de qualquer gravação.
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
          {result.trace && (
            <details className="mt-2">
              <summary className="cursor-pointer font-mono text-[0.6rem] uppercase tracking-[0.14em]">Stack</summary>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[0.6rem]">{result.trace}</pre>
            </details>
          )}
          {result.needStore && <p className="mt-1">Escolhe a loja no seletor acima e arrasta o ficheiro outra vez.</p>}
        </div>
      )}

      {result?.warning && (
        <div className="mt-5 border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <p className="font-semibold uppercase tracking-[0.16em]">Aviso</p>
          <p className="mt-1">{result.warning}</p>
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
                  r.status === "ok" ? "text-[#1f7a4d]" :
                  r.status === "pending" ? "text-[#7e5e00]" :
                  r.status === "failed" ? "text-[#8c2a2a]" :
                  "text-muted"
                }`}>
                  {r.status === "ok" ? "pronto" :
                   r.status === "pending" ? "pendente" :
                   r.status === "failed" ? "FALHOU" :
                   "ausente"}
                </span>
                <span className="text-muted">
                  {r.status === "failed" ? (
                    <span className="font-mono text-[0.68rem] text-[#8c2a2a]">
                      {r.errorMessage ?? "erro desconhecido"}
                    </span>
                  ) : r.changes ? (
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
            <p className="mt-4 text-center text-[0.7rem] text-[#1f7a4d]">✓ Sincronização gravada.</p>
          )}
        </div>
      )}
    </div>
  );
}
