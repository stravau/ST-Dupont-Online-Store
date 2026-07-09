import { notFound } from "next/navigation";
import { locales, isLocale, getDictionary, type Locale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NavBack } from "@/components/nav-back";
import { PageTransition } from "@/components/page-transition";
import { RevealRoot } from "@/components/reveal-root";
import { ScrollToTop } from "@/components/scroll-to-top";

// Nested locale layout — html/body/CSS/fonts live in the root
// app/layout.tsx so /admin (which sits outside [lang]) also inherits
// them. This layout owns the public-site chrome: header, footer,
// skip-link, locale guard, reveal observer.

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
    <div className="flex min-h-screen flex-col bg-cream">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:tracking-[0.18em] focus:text-gold focus:uppercase"
      >
        {getDictionary(locale).common.skipToContent}
      </a>
      <ScrollToTop />
      <SiteHeader lang={locale} />
      <NavBack lang={locale} homeLabel={getDictionary(locale).nav.backHome} />
      <main id="main" className="flex flex-1 flex-col bg-cream">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter lang={locale} />
      <RevealRoot />
    </div>
  );
}
