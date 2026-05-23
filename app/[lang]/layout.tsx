import type { Metadata, Viewport } from "next";
import { Spectral, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NavBack } from "@/components/nav-back";
import { PageTransition } from "@/components/page-transition";
import { RevealRoot } from "@/components/reveal-root";

// Closest free matches to st-dupont.com's (licensed) typography:
// Spectral — an elegant high-contrast serif ≈ SangBleu OG Sans (headings);
// IBM Plex Mono — a light, refined monospace ≈ Simplon Mono (body/labels).
const displaySerif = Spectral({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const bodySans = IBM_Plex_Mono({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "S.T. Dupont — Maison de Luxe Française", template: "%s · S.T. Dupont" },
  description:
    "S.T. Dupont — lighters, writing instruments and leather goods. French luxury craftsmanship since 1872.",
};

// Match the cream page/header background so iOS Safari doesn't tint the
// URL bar / notch area into a visible blue strip above the navbar.
export const viewport: Viewport = {
  themeColor: "#eef3fa",
};

// Data is DB-backed and per-request; never prerender at build time (so the
// build never needs the database — Vercel builds stay green pre-seed).
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  return (
    <html lang={locale} className={`${displaySerif.variable} ${bodySans.variable} h-full scroll-smooth`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader lang={locale} />
        <NavBack lang={locale} homeLabel={getDictionary(locale).nav.backHome} />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter lang={locale} />
        <RevealRoot />
      </body>
    </html>
  );
}
