"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Marcar como resolvido. Serve para dois fins ao mesmo tempo: limpa a lista, e
// liberta a impressão digital — a partir daí, se o mesmo erro voltar, cria um
// reporte novo em vez de somar ao antigo. É assim que se sabe que uma correcção
// não pegou.
export function ResolverBotao({ id }: { id: string }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);

  return (
    <button
      type="button"
      disabled={ocupado}
      onClick={async () => {
        setOcupado(true);
        await fetch(`/api/admin/reporte/${id}`, { method: "PATCH" }).catch(() => {});
        router.refresh();
        setOcupado(false);
      }}
      className="rounded-full border border-line px-4 py-1.5 text-[0.68rem] font-medium tracking-[0.12em] text-muted uppercase transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
    >
      {ocupado ? "A marcar…" : "Marcar como resolvido"}
    </button>
  );
}
