"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/toast";
import { IconUpload } from "@/components/admin/icons";

// "+ Criar artigos (Excel)" — botão + modal com drop-zone, usado nas duas
// tabs de Consultar Stock (S.T. Dupont e Outras marcas). Substituiu o
// preenchimento campo-a-campo: na prática os artigos novos chegam sempre
// em lote num ficheiro, não um de cada vez.
//
// Cada tab passa o seu endpoint — a forma do relatório é a mesma
// (total/created/updated/skipped + amostra do que falhou).

interface Report {
  ok: boolean;
  total?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  error?: string;
  unmatchedSample?: { ref?: string; reason?: string }[];
}

export function ArticleImportButton({
  endpoint,
  title,
  columns,
  notes,
  label = "+ Criar artigos",
}: {
  endpoint: string;
  title: string;
  columns: string[];
  notes: string[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-gold bg-gold px-4 py-2 text-[0.68rem] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-ink hover:text-cream"
      >
        {label}
      </button>
      {open && (
        <ArticleImportModal
          endpoint={endpoint}
          title={title}
          columns={columns}
          notes={notes}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ArticleImportModal({
  endpoint,
  title,
  columns,
  notes,
  onClose,
}: {
  endpoint: string;
  title: string;
  columns: string[];
  notes: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  async function upload(file: File) {
    if (busy) return;
    setBusy(true);
    setReport(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      // O endpoint pode devolver HTML numa falha de infra (413/504) —
      // por isso o catch aqui em vez de assumir JSON.
      const data: Report = await res
        .json()
        .catch(() => ({ ok: false, error: `HTTP ${res.status} · resposta não-JSON` }));
      setReport(data);
      if (data.ok) {
        const n = (data.created ?? 0) + (data.updated ?? 0);
        toast.push("success", `${title}: ${n} artigo${n === 1 ? "" : "s"} aplicado${n === 1 ? "" : "s"}`);
        router.refresh();
      } else {
        toast.push("error", `${title}: ${data.error ?? "falha"}`);
      }
    } catch (e) {
      const msg = (e as Error).message.slice(0, 200);
      setReport({ ok: false, error: msg });
      toast.push("error", `${title}: ${msg}`);
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
      aria-labelledby="article-import-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-lg overflow-y-auto border border-gold/40 bg-paper p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="article-import-title" className="font-serif text-xl text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Fechar"
            className="text-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <p className="overline text-[0.55rem] text-muted">Colunas esperadas</p>
        <p className="mt-1.5 font-mono text-[0.65rem] text-ink">
          {columns.map((c, i) => (
            <span key={c}>
              {i > 0 && <span className="text-muted"> · </span>}
              {c}
            </span>
          ))}
        </p>

        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted">
          {notes.map((n) => <li key={n}>{n}</li>)}
        </ul>

        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) upload(f);
          }}
          className={`mt-5 flex h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed text-center transition-colors ${
            busy
              ? "border-gold/60 bg-gold/5 text-ink"
              : dragOver
                ? "border-gold bg-gold/10 text-ink"
                : "border-line text-muted hover:border-gold hover:text-ink"
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
          />
          {busy ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
              <span className="text-[0.65rem] tracking-[0.18em] uppercase">A processar…</span>
            </>
          ) : (
            <>
              <IconUpload className="h-5 w-5" />
              <span className="text-[0.65rem] tracking-[0.18em] uppercase">Arrasta um .xlsx ou clica</span>
            </>
          )}
        </label>

        {report && (
          <div
            className={`mt-5 border px-4 py-3 text-xs ${
              report.ok
                ? "border-[#2bb673]/40 bg-[#2bb673]/5 text-[#1f7a4d]"
                : "border-[#b94a3a]/40 bg-[#b94a3a]/10 text-[#8c2a2a]"
            }`}
          >
            {report.ok ? (
              <>
                <p className="font-semibold tracking-[0.16em] uppercase">Aplicado</p>
                <ul className="mt-2 space-y-0.5 font-mono text-[0.7rem]">
                  {typeof report.total   === "number" && <li>Linhas: <span className="text-ink">{report.total}</span></li>}
                  {typeof report.created === "number" && <li>Criados: <span className="text-ink">{report.created}</span></li>}
                  {typeof report.updated === "number" && <li>Actualizados: <span className="text-ink">{report.updated}</span></li>}
                  {typeof report.skipped === "number" && <li>Saltados: <span className="text-ink">{report.skipped}</span></li>}
                </ul>
                {report.unmatchedSample && report.unmatchedSample.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-[0.65rem] tracking-[0.18em] uppercase">
                      Primeiras {Math.min(10, report.unmatchedSample.length)} saltadas
                    </summary>
                    <ul className="mt-2 font-mono text-[0.65rem]">
                      {report.unmatchedSample.slice(0, 10).map((u, i) => (
                        <li key={i} className="truncate">{u.ref ?? "—"}{u.reason ? ` · ${u.reason}` : ""}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            ) : (
              <>
                <p className="font-semibold tracking-[0.16em] uppercase">Falhou</p>
                <p className="mt-1 font-mono">{report.error ?? "erro desconhecido"}</p>
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="border border-line bg-paper px-4 py-2 text-[0.65rem] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold disabled:opacity-40"
          >
            {report?.ok ? "Fechar" : "Cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}
