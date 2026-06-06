// Resolves a localized human label for an in-app pathname — used by the
// global Back button so it reads "← Writing", "← Store", etc. Pure module,
// safe to import in client components.
import { getDictionary, type Locale } from "@/lib/i18n";
import { productGroups } from "@/lib/product-groups";
import { legalDocs } from "@/lib/legal";

const CATEGORY_NAV: Record<string, keyof ReturnType<typeof getDictionary>["nav"]> = {
  isqueiros: "lighters",
  escrita: "writing",
  pele: "leather",
  acessorios: "accessories",
};

export function routeLabel(pathname: string, lang: Locale): string {
  const dict = getDictionary(lang);
  // Drop the locale prefix → segments after /{lang}
  const rest = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  if (rest[0] === lang) rest.shift();

  if (rest.length === 0) return dict.nav.backHome;

  const [seg, a] = rest;
  switch (seg) {
    case "c":
      return a && CATEGORY_NAV[a] ? dict.nav[CATEGORY_NAV[a]] : dict.nav.collections;
    case "p":
      return dict.nav.products;
    case "t":
      return (a && productGroups[a]?.title[lang]) || dict.nav.products;
    case "novidades":
      return dict.sections.novelties;
    case "colecao":
      return dict.collection.title;
    case "historia":
      return dict.nav.about;
    case "loja":
      return dict.nav.store;
    case "legal":
      return (a && legalDocs[a]?.title[lang]) || dict.footer.legal;
    case "pesquisa":
      return dict.search.title;
    case "consulta":
      return dict.product.bookConsultation;
    default:
      return dict.nav.backHome;
  }
}
