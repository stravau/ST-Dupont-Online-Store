"use client";

import { useState } from "react";

// Duas impressões separadas em vez de uma tira contínua: assim o cortador
// automática da impressora separa as vias, e ninguém tem de cortar à mão.
//
// A mecânica é um atributo no <body> que o CSS de impressão lê para esconder
// a via que não interessa naquele trabalho. Encadeado pelo evento `afterprint`
// porque o segundo window.print() disparado de imediato seria engolido
// enquanto o primeiro diálogo ainda está aberto.
type Copy = "cliente" | "loja";

function setCopy(c: Copy | null) {
  if (c) document.body.dataset.printCopy = c;
  else delete document.body.dataset.printCopy;
}

export function PrintButton() {
  const [busy, setBusy] = useState(false);

  function printOne(which: Copy) {
    setCopy(which);
    const done = () => {
      window.removeEventListener("afterprint", done);
      setCopy(null);
    };
    window.addEventListener("afterprint", done);
    window.print();
  }

  function printBoth() {
    if (busy) return;
    setBusy(true);
    setCopy("cliente");

    const afterFirst = () => {
      window.removeEventListener("afterprint", afterFirst);
      // Pequena folga: alguns browsers ainda estão a desmontar o diálogo
      // quando o evento dispara, e um print() imediato não abre.
      setTimeout(() => {
        setCopy("loja");
        const afterSecond = () => {
          window.removeEventListener("afterprint", afterSecond);
          setCopy(null);
          setBusy(false);
        };
        window.addEventListener("afterprint", afterSecond);
        window.print();
      }, 350);
    };

    window.addEventListener("afterprint", afterFirst);
    window.print();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => history.back()}
        className="border border-line bg-paper px-4 py-2 text-[0.65rem] tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold"
      >
        Voltar
      </button>
      {/* Reimpressão avulsa — o cliente perde o talão, a loja precisa de
          segunda via da sua. */}
      <button
        type="button"
        onClick={() => printOne("cliente")}
        className="border border-line bg-paper px-3 py-2 text-[0.6rem] tracking-[0.12em] text-muted uppercase transition-colors hover:border-gold hover:text-ink"
      >
        Só cliente
      </button>
      <button
        type="button"
        onClick={() => printOne("loja")}
        className="border border-line bg-paper px-3 py-2 text-[0.6rem] tracking-[0.12em] text-muted uppercase transition-colors hover:border-gold hover:text-ink"
      >
        Só loja
      </button>
      <button
        type="button"
        onClick={printBoth}
        disabled={busy}
        className="bg-ink px-5 py-2 text-[0.65rem] tracking-[0.14em] text-cream uppercase transition-colors hover:bg-gold hover:text-ink disabled:opacity-50"
      >
        {busy ? "A imprimir…" : "Imprimir os 2 talões ↓"}
      </button>
    </div>
  );
}
