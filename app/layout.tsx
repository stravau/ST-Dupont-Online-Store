import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Root layout — sole owner of <html>, <body> and the global CSS /
// font imports so every route (including /admin and /api error pages)
// inherits Tailwind, the design tokens and the typefaces. Locale and
// public-site chrome (header, footer, skip-link) live under
// app/[lang]/layout.tsx; the admin lives under app/admin/layout.tsx.

const displaySerif = Cormorant_Garamond({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bodySans = EB_Garamond({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://st-dupont-online-store.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "S.T. Dupont — Maison de Luxe Française", template: "%s · S.T. Dupont" },
  description:
    "S.T. Dupont — lighters, writing instruments and leather goods. French luxury craftsmanship since 1872.",
  openGraph: {
    type: "website",
    siteName: "S.T. Dupont",
    images: ["/hero/homepage-bg.jpg"],
  },
  twitter: { card: "summary_large_image", images: ["/hero/homepage-bg.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#eef3fa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${displaySerif.variable} ${bodySans.variable} h-full motion-safe:scroll-smooth`}>
      <body className="min-h-full bg-cream text-ink">
        {children}
        {/* Analytics is mounted at the ROOT (not the locale layout) so
            /admin and any non-localised route get pageviews too.
            beforeSend gates on the localStorage consent cookie set by
            lib/consent.tsx — analytics events don't fire until the
            user accepts. We can't call useConsent() here because
            <Analytics /> is above <ConsentProvider>, so we read the
            same storage key directly. Speed Insights only transmits
            anonymised CWV numbers (no identifiers) and stays
            ungated for now. */}
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
      </body>
    </html>
  );
}
