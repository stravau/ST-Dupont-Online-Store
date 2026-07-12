"use client";

import { useConsent } from "@/lib/consent";

// Small text button — mounted in the site footer's Legal block so a
// returning user can re-open the banner and change their mind. It
// just resets the consent state to `null`; the <CookieBanner /> then
// re-renders because its render gate is `consent !== null`.
export function CookiePreferencesLink({ label }: { label: string }) {
  const { reopen } = useConsent();
  return (
    <button
      type="button"
      onClick={reopen}
      className="tap-none inline text-left text-xs text-cream/85 transition-colors hover:text-gold md:text-sm"
    >
      {label}
    </button>
  );
}
