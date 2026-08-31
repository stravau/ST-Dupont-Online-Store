"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { instalarRecolha, recolher, registarPasso } from "@/lib/reporte-recolha";
import { useToast } from "@/components/admin/toast";

// Botão de reportar problema — o ponto de exclamação no canto do cabeçalho.
//
// Pede uma categoria, se a pessoa está bloqueada, e uma descrição. A caixa de
// texto só aparece DEPOIS de haver categoria escolhida, e com a pergunta certa
// por cima — quem já escolheu está a meio, e uma pergunta concreta ("que
// artigo?") responde-se; um campo vazio a dizer "observações" salta-se.
//
// A descrição é obrigatória no formulário mas NÃO no servidor: os reportes de
// origem AUTOMATICO não têm ninguém para a escrever.
//
// O que dá valor ao reporte vai anexado sozinho: os últimos passos, os erros
// que o browser apanhou, os pedidos que falharam, a versão em produção e o
// estado do ecrã. Ver lib/reporte-recolha.ts.

// A "dica" é a pergunta que aparece por cima da caixa de texto depois de a
// pessoa escolher. Uma pergunta concreta — "que artigo?" — enche-se muito mais
// vezes do que um campo vazio a dizer "observações".
const CATEGORIAS = [
  {
    v: "VENDA",
    label: "Não consigo registar uma venda",
    dica: "O que estavas a fazer quando falhou?",
    exemplo: "Ex.: li o código, meti a quantidade e ao carregar em finalizar não aconteceu nada",
  },
  {
    v: "ARTIGO",
    label: "Um artigo aparece errado",
    dica: "Que artigo é, e o que está errado nele?",
    exemplo: "Ex.: a Ligne 2 preta aparece sem stock mas tenho duas na gaveta",
  },
  {
    v: "PAGINA",
    label: "A página não carrega ou dá erro",
    dica: "Que página era, e o que apareceu no ecrã?",
    exemplo: "Ex.: abri as reparações e ficou a carregar sem fim",
  },
  {
    v: "NUMEROS",
    label: "Os números não batem certo",
    dica: "Que número está errado, e qual devia ser?",
    exemplo: "Ex.: as vendas de hoje dizem 3 e eu fiz 5",
  },
  {
    v: "OUTRO",
    label: "Outro",
    dica: "Conta o que aconteceu.",
    exemplo: "Ex.: o que fizeste, e o que esperavas que acontecesse",
  },
] as const;

export function ReporteBotao() {
  const toast = useToast();
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [categoria, setCategoria] = useState<string>("");
  const [bloqueado, setBloqueado] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);

  // A recolha instala-se uma vez e fica a ouvir desde o primeiro segundo. Se
  // só arrancasse ao abrir o painel, os passos que interessam — os que levaram
  // ao problema — já teriam passado.
  useEffect(() => {
    instalarRecolha();
  }, []);

  useEffect(() => {
    registarPasso("rota", pathname);
  }, [pathname]);

  // Escape fecha, como em todo o resto do painel.
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto]);

  async function enviar() {
    if (enviando) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/reporte", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          categoria: categoria || "OUTRO",
          bloqueado,
          descricao,
          url: window.location.href,
          origem: "BOTAO",
          ...recolher(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; repetido?: boolean; error?: string };
      if (data.ok) {
        // As duas dizem o mesmo à cabeça, porque as duas são um sucesso: o
        // reporte ficou registado. A segunda só acrescenta que já lá estava —
        // saber isso é útil, mas não pode parecer que a coisa não pegou.
        toast.push(
          "success",
          data.repetido
            ? "Problema reportado com sucesso — já o tínhamos registado e ficou com mais uma ocorrência."
            : "Problema reportado com sucesso",
        );
        setAberto(false);
        setCategoria("");
        setBloqueado(false);
        setDescricao("");
      } else {
        toast.push("error", data.error ?? "não foi possível enviar o reporte");
      }
    } catch {
      toast.push("error", "sem ligação — o reporte não saiu");
    } finally {
      setEnviando(false);
    }
  }

  const escolhida = CATEGORIAS.find((c) => c.v === categoria);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Reportar um problema"
        title="Reportar um problema"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e0736b]/60 text-[#e0736b] transition-colors hover:border-[#e0736b] hover:bg-[#e0736b]/10"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5.5" />
          <circle cx="12" cy="16.4" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reportar um problema"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 pt-[8vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAberto(false);
          }}
        >
          <div className="painel-card w-full max-w-lg p-6">
            <p className="text-[0.55rem] font-semibold tracking-[0.12em] text-gold uppercase">Ajuda</p>
            <h2 className="mt-1.5 font-serif text-2xl text-ink">Reportar um problema</h2>
            <p className="mt-1.5 text-sm text-muted">
              Escolhe o que se parece com o que aconteceu. Os detalhes técnicos vão junto
              automaticamente — não precisas de os saber.
            </p>

            <fieldset className="mt-5">
              <legend className="text-[0.55rem] font-semibold tracking-[0.12em] text-muted uppercase">
                O que aconteceu
              </legend>
              <div className="mt-2 space-y-1.5">
                {CATEGORIAS.map((c) => (
                  <label
                    key={c.v}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                      categoria === c.v
                        ? "border-gold bg-gold/5 text-ink"
                        : "border-line text-muted hover:border-gold/50 hover:text-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="categoria"
                      value={c.v}
                      checked={categoria === c.v}
                      onChange={() => setCategoria(c.v)}
                      className="accent-[color:var(--gold)]"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={bloqueado}
                onChange={(e) => setBloqueado(e.target.checked)}
                className="accent-[color:var(--gold)]"
              />
              Estou bloqueado — não consigo continuar o que estava a fazer
            </label>

            {/* A caixa só abre depois de haver escolha. Um campo de texto vazio
                logo à partida é um campo que se salta; um que aparece a seguir a
                uma escolha, com a pergunta certa por cima, pede resposta. */}
            {escolhida && (
              <label key={escolhida.v} className="card-in mt-4 block">
                {/* Pergunta em caixa normal, e não a etiqueta minúscula em
                    maiúsculas do resto do formulário: uma pergunta legível
                    responde-se, uma etiqueta de campo salta-se. */}
                <span className="block text-[0.82rem] text-ink">
                  {escolhida.dica}
                </span>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  placeholder={escolhida.exemplo}
                  className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </label>
            )}

            <p className="mt-3 text-[0.68rem] leading-relaxed text-muted">
              Vão anexados: a página onde estás, os teus últimos passos, os erros que o
              computador registou e a versão do site. <strong>Não vão dados de clientes.</strong>
            </p>

            {/* Um botão apagado sem explicação lê-se como avaria. Se falta o
                que escrever, o formulário di-lo por palavras. */}
            {categoria && descricao.trim().length < 3 && (
              <p className="mt-2 text-[0.7rem] text-muted">
                Escreve o que aconteceu para poderes enviar — nem que seja uma linha.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-full border border-line px-4 py-2 text-[0.72rem] font-medium tracking-[0.12em] text-muted uppercase transition-colors hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={enviar}
                disabled={enviando || !categoria || descricao.trim().length < 3}
                className="rounded-full bg-ink px-5 py-2 text-[0.72rem] font-medium tracking-[0.12em] text-cream uppercase transition-opacity disabled:opacity-40"
              >
                {enviando ? "A enviar…" : "Reportar problema"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
