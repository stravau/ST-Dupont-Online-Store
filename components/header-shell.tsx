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
  const [hovered, setHovered] = useState(false);
  const barra = useRef<HTMLElement>(null);

  useEffect(() => {
    const faixas = Array.from(
      document.querySelectorAll<HTMLElement>("[data-topo-transparente]"),
    );
    // Sem herói e sem faixas escuras não há nada a observar — não vale um
    // listener de scroll em todas as páginas do site.
    if (!isHome && faixas.length === 0) {
      queueMicrotask(() => setTransparent(false));
      return;
    }
    const onScroll = () => {
      // Start opaque once we've left the hero — give a small buffer so the
      // swap doesn't happen the moment a finger touches the trackpad.
      const noHeroi = isHome && window.scrollY < window.innerHeight - 120;
      // A meio da barra: é o que está atrás desse ponto que decide. Usar a
      // linha média em vez de qualquer das bordas dá o mesmo comportamento à
      // entrada e à saída da faixa, sem o meio-termo em que metade da barra
      // está sobre a imagem e a outra metade sobre o creme.
      const meio = (barra.current?.getBoundingClientRect().height ?? 0) / 2;
      const sobreFaixa = faixas.some((f) => {
        const r = f.getBoundingClientRect();
        return r.top < meio && r.bottom > meio;
      });
      setTransparent(noHeroi || sobreFaixa);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome, pathname]);

  // Effective state — transparency only when the user isn't hovering the
  // chrome. The context, data attribute, bg class and CSS rules all flow
  // from this one value, so logo, text and bg flip together.
  const effective = transparent && !hovered;

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
          effective ? "bg-transparent" : "bg-cream/95 backdrop-blur"
        }`}
      >
        {children}
      </header>
    </HeaderTransparentContext.Provider>
  );
}
