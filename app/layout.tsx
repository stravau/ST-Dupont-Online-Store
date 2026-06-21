import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
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
      </body>
    </html>
  );
}
