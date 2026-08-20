"use client";

import { useRef, useState } from "react";

// Fotografia de fundo da faixa "Em Destaque".
//
// Arrastar para cima da caixa ou clicar para escolher — as duas coisas caem no
// mesmo sítio, que é enviar o ficheiro para /api/admin/home-background. A
// pré-visualização é local (URL.createObjectURL) para o patrão ver o
// enquadramento antes de a rede responder.
//
// O "repor original" apaga a definição em vez de gravar o caminho do ficheiro
// que vem com o código: assim, se um dia esse ficheiro mudar de nome, quem
// nunca trocou o fundo não fica com um link partido gravado na base.
export function BackgroundBox({
  actual,
  original,
}: {
  actual: string | null;
  original: string;
}) {
  const [url, setUrl] = useState<string | null>(actual);
  const [previa, setPrevia] = useState<string | null>(null);
  const [aDecorrer, setADecorrer] = useState(false);
  const [sobre, setSobre] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const mostrado = previa ?? url ?? original;

  async function enviar(file: File) {
    setErro(null);
    if (!file.type.startsWith("image/")) {
      setErro("Isso não é uma imagem.");
      return;
    }
    setPrevia(URL.createObjectURL(file));
    setADecorrer(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/home-background?upload=1", {
        method: "POST",
        body: fd,
      });
      const j = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !j.ok || !j.url) throw new Error(j.error ?? "falhou o envio");
      setUrl(j.url);
      setPrevia(null);
    } catch (e) {
      setPrevia(null);
      setErro(e instanceof Error ? e.message : "falhou o envio");
    } finally {
      setADecorrer(false);
    }
  }

  async function repor() {
    setErro(null);
    setADecorrer(true);
    try {
      const res = await fetch("/api/admin/home-background", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: "" }),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) throw new Error(j.error ?? "não consegui repor");
      setUrl(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "não consegui repor");
    } finally {
      setADecorrer(false);
    }
  }

  return (
    <section className="mt-8 border border-line bg-paper p-5">
      <h2 className="font-serif text-lg text-ink">Fotografia de fundo</h2>
      <p className="mt-1 max-w-2xl text-[0.8rem] leading-relaxed text-muted">
        A imagem por trás da faixa. Arrasta um ficheiro para a caixa ou clica para
        escolher. Fica escurecida no site para as letras se lerem, portanto uma
        fotografia com muito detalhe ao centro perde-se — as que resultam melhor
        são largas e com o motivo fora do meio.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSobre(true);
        }}
        onDragLeave={() => setSobre(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSobre(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void enviar(f);
        }}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") input.current?.click();
        }}
        className={[
          "mt-4 relative flex h-56 cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed transition-colors",
          sobre ? "border-gold bg-gold/5" : "border-line hover:border-gold/60",
        ].join(" ")}
      >
        {/* Mesma mecânica da homepage: a foto entra por CSS sobre um fundo
            preto, para a caixa nunca ficar vazia se o ficheiro falhar. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-black bg-cover bg-center"
          style={{ backgroundImage: `url(${mostrado})` }}
        />
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        <p className="relative text-center text-[0.72rem] tracking-[0.18em] text-cream uppercase">
          {aDecorrer ? "A enviar…" : sobre ? "Larga aqui" : "Arrasta ou clica para trocar"}
        </p>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void enviar(f);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex items-center gap-4">
        <span className="text-[0.72rem] text-muted">
          {url ? "A usar uma fotografia carregada por ti." : "A usar a fotografia original."}
        </span>
        {url && (
          <button
            type="button"
            onClick={() => void repor()}
            disabled={aDecorrer}
            className="text-[0.72rem] tracking-[0.14em] text-muted uppercase underline underline-offset-4 hover:text-ink disabled:opacity-50"
          >
            Repor a original
          </button>
        )}
      </div>

      {erro && <p className="mt-2 text-[0.78rem] text-claret">{erro}</p>}
    </section>
  );
}
