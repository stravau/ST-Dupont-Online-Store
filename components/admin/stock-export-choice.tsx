"use client";

import { useState } from "react";

// "Exportar stock" — dois ficheiros para dois usos. A caixa explica cada um
// em vez de listar dois botões: quem quer conferir gôndola precisa do
// resumido, quem quer analisar catálogo precisa do completo, e pelo nome do
// ficheiro isso não se percebe.
export function StockExportChoice() {
  const [open, setOpen] = useState(false);
  const href = (modo: "completo" | "resumido") => `/api/admin/stock/export?modo=${modo}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-line bg-paper px-4 py-2 text-[0.68rem] tracking-[0.16em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
      >
        Exportar stock ↓
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Exportar stock"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg border border-gold/40 bg-paper p-6 shadow-2xl"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-xl text-ink">Exportar stock</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="text-muted transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <a
                href={href("completo")}
                download
                onClick={() => setOpen(false)}
                className="block border border-line p-4 transition-colors hover:border-gold"
              >
                <span className="block text-[0.78rem] font-medium tracking-[0.12em] text-ink uppercase">
                  Stock completo
                </span>
                <span className="mt-1 block text-[0.72rem] text-muted">
                  Tudo, com todos os detalhes, em duas folhas: S.T. Dupont
                  (produto, categoria, coleção, PVP, promoção, estado, publicado
                  e stock por loja) e Outras marcas. Inclui os esgotados.
                </span>
              </a>

              <a
                href={href("resumido")}
                download
                onClick={() => setOpen(false)}
                className="block border border-line p-4 transition-colors hover:border-gold"
              >
                <span className="block text-[0.78rem] font-medium tracking-[0.12em] text-ink uppercase">
                  Apenas com stock
                </span>
                <span className="mt-1 block text-[0.72rem] text-muted">
                  Uma folha só, com EAN, REF, STK LIS, STK VNG e Total — só
                  artigos com stock, do maior para o menor. Os de outras marcas
                  aparecem com 0 em STK LIS, por só existirem em Gaia.
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
