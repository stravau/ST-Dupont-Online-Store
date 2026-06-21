"use client";

import { useRef, useState } from "react";

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

// Single upload card with drop-zone + file input + POST handler.
// Reused by /admin/uploads for PVP, Promo, Stock and New Articles.
export function UploadCard({
  endpoint,
  title,
  columns,
  notes,
}: {
  endpoint: string;
  title: string;
  columns: string[];
  notes: string[];
}) {
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
    } catch (e) {
      setReport({ ok: false, error: (e as Error).message.slice(0, 200) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-line bg-paper p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl">{title}</h2>
        <span className="overline text-[0.55rem] text-gold">{endpoint.split("/").pop()}</span>
      </div>

      <p className="mt-3 text-xs tracking-[0.16em] text-muted uppercase">Colunas esperadas</p>
      <p className="mt-1 font-mono text-[0.65rem] text-ink">{columns.join(" · ")}</p>

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
        className={`mt-5 flex h-28 cursor-pointer flex-col items-center justify-center border border-dashed text-center text-xs transition-colors ${
          dragOver ? "border-gold bg-gold/5 text-ink" : "border-line text-muted hover:border-gold hover:text-ink"
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
          <span className="tracking-[0.18em] uppercase">A processar…</span>
        ) : (
          <>
            <span className="tracking-[0.18em] uppercase">Arrasta um .xlsx</span>
            <span className="mt-1 text-[0.6rem] text-muted">ou clica para escolher</span>
          </>
        )}
      </label>

      {report && (
        <div
          className={`mt-5 border px-4 py-3 text-xs ${
            report.ok ? "border-green-300 bg-green-50 text-green-900" : "border-red-300 bg-red-50 text-red-900"
          }`}
        >
          {report.ok ? (
            <>
              <p className="font-semibold">Aplicado.</p>
              <ul className="mt-2 space-y-0.5">
                {typeof report.total     === "number" && <li>Linhas no ficheiro: {report.total}</li>}
                {typeof report.updated   === "number" && <li>Atualizadas: {report.updated}</li>}
                {typeof report.created   === "number" && <li>Criadas: {report.created}</li>}
                {typeof report.unmatched === "number" && <li>Sem match (ignoradas): {report.unmatched}</li>}
                {typeof report.skipped   === "number" && <li>Saltadas (validação): {report.skipped}</li>}
              </ul>
              {report.unmatchedSample && report.unmatchedSample.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer">Mostrar primeiras 10 sem match</summary>
                  <ul className="mt-2 font-mono text-[0.65rem]">
                    {report.unmatchedSample.slice(0, 10).map((u, i) => (
                      <li key={i}>{u.ref ?? "—"} · {u.ean ?? "—"} {u.reason ? ` · ${u.reason}` : ""}</li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold">Falhou.</p>
              <p className="mt-1 font-mono">{report.error ?? "erro desconhecido"}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
