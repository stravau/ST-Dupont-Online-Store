import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NavBack } from "@/components/nav-back";
import { PageTransition } from "@/components/page-transition";
import { RevealRoot } from "@/components/reveal-root";
import { ScrollToTop } from "@/components/scroll-to-top";

// st-dupont.com uses an elegant serif throughout (their licensed SangBleu).
// Closest free match is the Garamond family — used for BOTH headings and
// body so the whole site reads as one refined serif, like Dupont:
// Cormorant Garamond (display) for headings, EB Garamond for body/UI.
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

// Match the cream page/header background so iOS Safari doesn't tint the
// URL bar / notch area into a visible blue strip above the navbar.
export const viewport: Viewport = {
  themeColor: "#eef3fa",
};

// Data is DB-backed and per-request; never prerender at build time (so the
// build never needs the database — Vercel builds stay green pre-seed). To
// flip on ISR caching, set this per-page on routes that don't depend on
// search params, ensuring DATABASE_URL at build points at the production
// dataset.
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
    <html lang={locale} className={`${displaySerif.variable} ${bodySans.variable} h-full motion-safe:scroll-smooth`}>
      {/* bg-ink on body sits behind the footer so the "reveal from behind"
          effect (main scrolls over a fixed footer underneath) reads as a
          smooth transition from the cream content area into the dark
          monogram-bg footer. */}
      <body className="flex min-h-full flex-col bg-ink">
        {/* Skip-link — first focusable element so keyboard users jump
            past the header chrome straight into <main>. .sr-only keeps
            it visually hidden until focus, then it springs to the
            top-left corner with the standard gold accent. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:tracking-[0.18em] focus:text-gold focus:uppercase"
        >
          {getDictionary(locale).common.skipToContent}
        </a>
        <ScrollToTop />
        <SiteHeader lang={locale} />
        <NavBack lang={locale} homeLabel={getDictionary(locale).nav.backHome} />
        {/* z-10 + bg-cream keeps the main content above the sticky
            footer (z-0) at every scroll position except the very end. */}
        <main id="main" className="relative z-10 flex-1 bg-cream">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter lang={locale} />
        <RevealRoot />
      </body>
    </html>
  );
}
