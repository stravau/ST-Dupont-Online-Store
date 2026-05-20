import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { STORE, CONTACT_ANCHOR } from "@/lib/store-info";
import { Logo } from "@/components/logo";

export function SiteFooter({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const year = new Date().getFullYear();
  const floor = lang === "pt" ? "Piso 0" : "Floor 0";

  return (
    <footer className="monogram-bg mt-24 text-cream">
      {/* Gold rule draws across as the footer scrolls into view */}
      <div className="reveal gold-rule-anim mx-auto h-px max-w-[64rem] bg-gradient-to-r from-transparent via-gold-soft to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-3">
        <div className="reveal">
          <Logo variant="light" width={244} className="w-[244px]" />
          <p className="overline mt-4">{dict.footer.tagline}</p>
        </div>

        <div id={CONTACT_ANCHOR} className="reveal reveal-d1 scroll-mt-28">
          <p className="overline mb-5">{dict.footer.boutique}</p>
          <address className="space-y-1 text-sm not-italic text-cream/70">
            <p>{STORE.venue}</p>
            <p>{STORE.street} · {floor}</p>
            <p>{STORE.postcode}</p>
            <p>
              <a href={STORE.phoneHref} className="link-grow transition-colors hover:text-gold">
                {STORE.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${STORE.email}`} className="link-grow transition-colors hover:text-gold">
                {STORE.email}
              </a>
            </p>
          </address>
          <div className="mt-5 flex flex-col gap-2 text-sm text-cream/70">
            <Link href={`/${lang}/loja`} className="link-grow transition-colors hover:text-gold">
              {dict.footer.viewStore} →
            </Link>
            <a
              href={STORE.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-grow transition-colors hover:text-gold"
            >
              {dict.footer.official} ↗
            </a>
          </div>
        </div>

        <div className="reveal reveal-d2">
          <p className="overline mb-5">{dict.footer.legal}</p>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href={`/${lang}/legal/privacidade`} className="link-grow transition-colors hover:text-gold">{dict.footer.privacy}</Link></li>
            <li><Link href={`/${lang}/legal/termos`} className="link-grow transition-colors hover:text-gold">{dict.footer.terms}</Link></li>
            <li><Link href={`/${lang}/legal/devolucoes`} className="link-grow transition-colors hover:text-gold">{dict.footer.returns}</Link></li>
          </ul>
          <p className="overline mb-3 mt-8">{dict.footer.follow}</p>
          <div className="flex gap-4 text-sm text-cream/70">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold">Facebook</a>
          </div>
        </div>
      </div>

      <div className="reveal reveal-d3 border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-6 py-6 text-center text-xs tracking-widest text-cream/40">
          © {year} S.T. Dupont. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
