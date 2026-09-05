"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// One observer per page: finds every `.reveal` element and TOGGLES
// `.is-visible` based on intersection — so the entry animation replays
// each time an element scrolls back into view (up or down), not just on
// first reveal.
//
// EXCEPÇÃO: um carril horizontal revela-se todo de uma vez, quando o primeiro
// dos seus cartões chega ao ecrã, e nunca mais volta a ser observado. Ver
// `carrilDe` mais abaixo.
//
// A `loading.tsx` Suspense boundary means the page content can stream into
// the DOM AFTER this effect first runs (the pathname flips while the loading
// fallback — which has no `.reveal` nodes — is still on screen). If we only
// queried once, that late content would stay stuck at `opacity: 0`. So we also
// watch the tree with a MutationObserver and observe any `.reveal` node as it
// arrives. `.reveal` elements are hidden until revealed, so this is what makes
// a page visible at all after a client-side navigation.
export function RevealRoot() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Dentro de um carril horizontal a revelação é de UMA VEZ SÓ.
    //
    // O alternar existe para o scroll vertical da página, onde é raro e
    // intencional. Num carrossel os cartões atravessam a borda lateral do
    // ecrã a toda a hora — a arrastar com o dedo, e sozinhos de 5 em 5
    // segundos com a rotação automática. A classe entrava e saía sem parar e
    // a transição de 0,8s recomeçava a meio: era isso que se via a piscar.
    //
    // Detectado pela árvore e não por uma marca posta à mão em cada carril:
    // um carril esquecido volta a piscar, e hoje já se viu o que acontece a
    // uma correcção aplicada num sítio e esquecida nos outros.
    // Devolve o carril que contém o elemento, ou null.
    const carrilDe = (el: Element): Element | null => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        if (p.scrollWidth > p.clientWidth + 1) {
          const ox = getComputedStyle(p).overflowX;
          if (ox === "auto" || ox === "scroll") return p;
        }
      }
      return null;
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // Promote to GPU layer just for the duration of the
            // transition (.is-revealing in CSS), then drop it on
            // arrival (.is-visible resets will-change: auto) so we
            // don't keep dozens of compositor layers alive at rest.
            e.target.classList.add("is-revealing");
            e.target.classList.add("is-visible");
            // Num carril, o primeiro cartão a chegar ao ecrã revela o carril
            // INTEIRO e larga-o. Revelar cada cartão à medida que ele cruza a
            // borda lateral parece bem a arrastar devagar, mas a arrastar
            // depressa são fades de 0,8s a dispararem em fila — que é o que se
            // via a piscar. Um carril é uma unidade: chega ao ecrã, está lá
            // todo.
            const carril = carrilDe(e.target);
            if (carril) {
              for (const alvo of carril.querySelectorAll(".reveal")) {
                alvo.classList.add("is-revealing");
                alvo.classList.add("is-visible");
                io.unobserve(alvo);
              }
            }
          } else {
            e.target.classList.remove("is-visible");
            e.target.classList.remove("is-revealing");
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const observed = new WeakSet<Element>();
    const scan = () => {
      for (const el of document.querySelectorAll<HTMLElement>(".reveal")) {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      }
    };

    scan();
    // Content streamed in after this effect (Suspense/loading.tsx) is caught
    // here so its `.reveal` nodes get observed and revealed.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);
  return null;
}
