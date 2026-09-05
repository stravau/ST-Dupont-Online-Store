"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Exposes the header's transparent state to descendants (MobileNav, Logo,
// utility icons) so they can pick explicit cream-vs-ink colours instead of
// relying on the CSS cascade to override Tailwind's text-ink utilities — a
// fight we kept losing on certain browsers / Safari builds.
const HeaderTransparentContext = createContext(false);
export function useHeaderTransparent() {
  return useContext(HeaderTransparentContext);
}

// Scroll-aware wrapper for the site header. Fica transparente em dois casos,
// e volta ao cream/95 em todos os outros:
//
//   1. no topo da homepage, enquanto o vídeo do herói está atrás dela;
//   2. sempre que passa por cima de uma faixa marcada com
//      `data-topo-transparente` — hoje é a dos Destaques, com a geoda.
//
// O segundo caso é declarado pela secção e não conhecido pelo cabeçalho: a
// próxima faixa escura que aparecer só tem de pôr o atributo, e isto passa a
// valer para ela sem se mexer aqui.
//
// A decisão é tomada pela LINHA MÉDIA da barra, e por medida dos elementos
// (getBoundingClientRect) e não por contas com scrollY: o body tem zoom 0.9,
// e comparar dois rectângulos no mesmo espaço visual é imune a isso.
//
// Hover behaviour: while the header is in its transparent state, hovering
// anywhere on it temporarily flips it to the opaque cream backdrop (and the
// text + logo follow, because the React context value flips too). Mouse-leave
// brings it back. Touch devices don't fire hover so the default transparent
// look stays on mobile.
export function HeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/pt" || pathname === "/en";
  const [transparent, setTransparent] = useState(isHome);
  // Separado do `transparent` porque as duas situações não se parecem: por
  // cima do vídeo do topo a barra desaparece por completo, por cima de uma
  // faixa escura fica um véu de creme a 30% — vê-se a imagem através dela,
  // mas há barra. O texto é creme nos dois casos, que é o que os une.
  const [emFaixa, setEmFaixa] = useState(false);
  const [hovered, setHovered] = useState(false);
  const barra = useRef<HTMLElement>(null);

  useEffect(() => {
    let pendente = false;

    const medir = () => {
      pendente = false;
      // A lista das faixas é lida A CADA MEDIÇÃO e não uma vez no arranque.
      // Há um loading.tsx nesta rota, portanto a página entra dentro de um
      // Suspense: quando este efeito corre pela primeira vez, o cabeçalho já
      // montou mas o conteúdo real ainda não chegou ao DOM. Guardar a lista
      // aqui dava sempre vazia, e a barra nunca sabia que havia uma faixa
      // escura por baixo — só ficava transparente sobre o vídeo do topo.
      const faixas = document.querySelectorAll<HTMLElement>("[data-topo-transparente]");
      const noHeroi = isHome && window.scrollY < window.innerHeight - 120;
      // A meio da barra: é o que está atrás desse ponto que decide. Usar a
      // linha média em vez de uma das bordas dá o mesmo comportamento à
      // entrada e à saída, e é onde o texto do menu assenta — que é o que
      // tem de continuar legível quando a cor troca.
      const meio = (barra.current?.getBoundingClientRect().height ?? 0) / 2;
      let sobreFaixa = false;
      for (const f of faixas) {
        const r = f.getBoundingClientRect();
        if (r.top < meio && r.bottom > meio) {
          sobreFaixa = true;
          break;
        }
      }
      setTransparent(noHeroi || sobreFaixa);
      setEmFaixa(sobreFaixa);
    };

    // Uma medição por frame, não uma por evento de scroll.
    const agendar = () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar, { passive: true });
    // E quando a altura do documento muda — que é exactamente o que acontece
    // quando o conteúdo em streaming substitui o esqueleto, ou quando uma
    // imagem acaba de carregar. Sem isto, uma página aberta já a meio do
    // scroll ficava com a cor errada até alguém lhe tocar.
    const observador = new ResizeObserver(agendar);
    observador.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      observador.disconnect();
    };
  }, [isHome, pathname]);

  // Effective state — transparency only when the user isn't hovering the
  // chrome. The context, data attribute, bg class and CSS rules all flow
  // from this one value, so logo, text and bg flip together.
  const effective = transparent && !hovered;
  const comVeu = emFaixa && !hovered;

  return (
    <HeaderTransparentContext.Provider value={effective}>
      <header
        ref={barra}
        // Pointer events instead of mouse events so we can filter out
        // touch — otherwise tapping the hamburger on mobile fires a
        // synthetic mouseenter, the header flips to opaque cream, and
        // when the menu closes the user is left looking at a white bar
        // instead of the video again.
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setHovered(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setHovered(false);
        }}
        data-transparent={effective}
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          effective
            ? comVeu
              ? "bg-cream/30 backdrop-blur"
              : "bg-transparent"
            : "bg-cream/95 backdrop-blur"
        }`}
      >
        {children}
      </header>
    </HeaderTransparentContext.Provider>
  );
}
