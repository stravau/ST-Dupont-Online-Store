import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond, IBM_Plex_Mono, Tenor_Sans } from "next/font/google";
import { AnalyticsClient } from "@/components/analytics-client";
import { BarraNavegacao } from "@/components/barra-navegacao";
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

// A tipografia da LOJA. O site oficial da maison corre em Simplon Mono com
// SangBleu OG Sans por cima — as duas da Swiss Typefaces, as duas pagas, e a
// SangBleu ja descontinuada. Estas sao as aproximacoes livres: a IBM Plex
// Mono e a monoespacada com melhor acentuacao portuguesa e a unica com a
// gama de pesos que o site ja usa; a Tenor Sans faz o papel de display.
//
// Ficam em variaveis PROPRIAS e nao por cima das antigas: o painel continua
// a precisar da Cormorant nos titulos e da EB Garamond nas etiquetas, e o
// patrao ja aprovou esse desenho. Ver a reposicao dentro de .admin-scope
// em globals.css.
const storeDisplay = Tenor_Sans({
  variable: "--font-store-display",
  subsets: ["latin"],
  weight: ["400"], // so existe um peso; ver nota no commit
  display: "swap",
});

const storeBody = IBM_Plex_Mono({
  variable: "--font-store-body",
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
    <html
      lang="pt"
      className={`${displaySerif.variable} ${bodySans.variable} ${storeDisplay.variable} ${storeBody.variable} h-full motion-safe:scroll-smooth`}
    >
      <body className="min-h-full bg-cream text-ink">
        {/* Fio de progresso no topo enquanto uma pagina carrega. Montado na
            RAIZ, como o AnalyticsClient e pela mesma razao: assim serve o
            storefront e o /admin com um so sitio a mante-lo. E no admin que
            faz mais falta — nao ha um unico loading.tsx la dentro. */}
        <BarraNavegacao />
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
