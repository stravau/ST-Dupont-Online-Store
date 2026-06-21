"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Tone = "info" | "success" | "error";
interface ToastItem { id: string; tone: Tone; text: string }

interface Ctx { push: (tone: Tone, text: string) => void }
const ToastCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("useToast outside ToastProvider");
  return c;
}

// Lightweight toast stack — appended on push(), auto-removes after
// ~2.4s. No animation library, no portal. Lives bottom-right.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((tone: Tone, text: string) => {
    const id = `${performance.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setItems((prev) => [...prev, { id, tone, text }]);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const t = setTimeout(() => setItems((prev) => prev.slice(1)), 2400);
    return () => clearTimeout(t);
  }, [items]);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col gap-2">
        {items.map((t) => {
          const tone =
            t.tone === "success" ? "border-[#2bb673]/40 bg-white text-[#1f7a4d]" :
            t.tone === "error"   ? "border-red-300 bg-white text-red-900" :
                                    "border-line bg-white text-ink";
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className={`pointer-events-auto min-w-[16rem] border ${tone} px-4 py-3 text-xs tracking-[0.14em] uppercase shadow-[0_10px_30px_-15px_rgba(6,16,32,0.35)] motion-safe:animate-[fadeIn_180ms_ease-out]`}
            >
              {t.text}
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
