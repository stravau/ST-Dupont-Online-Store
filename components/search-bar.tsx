"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ProductMedia } from "@/components/product-media";

interface Hit {
  slug: string;
  name: string;
  collection: string;
  image: string | null;
  price: string;
}

export interface SearchStrings {
  placeholder: string;
  title: string;
  start: string;
  searching: string;
  noResults: string;
  viewAll: string;
}

export function SearchBar({ lang, t }: { lang: string; t: SearchStrings }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  // Portal the dropdown to document.body so it escapes the transparent
  // header's CSS cascade (the rule that forces every descendant's
  // text-ink to cream while the chrome is over the video kept rendering
  // the input + hit titles invisible until the user hovered the navbar).
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    // Restore the last few queries the user committed in this browser.
    // Best-effort — private mode / quota errors are swallowed.
    try {
      const raw = window.localStorage.getItem("std:search:recent");
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setRecent(parsed.filter((x): x is string => typeof x === "string").slice(0, 5));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Push the current query onto the recent stack — called from
  // navigate() when the user actually commits to a result or the
  // full-search page (typing alone doesn't count).
  const rememberRecent = useCallback((query: string) => {
    const norm = query.trim();
    if (norm.length < 2) return;
    setRecent((prev) => {
      const next = [norm, ...prev.filter((x) => x.toLowerCase() !== norm.toLowerCase())].slice(0, 5);
      try {
        window.localStorage.setItem("std:search:recent", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  const navigate = useCallback(
    (url: string) => {
      router.push(url);
      close();
    },
    [router, close],
  );

  // Focus input when opening.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Outside click + Esc. With the dropdown portaled to document.body, the
  // panel sits outside rootRef in the DOM — check both refs before
  // closing so a click inside the dropdown doesn't dismiss it.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Debounced suggestions. All state updates happen inside the async
  // callback (never synchronously in the effect body).
  useEffect(() => {
    // Strip combining diacritics before measuring length so a query
    // of pure accents (e.g. "´´" or "áé") doesn't fire a fetch that
    // can only ever return zero hits and read as "no results" — the
    // backend does the same normalisation, so meaningful length is
    // what matters.
    const meaningful = q
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
    const query = q.trim();
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      if (meaningful.length < 2) {
        setHits([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&lang=${lang}`,
          { signal: ctrl.signal },
        );
        const data = await res.json();
        setHits(data.results ?? []);
        setTotal(data.total ?? 0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q, lang]);

  function goToSearch() {
    const term = q.trim();
    if (term) {
      rememberRecent(term);
      navigate(`/${lang}/pesquisa?q=${encodeURIComponent(term)}`);
    }
  }

  function pickRecent(term: string) {
    setQ(term);
    rememberRecent(term);
    navigate(`/${lang}/pesquisa?q=${encodeURIComponent(term)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && hits[active]) {
        rememberRecent(q);
        navigate(`/${lang}/p/${hits[active].slug}`);
      } else {
        goToSearch();
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t.title}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="block text-ink transition-colors hover:text-gold"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
      </button>

      {open && mounted &&
        // Portal to document.body so the dropdown escapes the header's
        // data-transparent CSS cascade. Inline-styled colours (rather
        // than text-ink/text-muted classes) so the text stays readable
        // regardless of any descendant rules that target the header.
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t.title}
            className="fixed left-1/2 top-[5.25rem] z-[70] isolate w-[min(92vw,30rem)] -translate-x-1/2 origin-top transform-gpu border border-line bg-cream shadow-[0_30px_70px_-30px_rgba(6,16,32,0.55)] motion-safe:animate-[fadeIn_180ms_ease-out] sm:left-auto sm:right-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))] sm:translate-x-0 sm:origin-top-right"
            style={{ color: "var(--ink)" }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="shrink-0"
                style={{ color: "var(--gold)" }}
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(-1);
                }}
                onKeyDown={onKeyDown}
                placeholder={t.placeholder}
                aria-label={t.title}
                className="w-full bg-transparent text-sm tracking-wide placeholder:text-muted focus:outline-none"
                style={{ color: "var(--ink)" }}
              />
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto">
              {q.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().length < 2 ? (
                recent.length > 0 ? (
                  <div className="px-5 py-5">
                    <p className="overline text-[0.55rem]" style={{ color: "var(--muted)" }}>
                      {t.start}
                    </p>
                    <ul className="mt-3 flex flex-col gap-1">
                      {recent.map((r) => (
                        <li key={r}>
                          <button
                            type="button"
                            onClick={() => pickRecent(r)}
                            className="flex w-full items-center gap-2 py-1.5 text-left text-sm transition-colors hover:text-gold"
                            style={{ color: "var(--ink)" }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: "var(--muted)" }}>
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 2" strokeLinecap="round" />
                            </svg>
                            {r}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p role="status" aria-live="polite" className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
                    {t.start}
                  </p>
                )
              ) : loading ? (
                <p role="status" aria-live="polite" className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
                  {t.searching}
                </p>
              ) : hits.length === 0 ? (
                <p role="status" aria-live="polite" className="px-5 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
                  {t.noResults}
                </p>
              ) : (
                <ul role="listbox">
                  {hits.map((h, i) => (
                    <li key={h.slug}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => { rememberRecent(q); navigate(`/${lang}/p/${h.slug}`); }}
                        className={`flex w-full items-center gap-4 px-5 py-3 text-left transition-colors ${
                          active === i ? "bg-cream" : "hover:bg-cream"
                        }`}
                      >
                        <span className="h-14 w-12 shrink-0 overflow-hidden border border-line">
                          <ProductMedia
                            image={h.image}
                            seed={h.slug}
                            label={h.name}
                            className="h-full w-full"
                            sizes="48px"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="overline block text-[0.55rem]" style={{ color: "var(--muted)" }}>
                            {h.collection}
                          </span>
                          <span
                            className="mt-1 block truncate font-serif text-base"
                            style={{ color: "var(--ink)" }}
                          >
                            {h.name}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm" style={{ color: "var(--muted)" }}>
                          {h.price}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {q.trim().length >= 2 && hits.length > 0 && (
              <button
                type="button"
                onClick={goToSearch}
                className="block w-full border-t border-line bg-ink px-5 py-3.5 text-center text-xs tracking-[0.2em] uppercase transition-colors hover:bg-gold"
                style={{ color: "var(--cream)" }}
              >
                {t.viewAll} ({total})
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
