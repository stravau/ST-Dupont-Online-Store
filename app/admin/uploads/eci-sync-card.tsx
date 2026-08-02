"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/admin/toast";
import { IconUpload } from "@/components/admin/icons";

type Tone = "add" | "update" | "remove" | "info";

interface SampleGroup {
  title: string;
  tone: "add" | "update" | "remove";
  lines: string[];
  note?: string;
}
interface SheetReport {
  sheet: string;
  status: "ok" | "pending" | "missing" | "failed";
  rows?: number;
  detail?: string;
  changes?: Record<string, number>;
  samples?: SampleGroup[];
  sampleUnmatched?: string[];
  errorMessage?: string;
  ms?: number; // tempo de processamento da folha
}

// As chaves de `changes` vêm do endpoint em camelCase. Traduzimo-las aqui
// para português corrente e damos-lhes um tom, para se ver de relance o que
// CRIA (verde), o que ALTERA (dourado) e o que APAGA (vermelho) — que é a
// pergunta que interessa antes de carregar em Aplicar.
const CHANGE_LABELS: Record<string, { label: string; tone: Tone }> = {
  dupontLinhas:             { label: "linhas Dupont no ficheiro", tone: "info" },
  correspondidas:           { label: "correspondidas ao catálogo", tone: "info" },
  emBranco:                 { label: "linhas em branco", tone: "info" },
  stockAtualizado:          { label: "stock a actualizar", tone: "update" },
  stockZerado:              { label: "stock a zerar", tone: "remove" },
  pvpAtualizado:            { label: "PVP a actualizar", tone: "update" },
  novosArtigos:             { label: "artigos novos", tone: "add" },
  outrasMarcas:             { label: "outras marcas no ficheiro", tone: "info" },
  outrasMarcasApagar:       { label: "outras marcas a apagar", tone: "remove" },
  outrasMarcasGravadas:     { label: "outras marcas gravadas", tone: "update" },
  outrasMarcasApagadas:     { label: "outras marcas apagadas", tone: "remove" },
  outrasMarcasEanLibertado: { label: "EAN libertado", tone: "update" },
  outrasMarcasFalhadas:     { label: "outras marcas falhadas", tone: "remove" },
  reservas:                 { label: "reservas no ficheiro", tone: "info" },
  aApagar:                  { label: "a apagar", tone: "remove" },
  novas:                    { label: "novas", tone: "add" },
  novos:                    { label: "novos", tone: "add" },
  atualizadas:              { label: "actualizadas", tone: "update" },
  atualizados:              { label: "actualizados", tone: "update" },
  apagadas:                 { label: "apagadas", tone: "remove" },
  apagados:                 { label: "apagados", tone: "remove" },
  operadores:               { label: "operadores", tone: "info" },
  metasAtualizadas:         { label: "metas actualizadas", tone: "update" },
  movimentos:               { label: "movimentos no ficheiro", tone: "info" },
  linhas:                   { label: "linhas", tone: "info" },
  vendas:                   { label: "linhas de venda", tone: "info" },
  devolucoes:               { label: "linhas de devolução", tone: "info" },
  baskets:                  { label: "cestos a criar", tone: "add" },
  vendasAApagar:            { label: "vendas a apagar", tone: "remove" },
  malFormadas:              { label: "linhas ignoradas", tone: "info" },
  semOperador:              { label: "sem operador", tone: "info" },
  total:                    { label: "total", tone: "info" },
  ignoradas:                { label: "ignoradas", tone: "info" },
};

// Chaves cujo valor é destrutivo — usadas para o aviso no topo.
const DESTRUCTIVE_KEYS = new Set([
  "stockZerado", "outrasMarcasApagar", "outrasMarcasApagadas",
  "vendasAApagar", "aApagar", "apagadas", "apagados",
]);

const TONE_TEXT: Record<Tone, string> = {
  add: "text-[#1f7a4d]",
  update: "text-[#7e5e00]",
  remove: "text-[#8c2a2a]",
  info: "text-muted",
};
const TONE_BOX: Record<"add" | "update" | "remove", string> = {
  add: "border-[#2bb673]/40 bg-[#2bb673]/5",
  update: "border-gold/40 bg-gold/5",
  remove: "border-[#b94a3a]/40 bg-[#b94a3a]/5",
};

// Junta, de todas as folhas, só o que é irreversível — para o aviso no topo
// da pré-visualização. Sem isto era preciso caçar as chaves destrutivas no
// meio das informativas, folha a folha.
function destructiveSummary(reports: SheetReport[]): string[] {
  const out: string[] = [];
  for (const r of reports) {
    for (const [k, v] of Object.entries(r.changes ?? {})) {
      if (!v || !DESTRUCTIVE_KEYS.has(k)) continue;
      const label = CHANGE_LABELS[k]?.label ?? k;
      out.push(`${v.toLocaleString("pt-PT")} ${label} — folha ${r.sheet}`);
    }
  }
  return out;
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
          {/* Resumo do que é irreversível, em cima e em português corrente —
              antes era preciso ler chaves camelCase espalhadas por 10 linhas
              para perceber que o sync ia apagar vendas. */}
          {!result.applied && destructiveSummary(result.reports).length > 0 && (
            <div className="mt-4 border border-[#b94a3a]/40 bg-[#b94a3a]/5 px-4 py-3">
              <p className="text-[0.6rem] font-semibold tracking-[0.16em] text-[#8c2a2a] uppercase">
                O que vai ser apagado
              </p>
              <ul className="mt-2 space-y-0.5 text-xs text-[#8c2a2a]">
                {destructiveSummary(result.reports).map((d) => (
                  <li key={d}>· {d}</li>
                ))}
              </ul>
            </div>
          )}

          <ul className="mt-4 space-y-3">
            {result.reports.map((r) => {
              const entries = Object.entries(r.changes ?? {}).filter(([, v]) => v);
              return (
                <li key={r.sheet} className="border-b border-line/60 pb-3 last:border-b-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-xs text-ink">{r.sheet}</span>
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
                    {typeof r.rows === "number" && (
                      <span className="text-[0.6rem] text-muted tabular-nums">{r.rows.toLocaleString("pt-PT")} linhas lidas</span>
                    )}
                    <span className="ml-auto font-mono text-[0.6rem] text-muted tabular-nums">
                      {typeof r.ms === "number" ? (r.ms >= 1000 ? `${(r.ms / 1000).toFixed(1)}s` : `${r.ms}ms`) : ""}
                    </span>
                  </div>

                  {r.status === "failed" ? (
                    <p className="mt-1.5 font-mono text-[0.68rem] text-[#8c2a2a]">{r.errorMessage ?? "erro desconhecido"}</p>
                  ) : entries.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem]">
                      {entries.map(([k, v]) => {
                        const meta = CHANGE_LABELS[k] ?? { label: k, tone: "info" as Tone };
                        return (
                          <span key={k} className={TONE_TEXT[meta.tone]}>
                            <strong className="tabular-nums">{v.toLocaleString("pt-PT")}</strong> {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[0.7rem] text-muted">{r.detail ?? "sem alterações"}</p>
                  )}

                  {/* Exemplos reais — a parte que responde a "isto está certo?" */}
                  {r.samples?.map((g) => (
                    <details key={g.title} className={`mt-2 border px-3 py-2 ${TONE_BOX[g.tone]}`}>
                      <summary className={`cursor-pointer text-[0.68rem] font-medium ${TONE_TEXT[g.tone]}`}>
                        {g.title}
                      </summary>
                      {g.note && <p className="mt-1.5 text-[0.65rem] text-muted italic">{g.note}</p>}
                      <ul className="mt-1.5 space-y-0.5 font-mono text-[0.65rem] text-ink">
                        {g.lines.map((l, i) => <li key={i} className="break-words">{l}</li>)}
                      </ul>
                    </details>
                  ))}
                </li>
              );
            })}
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
