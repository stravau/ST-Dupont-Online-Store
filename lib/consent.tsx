"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Bumping the version invalidates every previously-stored decision
// and re-shows the banner on next visit — use when the categories
// list changes materially (e.g. adding marketing pixels alongside
// analytics later).
export const CONSENT_VERSION = "v1";
const STORAGE_KEY = "stdupont-consent-v1";

export interface ConsentState {
  essential: true; // always granted; kept in the shape so consumers can pattern-match uniformly
  analytics: boolean;
  version: string;
}

interface ConsentContextValue {
  consent: ConsentState | null; // null = undecided; banner shows.
  decided: boolean;
  accept: () => void;
  reject: () => void;
  reopen: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside a <ConsentProvider>");
  return ctx;
}

// Read the consent cookie/localStorage synchronously from JS. Used
// by Analytics' beforeSend hook where React context isn't available
// (the Analytics component is mounted above the ConsentProvider).
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as ConsentState;
    return parsed.version === CONSENT_VERSION && parsed.analytics === true;
  } catch {
    return false;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  // Initial state is `null` to guarantee the same shape on server + first
  // client render (avoiding hydration mismatch). Real state is read
  // inside a post-mount effect. The banner is gated on `mounted` too so
  // it never flashes for users who already decided.
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ConsentState;
      if (parsed.version !== CONSENT_VERSION) return; // version bumped — re-prompt
      setConsent(parsed);
    } catch {
      // localStorage disabled (private mode on some browsers) — treat as undecided
    }
  }, []);

  const save = useCallback((analytics: boolean) => {
    const next: ConsentState = { essential: true, analytics, version: CONSENT_VERSION };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setConsent(next);
  }, []);

  const accept = useCallback(() => save(true), [save]);
  const reject = useCallback(() => save(false), [save]);
  const reopen = useCallback(() => setConsent(null), []);

  return (
    <ConsentContext.Provider
      value={{
        consent,
        decided: mounted && consent !== null,
        accept,
        reject,
        reopen,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}
