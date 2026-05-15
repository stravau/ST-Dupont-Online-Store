import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const year = new Date().getFullYear();

  return (
    <footer className="monogram-bg mt-24 text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl tracking-[0.18em]">S.T. DUPONT</p>
          <p className="overline mt-3">{dict.footer.tagline}</p>
        </div>

        <div>
          <p className="overline mb-5">{dict.footer.boutique}</p>
          <address className="space-y-1 text-sm not-italic text-cream/70">
            <p>El Corte Inglés — Lisboa</p>
            <p>Av. António Augusto de Aguiar, 31</p>
            <p>1069-413 Lisboa, Portugal</p>
            <p>+351 213 711 700</p>
          </address>
        </div>

        <div>
          <p className="overline mb-5">{dict.footer.legal}</p>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href={`/${lang}`} className="transition-colors hover:text-gold">{dict.footer.privacy}</Link></li>
            <li><Link href={`/${lang}`} className="transition-colors hover:text-gold">{dict.footer.terms}</Link></li>
            <li><Link href={`/${lang}`} className="transition-colors hover:text-gold">{dict.footer.returns}</Link></li>
          </ul>
          <p className="overline mb-3 mt-8">{dict.footer.follow}</p>
          <div className="flex gap-4 text-sm text-cream/70">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold">Facebook</a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-6 py-6 text-center text-xs tracking-widest text-cream/40">
          © {year} S.T. Dupont. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
