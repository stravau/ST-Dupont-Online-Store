"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, TransitionEvent } from "react";

const AUTO_MS = 5000; // advance one item every 5s
const PAUSE_MS = 10_000; // after a manual arrow click, hold still for 10s

// Auto-rotating product rail. Shows N cards at once (responsive), advances one
// card every 5s, and offers prev/next arrows. Clicking an arrow pauses the
// auto-advance for 10s so a card never appears to "run away" under the cursor.
//
// The loop is seamless in BOTH directions: the belt is the item list tripled,
// and the visible index is kept inside the middle copy — when a slide finishes
// on an outer copy we reposition (with animation off) to the identical spot in
// the middle copy, so the jump is invisible.
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
  const [index, setIndex] = useState(n); // start on the middle copy
  const [animate, setAnimate] = useState(false);
  const pausedUntil = useRef(0);
  const reduced = useRef(false);

  // Responsive: 1 / 2 / 3 / 4 cards per view.
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

  // Re-enable the transition on the frame after an animation-off reposition.
  useEffect(() => {
    if (animate) return;
    const r = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(r);
  }, [animate]);

  const go = useCallback(
    (dir: number, manual: boolean) => {
      if (!canRotate) return;
      if (manual) pausedUntil.current = Date.now() + PAUSE_MS;
      setAnimate(true);
      setIndex((i) => i + dir);
    },
    [canRotate],
  );

  // Auto-advance (skipped under prefers-reduced-motion or while paused).
  useEffect(() => {
    if (!canRotate || reduced.current) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setAnimate(true);
      setIndex((i) => i + 1);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [canRotate]);

  // Seamless wrap — keep the index inside the middle copy [n, 2n).
  const onEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
      setIndex((i) => {
        if (i >= 2 * n) {
          setAnimate(false);
          return i - n;
        }
        if (i < n) {
          setAnimate(false);
          return i + n;
        }
        return i;
      });
    },
    [n],
  );

  if (n === 0) return null;

  const belt = canRotate ? [...items, ...items, ...items] : items;
  const pos = canRotate ? index : 0;
  const basis = 100 / visible; // one card = basis% of the viewport width
  const arrow =
    "absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center " +
    "rounded-full border border-line bg-cream/90 text-ink shadow-sm backdrop-blur " +
    "transition-colors hover:border-gold hover:text-gold focus-visible:border-gold " +
    "h-11 w-11 lg:flex";

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(-${pos * basis}%)`,
            transition: animate ? "transform 600ms cubic-bezier(0.4,0,0.2,1)" : "none",
          }}
          onTransitionEnd={onEnd}
        >
          {belt.map((node, i) => (
            <div
              key={i}
              className="shrink-0 px-2.5 sm:px-3.5 lg:px-4"
              style={{ flexBasis: `${basis}%`, maxWidth: `${basis}%` }}
            >
              {node}
            </div>
          ))}
        </div>
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
