"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Tone = "info" | "success" | "error";
interface ToastItem { id: string; tone: Tone; text: string }

interface Ctx { push: (tone: Tone, text: string) => void }
const ToastCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("useToast outside ToastProvider");
  return c;
}

const TOAST_TTL_MS = 3500;

// Lightweight toast stack — appended on push(), each item auto-removes
// after its own TTL. Previously a single `setTimeout` keyed on the
// whole list drained one item every 2.4s regardless of when it was
// pushed, so a burst of 5 toasts would leave the last one on screen
// for 12s. Now each toast carries its own timer (cleared on unmount).
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeItem = useCallback((id: string) => {
    const handle = timers.current.get(id);
    if (handle) {
      clearTimeout(handle);
      timers.current.delete(id);
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((tone: Tone, text: string) => {
    const id = `${performance.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setItems((prev) => [...prev, { id, tone, text }]);
    const handle = setTimeout(() => removeItem(id), TOAST_TTL_MS);
    timers.current.set(id, handle);
  }, [removeItem]);

  // Clear any remaining timers when the provider unmounts so we don't
  // leak setTimeout handles in dev with hot reload.
  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const t of map.values()) clearTimeout(t);
      map.clear();
    };
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col gap-2">
        {items.map((t) => {
          const tone =
            t.tone === "success" ? "border-[#2bb673]/40 bg-white text-[#155f3a]" :
            t.tone === "error"   ? "border-red-300 bg-white text-red-900" :
                                    "border-line bg-white text-ink";
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => removeItem(t.id)}
              role="status"
              aria-live="polite"
              aria-label="Fechar notificação"
              className={`pointer-events-auto min-w-[16rem] cursor-pointer border ${tone} px-4 py-3 text-left text-xs tracking-[0.14em] uppercase shadow-[0_10px_30px_-15px_rgba(6,16,32,0.35)] motion-safe:animate-[fadeIn_180ms_ease-out] hover:opacity-80`}
            >
              {t.text}
            </button>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
