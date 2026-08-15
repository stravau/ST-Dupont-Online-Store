import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond, Julius_Sans_One, Tenor_Sans } from "next/font/google";
import { AnalyticsClient } from "@/components/analytics-client";
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

// Par editorial que aproxima a SangBleu OG Sans do site oficial (essa é da
// Swiss Typefaces e paga). São duas porque nenhuma serve para as duas coisas:
//
//   Julius Sans One — sans de alto contraste, é a que mais se parece com o
//     alvo em caixa alta, mas só tem um peso e em texto corrido fica leve.
//     Fica nos títulos, onde brilha.
//   Tenor Sans — humanista de modulação suave, menos dramática mas legível
//     em parágrafos. Fica no corpo, onde a outra falha.
//
// É a mesma lógica que a Maison usa (SangBleu para uns sítios, Assistant para
// outros). Carregadas aqui, aplicadas só onde .editorial-scope for usada.
const editorialDisplay = Julius_Sans_One({
  variable: "--font-editorial-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const editorialBody = Tenor_Sans({
  variable: "--font-editorial-body",
  subsets: ["latin"],
  weight: ["400"],
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
    <html lang="pt" className={`${displaySerif.variable} ${bodySans.variable} ${editorialDisplay.variable} ${editorialBody.variable} h-full motion-safe:scroll-smooth`}>
      <body className="min-h-full bg-cream text-ink">
        {children}
        {/* AnalyticsClient hosts the Vercel Analytics + Speed
            Insights components. It's a client component because
            Analytics' beforeSend is a function and server components
            can't hand functions to client-component props. Mounted
            at the ROOT so /admin and non-localised routes are
            tracked too. */}
        <AnalyticsClient />
      </body>
    </html>
  );
}
