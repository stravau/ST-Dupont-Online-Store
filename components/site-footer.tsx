import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { STORE, CONTACT_ANCHOR } from "@/lib/store-info";
import { Logo } from "@/components/logo";

export function SiteFooter({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const year = new Date().getFullYear();
  const floor = lang === "pt" ? "Piso 0" : "Floor 0";

  // position: sticky + bottom-0 keeps the footer pinned to the viewport
  // bottom (z-0) while the cream <main> (z-10) scrolls OVER it. Unlike
  // `fixed`, sticky participates in document flow — the footer reserves
  // its own height automatically, so the reveal-from-behind effect
  // doesn't need a manually-sized spacer to match it.
  return (
    <footer className="sticky bottom-0 z-0 monogram-bg text-cream">
      <div className="mx-auto h-px max-w-[64rem] bg-gradient-to-r from-transparent via-gold-soft to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-7 text-center md:grid-cols-3 md:gap-12 md:py-12 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <Logo variant="light" width={244} className="w-[176px] md:w-[244px]" />
          <p className="overline mt-3 md:mt-5">{dict.footer.tagline}</p>
        </div>

        <div id={CONTACT_ANCHOR} className="scroll-mt-28">
          <p className="overline mb-2.5 md:mb-5">{dict.footer.boutique}</p>
          <address className="space-y-0.5 text-xs leading-snug not-italic text-cream/85 md:space-y-1.5 md:text-sm md:leading-relaxed">
            <p>{STORE.venue}</p>
            <p>{STORE.street} · {floor}</p>
            <p>{STORE.postcode}</p>
            <p className="pt-1 md:pt-2">
              <a href={STORE.phoneHref} className="transition-colors hover:text-gold">
                {STORE.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${STORE.email}`} className="transition-colors hover:text-gold">
                {STORE.email}
              </a>
            </p>
          </address>
          <div className="mt-3 flex flex-col items-center gap-1.5 text-xs text-cream/85 md:mt-5 md:items-start md:gap-3 md:text-sm">
            <Link href={`/${lang}/loja`} className="transition-colors hover:text-gold">
              {dict.footer.viewStore} →
            </Link>
            <a
              href={STORE.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-gold"
            >
              {dict.footer.official} ↗
            </a>
          </div>
        </div>

        <div>
          <p className="overline mb-2.5 md:mb-5">{dict.footer.legal}</p>
          <ul className="space-y-1 text-xs text-cream/85 md:space-y-2.5 md:text-sm">
            <li><Link href={`/${lang}/legal/privacidade`} className="transition-colors hover:text-gold">{dict.footer.privacy}</Link></li>
            <li><Link href={`/${lang}/legal/termos`} className="transition-colors hover:text-gold">{dict.footer.terms}</Link></li>
            <li><Link href={`/${lang}/legal/devolucoes`} className="transition-colors hover:text-gold">{dict.footer.returns}</Link></li>
          </ul>
          <p className="overline mt-3 mb-1.5 md:mt-7 md:mb-4">{dict.footer.follow}</p>
          <div className="flex justify-center gap-5 text-xs text-cream/85 md:justify-start md:text-sm">
            <a href="https://www.instagram.com/stdupontofficial/" target="_blank" rel="noopener noreferrer" className="hover:text-gold">Instagram</a>
            <a href="https://www.facebook.com/STDUPONTOFFICIAL/" target="_blank" rel="noopener noreferrer" className="hover:text-gold">Facebook</a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-6 py-2.5 text-center text-[0.6rem] tracking-widest text-cream/60 md:py-5 md:text-xs">
          © {year} S.T. Dupont. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
