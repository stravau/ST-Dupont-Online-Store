"use client";

import { useEffect, useState } from "react";
import { recolher, registarErro } from "@/lib/reporte-recolha";

// Rede que apanha qualquer página do painel a rebentar.
//
// Antes disto existir, uma página com erro mostrava o ecrã genérico do Next e
// ninguém ficava a saber — o registo morria nos logs da Vercel. Agora reporta-
// se sozinha, com os passos que levaram até ali, e a pessoa vê uma mensagem em
// português com o que pode fazer a seguir.
//
// A pessoa não tem de carregar em nada: se ninguém reportasse, o erro que
// impede de trabalhar seria justamente o que nunca chegava.

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [enviado, setEnviado] = useState<boolean | null>(null);

  useEffect(() => {
    registarErro(error.message, "boundary", error.stack);
    fetch("/api/admin/reporte", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        categoria: "PAGINA",
        // Uma página que rebenta bloqueia sempre quem lá estava.
        bloqueado: true,
        descricao: error.digest ? `digest ${error.digest}` : null,
        url: window.location.href,
        origem: "BOUNDARY",
        ...recolher(),
      }),
    })
      .then((r) => setEnviado(r.ok))
      .catch(() => setEnviado(false));
  }, [error]);

  return (
    <div className="painel-card mx-auto mt-10 max-w-xl p-8 text-center">
      <p className="text-[0.55rem] font-semibold tracking-[0.12em] text-gold uppercase">Erro</p>
      <h1 className="mt-2 font-serif text-2xl text-ink">Esta página não conseguiu carregar</h1>
      <p className="mt-3 text-sm text-muted">
        {enviado === null
          ? "A registar o problema…"
          : enviado
            ? "O problema foi registado automaticamente — não precisas de o reportar."
            : "Não foi possível registar o problema. Se puderes, avisa o Luís."}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink px-5 py-2 text-[0.72rem] font-medium tracking-[0.12em] text-cream uppercase"
        >
          Tentar outra vez
        </button>
        <a
          href="/admin"
          className="rounded-full border border-line px-5 py-2 text-[0.72rem] font-medium tracking-[0.12em] text-muted uppercase transition-colors hover:text-ink"
        >
          Voltar ao painel
        </a>
      </div>
    </div>
  );
}
