"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { haEsqueleto, ouvirEsqueletos } from "@/components/esqueleto-activo";

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
// COMO SABE QUANDO ACABA: a rota é condição necessária, não suficiente. No
// storefront há um loading.tsx na raiz do /[lang], e por isso o App Router
// confirma o URL logo que tem o ESQUELETO para mostrar — muito antes do
// conteúdo real. Terminar aí apagava a barra ao primeiro terço do caminho.
// Portanto espera-se pelas duas coisas: a rota ter mudado E não haver nenhum
// esqueleto no ecrã. Quem sabe a segunda são os próprios loading.tsx, que
// montam um marcador (components/esqueleto-activo) cujo desmontar é o
// instante exacto em que o conteúdo os substitui.
//
// No /admin não há um único loading.tsx, portanto lá a contagem é sempre zero
// e o sinal é só a rota — que é o certo, porque sem esqueleto a rota só muda
// quando a página está mesmo pronta.
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
  const confirmacao = useRef<number | null>(null);

  const limpar = useCallback(() => {
    for (const r of [atraso, passo, seguranca, confirmacao]) {
      if (r.current !== null) window.clearTimeout(r.current);
      r.current = null;
    }
    for (const t of saida.current) window.clearTimeout(t);
    saida.current = [];
  }, []);

  // A rota já chegou nesta navegação? Sozinha não chega para terminar — falta
  // o conteúdo real substituir o esqueleto.
  const rotaChegou = useRef(false);

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

  // As duas condições juntas — rota chegada E ecrã sem esqueleto — verificadas
  // um instante DEPOIS do sinal que as desencadeou. O adiamento não é
  // cosmético; sem ele nada disto funciona, por duas razões independentes:
  //
  //  1. Esta barra vive no layout de raiz, antes do {children}, e o React corre
  //     os efeitos pela ordem da árvore. O efeito dela corre ANTES de o
  //     marcador do esqueleto chegar a montar, portanto uma verificação
  //     imediata vê sempre zero esqueletos e termina à mesma — que foi
  //     exactamente o que se mediu antes disto existir: a barra apagada aos
  //     764ms com o esqueleto no ecrã até aos 6103ms.
  //  2. Em desenvolvimento o StrictMode monta, desmonta e volta a montar cada
  //     efeito, e a contagem passa por zero a meio dessa dança.
  //
  // Um só temporizador, reiniciado a cada sinal: sinais em rajada resolvem-se
  // numa verificação só, a última, que é a que tem o estado verdadeiro.
  const verificar = useCallback(() => {
    if (confirmacao.current !== null) window.clearTimeout(confirmacao.current);
    confirmacao.current = window.setTimeout(() => {
      confirmacao.current = null;
      if (!aCarregar.current || !rotaChegou.current) return;
      if (haEsqueleto()) return;
      terminar();
    }, 60);
  }, [terminar]);

  const arrancar = useCallback(() => {
    if (aCarregar.current) return;
    aCarregar.current = true;
    rotaChegou.current = false;
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

  // A rota mudou. Metade do sinal: pode ainda estar só o esqueleto no ecrã.
  useEffect(() => {
    rotaChegou.current = true;
    verificar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search?.toString()]);

  // A outra metade: um esqueleto entrou ou saiu de cena.
  useEffect(() => ouvirEsqueletos(verificar), [verificar]);

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
