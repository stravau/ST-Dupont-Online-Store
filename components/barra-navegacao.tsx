"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Fio dourado no topo do ecrã enquanto uma página está a ser carregada.
//
// PORQUE EXISTE: o admin não tem um único loading.tsx e todas as páginas são
// force-dynamic contra a Neon. Entre clicar em "Stock" e a tabela aparecer
// passa-se quase um segundo em que o ecrã fica exactamente na mesma — nada
// pisca, nada se move — e a reacção natural é clicar outra vez. A barra é a
// única coisa que diz "já te ouvi".
//
// COMO SABE QUANDO COMECA: à custa do clique, não da rota. O App Router só
// muda o pathname DEPOIS de a página nova estar pronta, ou seja exactamente
// no fim da espera que queremos mostrar. Portanto ouve-se o clique em fase de
// captura (antes de o Link o tratar) e é daí que arranca.
//
// COMO SABE QUANDO ACABA: aí sim, da rota — pathname + query. É o sinal de
// que o servidor respondeu e o React já pintou.
//
// Cobre navegação, que é onde está o vazio. Os formulários do painel (gravar
// um preço, registar uma venda) já têm o seu próprio estado de espera dentro
// do botão que se carregou, que é onde faz sentido vê-lo.

// A maior parte das navegações resolve-se em menos de um décimo de segundo, e
// uma barra a piscar em todas elas é ruído, não informação. Só aparece quando
// a espera já se nota.
const ATRASO_MS = 120;
// Rede de segurança. Se uma navegação nunca concluir — erro no servidor, o
// utilizador a carregar noutra coisa a meio — a barra sai à mesma em vez de
// ficar encalhada nos 90%.
const SEGURANCA_MS = 15000;

function Barra() {
  const pathname = usePathname();
  const search = useSearchParams();

  const [pct, setPct] = useState(0);
  const [visivel, setVisivel] = useState(false);

  // Refs e não estado: isto é lido dentro de listeners e temporizadores, que
  // ficam presos ao render em que foram criados e veriam sempre o valor
  // inicial.
  const aCarregar = useRef(false);
  const atraso = useRef<number | null>(null);
  const passo = useRef<number | null>(null);
  const seguranca = useRef<number | null>(null);
  const saida = useRef<number[]>([]);

  const limpar = useCallback(() => {
    for (const r of [atraso, passo, seguranca]) {
      if (r.current !== null) window.clearTimeout(r.current);
      r.current = null;
    }
    for (const t of saida.current) window.clearTimeout(t);
    saida.current = [];
  }, []);

  const terminar = useCallback(() => {
    if (!aCarregar.current) return;
    aCarregar.current = false;
    limpar();
    setPct(100);
    // Deixa o fio chegar ao fim antes de se apagar, senão desaparece a meio
    // do caminho e lê-se como uma falha em vez de uma conclusão.
    saida.current.push(window.setTimeout(() => setVisivel(false), 200));
    saida.current.push(window.setTimeout(() => setPct(0), 480));
  }, [limpar]);

  const arrancar = useCallback(() => {
    if (aCarregar.current) return;
    aCarregar.current = true;
    limpar();
    setPct(0);
    atraso.current = window.setTimeout(() => {
      if (!aCarregar.current) return;
      setVisivel(true);
      // Avanço a abrandar, que nunca chega ao fim sozinho: o fim é a página
      // nova a aparecer, e chegar aos 100% antes disso era prometer uma coisa
      // que ainda não aconteceu. Trava nos 90%.
      const avancar = () => {
        if (!aCarregar.current) return;
        setPct((p) => (p >= 90 ? p : p + Math.max(0.5, (90 - p) / 14)));
        passo.current = window.setTimeout(avancar, 110);
      };
      avancar();
    }, ATRASO_MS);
    seguranca.current = window.setTimeout(() => {
      aCarregar.current = false;
      limpar();
      setVisivel(false);
      setPct(0);
    }, SEGURANCA_MS);
  }, [limpar]);

  // O clique que ARRANCA. Em fase de captura, para chegar antes do Link.
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      // Já tratado por outra coisa, ou não é o clique que navega nesta janela:
      // o botão do meio, o ctrl/cmd e o shift abrem separador ou janela nova e
      // esta página não vai a lado nenhum.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const alvo = e.target as Element | null;
      const a = alvo?.closest?.("a");
      if (!a) return;
      // getAttribute e não .target: num <a> dentro de SVG a propriedade é um
      // SVGAnimatedString e a comparação com "_self" nunca daria certo.
      const janela = a.getAttribute("target");
      if (janela && janela !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (!a.getAttribute("href")) return;

      let destino: URL;
      try {
        destino = new URL((a as HTMLAnchorElement).href, window.location.href);
      } catch {
        return;
      }
      // Sair do site é o browser a tratar, com o indicador dele.
      if (destino.origin !== window.location.origin) return;
      // Só a âncora a mudar não é navegação nenhuma — não há nada a carregar,
      // e a barra apareceria sem nunca ter um fim que a mandasse embora.
      if (
        destino.pathname === window.location.pathname &&
        destino.search === window.location.search
      ) {
        return;
      }
      arrancar();
    };

    // Voltar e avançar no browser também carregam uma página.
    const aoVoltar = () => arrancar();

    document.addEventListener("click", aoClicar, true);
    window.addEventListener("popstate", aoVoltar);
    return () => {
      document.removeEventListener("click", aoClicar, true);
      window.removeEventListener("popstate", aoVoltar);
    };
  }, [arrancar]);

  // A rota MUDOU: a página nova chegou. É o único fim honesto.
  useEffect(() => {
    terminar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search?.toString()]);

  // Desmontar sem deixar temporizadores a correr.
  useEffect(() => limpar, [limpar]);

  return (
    <div
      // Decorativa: o App Router já anuncia a mudança de página a quem usa
      // leitor de ecrã, e um segundo anúncio a cada clique seria estorvo.
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px]"
      style={{ opacity: visivel ? 1 : 0, transition: "opacity 220ms ease-out" }}
    >
      <div
        className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-glow"
        style={{
          width: `${pct}%`,
          transition: "width 180ms ease-out",
          boxShadow: "0 0 8px var(--gold-glow), 0 0 2px var(--gold)",
        }}
      />
    </div>
  );
}

export function BarraNavegacao() {
  // useSearchParams obriga a fronteira de Suspense: sem ela, as rotas que o
  // Next pré-renderiza estaticamente caíam todas para render no cliente só
  // por causa desta barra.
  return (
    <Suspense fallback={null}>
      <Barra />
    </Suspense>
  );
}
