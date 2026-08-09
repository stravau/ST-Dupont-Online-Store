"use client";

import { useState } from "react";

// "Exportar" com escolha do formato. São dois relatórios que respondem a
// perguntas diferentes sobre o mesmo período, e a diferença não é óbvia pelo
// nome do ficheiro — por isso a caixa explica cada um em vez de só listar dois
// botões.
export function ExportChoice({
  from,
  to,
  boutique,
  label = "Exportar",
}: {
  from: string;
  to: string;
  /** "" = as duas lojas */
  boutique?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  const href = (modo?: "produtos") => {
    const p = new URLSearchParams({ from, to });
    if (boutique) p.set("boutique", boutique);
    if (modo) p.set("modo", modo);
    return `/api/admin/reports/export?${p.toString()}`;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-[0.7rem] tracking-[0.18em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink"
      >
        {label} ↓
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg border border-gold/40 bg-paper p-6 shadow-2xl"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-xl text-ink">Exportar</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="text-muted transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-[0.72rem] text-muted">
              Período de {from} a {to}
              {boutique ? ` · ${boutique === "LIS" ? "Lisboa" : "V. N. de Gaia"}` : " · as duas lojas"}
            </p>

            <div className="mt-5 space-y-3">
              <a
                href={href()}
                download
                onClick={() => setOpen(false)}
                className="block border border-line p-4 transition-colors hover:border-gold"
              >
                <span className="block text-[0.78rem] font-medium tracking-[0.12em] text-ink uppercase">
                  Relatório de vendas
                </span>
                <span className="mt-1 block text-[0.72rem] text-muted">
                  Uma linha por movimento, com data, hora, operador, PVP, desconto
                  e comissão — o mesmo formato da folha Mov_POS_Loja do ECI.
                </span>
              </a>

              <a
                href={href("produtos")}
                download
                onClick={() => setOpen(false)}
                className="block border border-line p-4 transition-colors hover:border-gold"
              >
                <span className="block text-[0.78rem] font-medium tracking-[0.12em] text-ink uppercase">
                  Apenas produtos vendidos
                </span>
                <span className="mt-1 block text-[0.72rem] text-muted">
                  Uma linha por artigo, do mais vendido para o menos: REF,
                  descrição, quantidade e valor, com total no fim. Devoluções
                  abatidas.
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
