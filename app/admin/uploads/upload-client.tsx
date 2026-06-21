"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/admin/toast";
import { IconUpload } from "@/components/admin/icons";

interface Report {
  ok: boolean;
  total?: number;
  updated?: number;
  created?: number;
  unmatched?: number;
  skipped?: number;
  error?: string;
  unmatchedSample?: { ref?: string; ean?: string; reason?: string }[];
}

// One upload card on /admin/uploads. Reused for PVP / Promo / Stock /
// New Articles — each card is a self-contained drop-zone + result panel.
export function UploadCard({
  endpoint,
  title,
  tag,
  columns,
  notes,
}: {
  endpoint: string;
  title: string;
  tag: string;
  columns: string[];
  notes: string[];
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setReport(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data: Report = await res.json().catch(() => ({ ok: false, error: "bad response" }));
      setReport(data);
      if (data.ok) {
        toast.push("success", `${title}: ${data.updated ?? data.created ?? 0} aplicadas`);
      } else {
        toast.push("error", `${title}: ${data.error ?? "falha"}`);
      }
    } catch (e) {
      setReport({ ok: false, error: (e as Error).message.slice(0, 200) });
      toast.push("error", `${title}: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col border border-line bg-paper p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="overline text-[0.55rem] text-gold">{tag}</p>
          <h2 className="mt-1 font-serif text-xl text-ink">{title}</h2>
        </div>
        <span className="font-mono text-[0.55rem] text-muted">{endpoint.split("/").pop()}</span>
      </div>

      <p className="mt-5 overline text-[0.55rem] text-muted">Colunas esperadas</p>
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
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
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
            report.ok ? "border-[#2bb673]/40 bg-[#2bb673]/5 text-[#1f7a4d]" : "border-red-300 bg-red-50 text-red-900"
          }`}
        >
          {report.ok ? (
            <>
              <p className="font-semibold uppercase tracking-[0.16em]">Aplicado</p>
              <ul className="mt-2 space-y-0.5 font-mono text-[0.7rem]">
                {typeof report.total     === "number" && <li>Linhas: <span className="text-ink">{report.total}</span></li>}
                {typeof report.updated   === "number" && <li>Atualizadas: <span className="text-ink">{report.updated}</span></li>}
                {typeof report.created   === "number" && <li>Criadas: <span className="text-ink">{report.created}</span></li>}
                {typeof report.unmatched === "number" && <li>Sem match: <span className="text-ink">{report.unmatched}</span></li>}
                {typeof report.skipped   === "number" && <li>Saltadas: <span className="text-ink">{report.skipped}</span></li>}
              </ul>
              {report.unmatchedSample && report.unmatchedSample.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-[0.65rem] tracking-[0.18em] uppercase">Primeiras 10 sem match</summary>
                  <ul className="mt-2 font-mono text-[0.65rem]">
                    {report.unmatchedSample.slice(0, 10).map((u, i) => (
                      <li key={i} className="truncate">{u.ref ?? "—"} · {u.ean ?? "—"}{u.reason ? ` · ${u.reason}` : ""}</li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold uppercase tracking-[0.16em]">Falhou</p>
              <p className="mt-1 font-mono">{report.error ?? "erro desconhecido"}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
