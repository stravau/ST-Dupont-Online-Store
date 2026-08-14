"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const AUTO_MS = 5000; // avança um cartão de 5 em 5s
const PAUSE_MS = 10_000; // depois de um toque/seta, fica quieto 10s

// Carril de produtos com rotação automática.
//
// Assenta em SCROLL NATIVO (overflow-x + scroll-snap) e não em `transform`:
// é o que dá arrasto lateral no telemóvel sem roubar o scroll vertical à
// página — o browser trata dos dois eixos. Com transform era preciso apanhar
// os eventos de toque à mão e qualquer gesto na diagonal prendia a página.
//
// O ciclo é infinito nos dois sentidos: a lista é triplicada e, quando o
// scroll entra numa das cópias exteriores, reposicionamo-lo no ponto idêntico
// da cópia do meio com o scroll suave desligado — o salto não se vê.
export function LatestCarousel({
  items,
  prevLabel,
  nextLabel,
}: {
  items: ReactNode[];
  prevLabel: string;
  nextLabel: string;
}) {
  const n = items.length;
  const [visible, setVisible] = useState(4);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const reduced = useRef(false);
  const alinhado = useRef(false); // já centrámos na cópia do meio?

  // 1 / 2 / 3 / 4 cartões por vista.
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setVisible(w < 640 ? 1 : w < 768 ? 2 : w < 1024 ? 3 : 4);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const canRotate = n > visible;

  // Largura de uma cópia da lista (= largura de um cartão × n).
  const larguraCopia = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    return el.scrollWidth / 3;
  }, []);

  // Arrancar no início da cópia do meio.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !canRotate || alinhado.current) return;
    const copia = larguraCopia();
    if (copia <= 0) return;
    el.scrollLeft = copia;
    alinhado.current = true;
  }, [canRotate, larguraCopia, visible]);

  // Manter o scroll dentro da cópia do meio — sem isto chegava-se ao fim.
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !canRotate) return;
    const copia = larguraCopia();
    if (copia <= 0) return;
    const x = el.scrollLeft;
    if (x < copia * 0.5 || x > copia * 1.5) {
      const anterior = el.style.scrollBehavior;
      el.style.scrollBehavior = "auto"; // o reposicionamento não pode animar
      el.scrollLeft = x < copia * 0.5 ? x + copia : x - copia;
      el.style.scrollBehavior = anterior;
    }
  }, [canRotate, larguraCopia]);

  const go = useCallback(
    (dir: number, manual: boolean) => {
      const el = trackRef.current;
      if (!el || !canRotate) return;
      if (manual) pausedUntil.current = Date.now() + PAUSE_MS;
      const card = el.clientWidth / visible;
      el.scrollBy({ left: dir * card, behavior: reduced.current ? "auto" : "smooth" });
    },
    [canRotate, visible],
  );

  // Avanço automático. Pausa enquanto o dedo/rato está em cima, para o cartão
  // não fugir enquanto se olha para ele.
  useEffect(() => {
    if (!canRotate || reduced.current) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      go(1, false);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [canRotate, go]);

  if (n === 0) return null;

  const belt = canRotate ? [...items, ...items, ...items] : items;
  const basis = 100 / visible;
  const arrow =
    "absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center " +
    "rounded-full border border-line bg-cream/90 text-ink shadow-sm backdrop-blur " +
    "transition-colors hover:border-gold hover:text-gold focus-visible:border-gold " +
    "h-11 w-11 lg:flex";

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        onPointerEnter={() => { pausedUntil.current = Date.now() + PAUSE_MS; }}
        onTouchStart={() => { pausedUntil.current = Date.now() + PAUSE_MS; }}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {belt.map((node, i) => (
          <div
            key={i}
            className="shrink-0 snap-start px-2.5 sm:px-3.5 lg:px-4"
            style={{ flexBasis: `${basis}%`, maxWidth: `${basis}%` }}
          >
            {node}
          </div>
        ))}
      </div>

      {canRotate && (
        <>
          <button
            type="button"
            aria-label={prevLabel}
            onClick={() => go(-1, true)}
            className={`${arrow} -left-2 lg:-left-5`}
          >
            <span aria-hidden className="-mt-0.5 text-xl leading-none">‹</span>
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={() => go(1, true)}
            className={`${arrow} -right-2 lg:-right-5`}
          >
            <span aria-hidden className="-mt-0.5 text-xl leading-none">›</span>
          </button>
        </>
      )}
    </div>
  );
}
