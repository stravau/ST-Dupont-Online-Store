"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Client wrapper so beforeSend can be a function — server components
// can't pass functions to client-component props. Mounted from the
// root layout so /admin and any non-localised route are covered.
//
// Analytics is gated on the same localStorage key the ConsentProvider
// writes ("stdupont-consent-v1"). Speed Insights only transmits
// anonymised CWV numbers (no identifiers) and stays ungated.
export function AnalyticsClient() {
  return (
    <>
      <Analytics
        beforeSend={(event) => {
          if (typeof window === "undefined") return event;
          try {
            const raw = window.localStorage.getItem("stdupont-consent-v1");
            if (!raw) return null;
            const parsed = JSON.parse(raw) as { version?: string; analytics?: boolean };
            return parsed.version === "v1" && parsed.analytics === true ? event : null;
          } catch {
            return null;
          }
        }}
      />
      <SpeedInsights />
    </>
  );
}
