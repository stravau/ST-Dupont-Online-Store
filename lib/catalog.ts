// Catalog data access — Prisma-backed (PostgreSQL).
//
// Returns the same Localized shapes the UI already consumes, so components
// did not need restructuring. Localized text is stored as JSON: { pt, en }.
// Prices are integer cents. Seed source: prisma/seed.ts.
import type { Locale } from "@/lib/i18n";
import type { SortKey } from "@/lib/sort";
import { prisma } from "@/lib/prisma";
import { collectionRank } from "@/lib/collection-order";
import { comCache } from "@/lib/catalog-cache";

export type Localized = Record<Locale, string>;
export type CategorySlug = "isqueiros" | "escrita" | "pele" | "acessorios";

export interface VariantColor {
  label: Localized;
  hex: string[]; // 1 hex = solid swatch, 2 = two-tone colourway
}

export interface VariantAttributes {
  type?: Localized; // pen type (writing) — text chip
  finish?: Localized; // metal/lacquer finish — text chip
  color?: VariantColor; // colour — swatch circle
  size?: Localized; // size option (e.g. Line D: Medium/Large/XL) — text chip
}

export type VariantStatus = "DISPONIVEL" | "INDISPONIVEL" | "DESCONTINUADO";

export interface Variant {
  sku: string;
  name: Localized;
  description: Localized | null; // per-colourway copy; null = inherit Product.description
  priceCents: number;
  currency: "EUR";
  attributes: VariantAttributes;
  image: string | null; // primary (front) photo, if supplied
  images: string[]; // full ordered gallery: [front, back, close-up, close-up 2]
  status: VariantStatus; // DISPONIVEL by default; hides on DESCONTINUADO,
                         // badge + disabled CTA on INDISPONIVEL.
  promoPriceCents?: number | null; // active when promoEndDate >= now
  promoEndDate?: Date | null;
  // Live per-boutique stock — surfaced on the PDP availability strip
  // and by the "em stock" chip on category pages. Aggregate `stock`
  // is app-maintained == stockLis + stockVng on every write.
  stock?: number;
  stockLis?: number;
  stockVng?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  history: Localized | null;
  collection: string;
  categorySlug: CategorySlug;
  image: string | null;
  novelty: boolean;
  // Despublicada. As grelhas e o sitemap ja filtram por isto na consulta; a
  // PDP precisa do campo para tambem recusar o acesso por URL directo.
  active: boolean;
  variants: Variant[];
}

export interface Category {
  slug: CategorySlug;
  name: Localized;
  tagline: Localized;
  history: Localized | null;
}

// Expand a product into one card descriptor per colourway. Catalogue grids
// render a tile per (product, colourway) instead of a single tile with
// swatches — the swatch UI is reserved for the product detail page.
// Drops variants/products with no usable photo and dedups by colour label
// so two SKUs of the same colourway don't render as identical tiles.
export function expandProductCards(p: Product): { product: Product; sku: string }[] {
  const out: { product: Product; sku: string }[] = [];
  const seen = new Set<string>();
  for (const v of p.variants) {
    // DESCONTINUADO never surfaces in catalogue grids.
    if (v.status === "DESCONTINUADO") continue;
    const hasImage = !!(v.image || v.images.length || p.image);
    if (!hasImage) continue;
    // Dedup by the PHOTO. Same image file = same card; different image
    // files render as separate cards even when name/price/colour
    // coincide, because the boutique tracks each SKU separately and
    // the customer needs to see every available item. The hero photos
    // may look visually similar — that's a data issue (matching photo
    // files for distinct SKUs) and is fixed in the catalogue assets,
    // not papered over by collapsing rows here.
    const key = (v.image || v.images[0] || p.image || v.sku).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ product: p, sku: v.sku });
  }
  return out;
}

const loc = (j: unknown): Localized => j as Localized;

type VariantRow = {
  sku: string;
  name: unknown;
  description?: unknown; // optional — older rows pre-migration won't include it
  priceCents: number;
  currency: string;
  attributes: unknown;
  images: string[];
};
type ProductRow = {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  history: unknown;
  collection: string;
  image: string | null;
  featured: boolean;
  active: boolean;
  category: { slug: string };
  variants: VariantRow[];
};

// Runtime corrections for products whose stored categorySlug is wrong (pens
// sitting under "acessorios", cigar cutters under "isqueiros", a Line D pen
// under "pele", etc.). Applied in mapProduct so every read goes through the
// right category — no reseed required. The same fixes are mirrored into
// seed-data.ts so a future reseed preserves them.
const CATEGORY_OVERRIDES: Record<string, CategorySlug> = {
  // accidentally in isqueiros — cigar cutters belong with the smoking accessories
  "cigar-cutter": "acessorios",
  "cigar-cutter-monogram-1872": "acessorios",
  // accidentally in acessorios — these are full lighters / writing instruments.
  // NB: ligne-2-3 and ligne-2-5 used to live here too, but they're leather
  // LIGHTER CASES (estojos), not lighters — they belong in acessorios and
  // are stored there now. Only ligne-2-6 (a real Montecristo Ligne 2
  // lighter) stays forced into isqueiros.
  "ligne-2-6": "isqueiros",
  "maxijet-2": "isqueiros",
  "haute-creation": "isqueiros", // Haute Création is a high-end lighter line
  "line-d": "escrita",
  "line-d-2": "escrita",
  "eternity-2": "escrita",
  "eternity-dragon": "escrita",
  "d-initial-dragon": "escrita",
  // initial-3 / initial-2 are Initial *lighters* (the Cinetic guilloche
  // line) — description clearly says "Isqueiro". Seed had them as
  // escrita; override to isqueiros so /c/isqueiros surfaces them and
  // /c/escrita doesn't. Sync script pushes the collection rename
  // "Initial" → "Initial Cinatic" onto Neon.
  "initial-3": "isqueiros",
  "initial-2": "isqueiros",
  // Mis-named by the catalogue scrape — slug says cutter, name says pen
  "cutter-420024l": "escrita", // "Fountain Pen Large"
  "cutter-422024l": "escrita", // "Rollerball Pen Large"
  // belongs to its real métier
  "apex-2": "pele",
  "firehead-3": "pele",
  "line-d-3": "escrita",
  // Split children of line-d-2 / line-d-3 (both pen lines in the seed)
  // that are NOT writing instruments. The bundle-split machinery
  // inherits the parent's category, dumping belts, wallets, card
  // holders and desk goods into /c/escrita. Route each to its real
  // métier so the writing catalogue only shows pens.
  //
  //   Pele — the whole Line D leather line-up sits here so it can
  //   surface under the "Line D" collection in Marroquinaria.
  "line-d-2-belt":            "pele",
  "line-d-2-reversible-belt": "pele",
  // Keep every belt in one place so /t/belts (categorySlug: pele) shows them all.
  "line-d-reversible-belt":   "pele",
  "autolock":                 "pele",
  "line-d-3-card-holder":     "pele",
  "line-d-3-passport-holder": "pele",
  "line-d-3-wallet":          "pele",
  "line-d-3-document-holder": "pele",
  "line-d-3-towel":           "pele",
  //   Acessórios — desk / paper goods and the mis-scraped desk cup.
  "line-d-2-pen-case":        "acessorios",
  "line-d-2-notebook-cover":  "acessorios",
  "line-d-2-desk-pad":        "acessorios",
  // SKU 007110 was scraped as "Lapiseira" (mechanical pencil) — it is
  // actually a desk pen cup (Copo de Secretária). Category shifts to
  // Acessórios; the display name is fixed in fix-line-d-2-desk-cup.ts.
  "line-d-2-pencil":          "acessorios",
  // Os frascos de tinta estavam em escrita, e a página Recargas & Tintas só
  // puxa de acessórios — os seis frascos que a boutique tem em stock nunca lá
  // apareciam. São consumível, como os cartuchos e as recargas, que já vivem
  // todos em acessórios.
  "inkwell":                  "acessorios",
};

// Infer the pen-type localised label for a writing variant where the
// seed didn't carry an explicit attributes.type. Scans the variant
// name (and the parent product name as a fallback) for the four pen
// types Dupont sells. Mechanical pencil is rare but kept for
// completeness so future imports don't drop on the floor.
const PEN_TYPE_PATTERNS: { test: RegExp; label: { pt: string; en: string } }[] = [
  { test: /fountain\s?pen|tinta\s?permanente|caneta\s?de\s?tinta/i, label: { pt: "Tinta Permanente", en: "Fountain Pen" } },
  { test: /roller\s?ball/i, label: { pt: "Rollerball", en: "Rollerball" } },
  { test: /ballpoint|esferográfica|esferografica/i, label: { pt: "Esferográfica", en: "Ballpoint" } },
  { test: /mechanical\s?pencil|porta[-\s]?minas/i, label: { pt: "Porta-minas", en: "Mechanical Pencil" } },
];

function inferWritingType(
  variantNameEn: string,
  variantNamePt: string,
  productNameEn: string,
  productNamePt: string,
  description: string,
): { pt: string; en: string } | undefined {
  const haystack = `${variantNameEn} ${variantNamePt} ${productNameEn} ${productNamePt} ${description}`;
  for (const p of PEN_TYPE_PATTERNS) {
    if (p.test.test(haystack)) return p.label;
  }
  return undefined;
}

function mapProduct(p: ProductRow): Product {
  const storedCategory = p.category.slug as CategorySlug;
  const categorySlug = CATEGORY_OVERRIDES[p.slug] ?? storedCategory;
  const productNameEn = (p.name as { en?: string })?.en ?? "";
  const productNamePt = (p.name as { pt?: string })?.pt ?? "";
  const productDescEn = (p.description as { en?: string })?.en ?? "";
  return {
    id: p.id,
    slug: p.slug,
    name: loc(p.name),
    description: loc(p.description),
    history: p.history ? loc(p.history) : null,
    collection: p.collection,
    categorySlug,
    image: p.image,
    novelty: p.featured,
    active: p.active,
    variants: p.variants.map((v) => {
      const attrs = (v.attributes ?? {}) as VariantAttributes;
      const vName = loc(v.name);
      if (categorySlug === "escrita" && !attrs.type) {
        const inferred = inferWritingType(vName.en, vName.pt, productNameEn, productNamePt, productDescEn);
        if (inferred) attrs.type = inferred;
      }
      return {
        sku: v.sku,
        name: vName,
        description: v.description ? loc(v.description) : null,
        priceCents: v.priceCents,
        currency: v.currency as "EUR",
        attributes: attrs,
        image: v.images?.[0] ?? null,
        images: v.images ?? [],
        status: effectiveStatus(
          ((v as { status?: VariantStatus }).status ?? "DISPONIVEL") as VariantStatus,
          ((v as { stockLis?: number }).stockLis ?? 0) + ((v as { stockVng?: number }).stockVng ?? 0),
        ),
        promoPriceCents: (v as { promoPriceCents?: number | null }).promoPriceCents ?? null,
        promoEndDate: (v as { promoEndDate?: Date | null }).promoEndDate ?? null,
        stock: (v as { stock?: number }).stock ?? 0,
        stockLis: (v as { stockLis?: number }).stockLis ?? 0,
        stockVng: (v as { stockVng?: number }).stockVng ?? 0,
      };
    }),
  };
}

// Stock is the source of truth for availability: a variant with no stock in
// either boutique is treated as INDISPONIVEL across the whole site (the PDP
// "unavailable" box + disabled Pedir-Informação, the card chip), regardless of
// its stored status. DESCONTINUADO always wins (stays hidden). This is derived
// on read so it stays correct automatically as stock moves — no status writes.
export function effectiveStatus(status: VariantStatus, totalStock: number): VariantStatus {
  if (status === "DESCONTINUADO") return "DESCONTINUADO";
  return totalStock <= 0 ? "INDISPONIVEL" : status;
}

const productInclude = {
  category: { select: { slug: true } },
  variants: { orderBy: { priceCents: "asc" as const } },
};

async function getCategoriesDb(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map((c) => ({
    slug: c.slug as CategorySlug,
    name: loc(c.name),
    tagline: loc(c.tagline),
    history: c.history ? loc(c.history) : null,
  }));
}

async function getCategoryDb(slug: string): Promise<Category | undefined> {
  const c = await prisma.category.findUnique({ where: { slug } });
  return c
    ? {
        slug: c.slug as CategorySlug,
        name: loc(c.name),
        tagline: loc(c.tagline),
        history: c.history ? loc(c.history) : null,
      }
    : undefined;
}

// Many "themes" (Géode, Popote, Maki-e, Orlinski, Monogram 1872, DC Comics,
// Horse Mane, etc.) span multiple model lines on the official site, but our
// catalogue stores them with the LINE name as `collection` (e.g. ligne-2-geode
// has collection "Ligne 2"). The theme only lives in the slug. So when the
// navbar filters by `?col=Géode`, strict-equality on `collection` returns 0.
//
// This map gives those theme labels a slug-substring fallback so the query
// catches every product whose slug contains the theme — exactly what the
// navbar intends. Keys are the labels the navbar uses (matching what we pass
// in the URL); values are a lowercase, hyphenated slug fragment.
// Exportado porque a liveness da navbar precisa exactamente do mesmo mapa: se
// as duas listas divergirem, o menu mostra entradas que a página de categoria
// não sabe filtrar, ou esconde outras que resolveriam bem.
export const COLLECTION_SLUG_PATTERNS: Record<string, string> = {
  "Géode": "geode",
  "Popote": "popote",
  "Maki-e": "maki-e",
  "Orlinski": "orlinski",
  "Monogram 1872": "monogram",
  "Horse Mane": "horse-mane",
  "DC Comics": "dc-comics",
  "Snake Skin": "snake-skin",
  "Fire X": "fire-x",
  "Camo": "camo",
  "Dragon": "dragon",
  "Fender": "fender",
  "Fuente": "fuente",
  "Cohiba-Behike": "cohiba-behike",
  "Cohiba": "cohiba",
  "Diamond head": "diamond-head",
  "Diamond Head": "diamond-head",
  "Casino": "casino",
  "Behike": "behike",
  "Padron": "padron",
  "Padrón": "padron",
  "Snake": "snake-skin",
  "Horse": "horse-mane",
  "Joker": "joker",
  "Cohiba 60th": "cohiba",
  "Marker Necklace": "marker-necklace",
  "Lighter Necklace": "lighter-necklace",
  "Romeo-y-Julieta": "romeo-y-julieta",
  "Montecristo": "montecristo",
  "20,000 Leagues Under The Sea": "20000",
  "Harley Quinn": "harley-quinn",
  "Stones of Fortune": "stones-of-fortune",
  "Haute Création": "haute-creation",
  "Cohiba 60th Anniversary": "cohiba",
  // Model-line names — most products carry these via `collection`, but a few
  // themed variants (e.g. ligne-2-monogram-1872, slim-7-geode) only have the
  // line in their slug. Adding the lines here lets ?col=Slim%207 etc. catch
  // EVERY slim-7-* product even when the catalogue stored a different
  // collection value.
  "Ligne 2": "ligne-2",
  "Ligne 1": "ligne-1",
  "Le Grand Dupont": "le-grand-dupont",
  "Twiggy": "twiggy",
  "Slimmy": "slimmy",
  "Biggy": "biggy",
  "Slim 7": "slim-7",
  "Maxijet": "maxijet",
  "Minijet": "minijet",
  "Megajet": "megajet",
  "Initial": "initial",
  "Classique": "classique",
  "Liberté": "liberte",
  "Eternity": "eternity",
  "Line D Eternity": "line-d-eternity",
  "Line D": "line-d",
  "Défi Millennium": "defi-millennium",
  "Défi Extreme": "defi-extreme",
  "Apex": "apex",
  "Atelier": "atelier",
  "Firehead": "firehead",
  "Neo Capsule": "neo-capsule",
  "Victoria": "victoria",
  "Riviera": "riviera",
  "Classic": "classic",
  "X-bag": "x-bag",
  "Défi Explorer": "defi-explorer",
};

// Slugs whose runtime override moves them INTO the given category. We widen
// the Prisma where-clause to include them (otherwise a Ligne 2 lighter that's
// stored as "acessorios" never surfaces on the lighters page) and then filter
// by effective category after mapProduct applies the override.
function widenedCategoryWhere(slug: string, collection?: string) {
  const movedInto = Object.entries(CATEGORY_OVERRIDES)
    .filter(([, c]) => c === slug)
    .map(([s]) => s);
  // When a collection filter is set AND has a known slug pattern, accept
  // EITHER literal collection match OR slug-contains. Otherwise stick with
  // strict equality (so Ligne 2 doesn't accidentally pick up unrelated
  // ligne-2-monogram if "Monogram 1872" wasn't asked for).
  // `collection` aceita várias, separadas por "|" ("Maxijet|Minijet|Slim 7").
  // Há entradas de menu que agrupam linhas irmãs — a de isqueiros diz
  // "Maxijet, Minijet & Slim 7" — e antes só passava a primeira, pelo que o
  // link mostrava um terço do que prometia.
  //
  // A barra e não a vírgula porque há colecções com vírgula no nome — a
  // "20,000 Leagues Under The Sea" — e separar por vírgula partia-a em "20" e
  // "000 Leagues Under The Sea", nenhuma das quais existe.
  const nomes = (collection ?? "")
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

  const porNome = (nome: string) => {
    const padrao = COLLECTION_SLUG_PATTERNS[nome];
    return padrao
      ? { OR: [{ collection: nome }, { slug: { contains: padrao } }] }
      : { collection: nome };
  };

  const collectionFilter =
    nomes.length === 0
      ? {}
      : nomes.length === 1
        ? porNome(nomes[0])
        : // Várias: qualquer uma serve. O OR aninhado é intencional — cada nome
          // pode ele próprio expandir para {collection} OR {slug contains}.
          { OR: nomes.map(porNome) };
  return {
    active: true,
    OR: [
      { category: { slug }, ...collectionFilter },
      { slug: { in: movedInto }, ...collectionFilter },
    ],
  };
}

async function getProductsByCategoryDb(
  slug: string,
  collection?: string,
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: widenedCategoryWhere(slug, collection),
    include: productInclude,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapProduct).filter((p) => p.categorySlug === slug);
}

// Cross-category theme aggregation. The "Cohiba" / "Monogram 1872" / similar
// themes live across lighters, accessories, leather goods at the same time
// (the official Cohiba 60th-anniversary capsule has lighters AND a 2-cigar
// case AND cufflinks AND an ashtray). The per-category page only ever shows
// one slice; this returns the WHOLE theme for the /colecao/[theme] route.
//
// Match is the same slug-substring strategy as the per-category col filter
// (COLLECTION_SLUG_PATTERNS), but unscoped to a category.
async function getProductsByThemeDb(themeLabel: string): Promise<Product[]> {
  const pattern = COLLECTION_SLUG_PATTERNS[themeLabel];
  const where = pattern
    ? { active: true, OR: [{ collection: themeLabel }, { slug: { contains: pattern } }] }
    : { active: true, collection: themeLabel };
  const rows = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapProduct);
}

// Per-category model line-up for the horizontal hero slider on /c/[category].
// Resolves each curated ModelEntry to a representative product (first hit by
// collection match, falling back to product-type match for accessories) and
// picks its primary image as the thumbnail.
export interface ModelThumbnail {
  key: string;
  label: string;        // already localised
  image: string;        // /public path or remote URL
  href: string;         // locale-prefixed full path
}

export async function getCategoryModelThumbnails(
  categorySlug: string,
  locale: Locale,
): Promise<ModelThumbnail[]> {
  const { categoryModels } = await import("@/lib/category-models");
  const entries = categoryModels[categorySlug];
  if (!entries || entries.length === 0) return [];
  const products = await getProductsByCategory(categorySlug);
  let getType: typeof import("@/lib/product-groups").getProductType | null = null;
  if (categorySlug === "acessorios") {
    ({ getProductType: getType } = await import("@/lib/product-groups"));
  }
  const { localeCategorySlug } = await import("@/lib/category-slugs");
  const localisedCat = localeCategorySlug(locale, categorySlug);
  const pickImage = (p: Product): string | null => {
    const v = p.variants.find((x) => x.image || x.images.length);
    return v?.image ?? v?.images[0] ?? p.image ?? null;
  };
  const out: ModelThumbnail[] = [];
  for (const e of entries) {
    let rep: Product | undefined;
    if (e.cols.length > 0) {
      rep = products.find((p) => e.cols.includes(p.collection));
    } else if (getType) {
      rep = products.find((p) => {
        const t = getType!(p, locale);
        return t ? t.key === e.key || t.key.startsWith(`${e.key}-`) : false;
      });
    }
    if (!rep) continue;
    const image = pickImage(rep);
    if (!image) continue;
    let href: string;
    if (e.themeHref) {
      href = `/${locale}${e.themeHref}`;
    } else {
      // ?col=<collection> filter on the same category page
      const firstCol = e.cols[0] ?? rep.collection;
      href = `/${locale}/c/${localisedCat}?col=${encodeURIComponent(firstCol)}`;
    }
    out.push({ key: e.key, label: e.label[locale], image, href });
  }
  return out;
}

export async function getCollections(categorySlug: string): Promise<string[]> {
  // Derive from the effective category so overridden products contribute their
  // collection too (and incorrectly-stored ones drop out).
  const products = await getProductsByCategory(categorySlug);
  const seen = new Set(products.map((p) => p.collection).filter((c) => c.length > 0));
  // Also surface theme labels whose slug substring pattern matches at
  // least one product in this category — otherwise the category page's
  // `activeCol` validator (which only accepts stored `collection`
  // values) silently drops filters like ?col=Fender / ?col=Maki-e /
  // ?col=Montecristo, and the page renders the whole category. The
  // widened-where in getProductsByCategory already knows how to honour
  // these labels; the validator was the missing piece.
  for (const [label, pattern] of Object.entries(COLLECTION_SLUG_PATTERNS)) {
    if (products.some((p) => p.slug.toLowerCase().includes(pattern))) {
      seen.add(label);
    }
  }
  // Mirror the catalogue grid order (and the editorial intent) — themed
  // sub-lines first, then base lines in the user-specified sequence.
  return [...seen].sort(
    (a, b) => collectionRank(a) - collectionRank(b) || a.localeCompare(b),
  );
}

async function getProductDb(slug: string): Promise<Product | undefined> {
  const p = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  return p ? mapProduct(p) : undefined;
}

// Related products for the "You may also like" slider at the bottom of every
// product detail page. Picks a mix of:
//   - same collection (highest affinity — "another Géode piece")
//   - same model line (slug shares a recognisable prefix like ligne-2- or
//     eternity-*)
//   - same category fallback so the slider is always populated
// Scores each candidate, sorts by score, returns the top `limit` (default 15).
export async function getRelatedProducts(
  current: Product,
  limit = 15,
): Promise<Product[]> {
  const all = await getProductsByCategory(current.categorySlug);
  // Token set of the current slug minus the trailing variant suffix (-2, -3,
  // monogram-1872 etc.). Used for prefix-style relatedness — slim-7-geode
  // and slim-7-dragon should match.
  const tokens = (s: string) =>
    new Set(
      s
        .split("-")
        .filter((t) => t.length > 1 && !/^\d+$/.test(t))
        .map((t) => t.toLowerCase()),
    );
  const aTokens = tokens(current.slug);

  const score = (b: Product): number => {
    if (b.slug === current.slug) return -1; // skip self
    let s = 1; // base for same category
    if (b.collection === current.collection) s += 100;
    const bTokens = tokens(b.slug);
    let shared = 0;
    for (const t of aTokens) if (bTokens.has(t)) shared++;
    s += shared * 20; // each shared slug token is worth a lot
    // Tiny tiebreaker so the rank stays stable across reloads.
    s += Math.abs(hashCode(b.slug)) % 7;
    return s;
  };

  return all
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

// Pulled from the denormalised Product.viewCount column. Excludes the
// current product when a slug is passed in so the carousel under a PDP
// never recommends the page you're already on. Limit defaults match the
// rest of the catalogue helpers.
async function getMostViewedDb(
  limit = 12,
  excludeSlug?: string,
): Promise<Product[]> {
  // Wrapped — narrow catch for the "column does not exist" case
  // (viewCount / ProductView table hasn't been migrated yet on this
  // database). Anything else — connection timeout, real query bug —
  // bubbles so it surfaces in logs instead of silently emptying the
  // carousel.
  try {
    const rows = await prisma.product.findMany({
      where: {
        active: true,
        viewCount: { gt: 0 },
        ...(excludeSlug ? { NOT: { slug: excludeSlug } } : {}),
      },
      orderBy: { viewCount: "desc" },
      include: productInclude,
      take: limit,
    });
    return rows.map(mapProduct);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/viewCount|ProductView|column.*does not exist|relation.*does not exist/i.test(msg)) {
      return [];
    }
    throw e;
  }
}

// Resolves a list of variant SKUs (as parsed from product descriptions
// — see lib/compatibility) to the parent products. Order preserved so
// the "Compatible with" row in SpecDetails and the related-products
// carousel both surface the refills / flints in the same sequence the
// description mentions them.
async function getProductsByVariantSkusDb(skus: string[]): Promise<Product[]> {
  if (skus.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { active: true, variants: { some: { sku: { in: skus } } } },
    include: productInclude,
  });
  const products = rows.map(mapProduct);
  // Order results by where the SKU appears in the input list — gives
  // callers control over the surface order.
  const skuOrder = new Map(skus.map((s, i) => [s, i]));
  return products.sort((a, b) => {
    const ai = Math.min(
      ...a.variants.map((v) => skuOrder.get(v.sku) ?? Number.MAX_SAFE_INTEGER),
    );
    const bi = Math.min(
      ...b.variants.map((v) => skuOrder.get(v.sku) ?? Number.MAX_SAFE_INTEGER),
    );
    return ai - bi;
  });
}

async function getNoveltiesDb(limit = 6): Promise<Product[]> {
  // "New Releases by the Maison" — bias toward exclusive, higher-end
  // lighters so the home grid leads with the Maison's signature pieces
  // (Maki-e, Architecture, Fuente, Orlinski, Le Grand Dupont, …) rather
  // than entry-level SKUs. Pulls a slightly wider pool, sorts each
  // product by its priciest variant, takes the top `limit`. Reuses
  // widenedCategoryWhere so overridden products (cigar cutters move out,
  // mis-stored Ligne 2s move in) land in the right pool.
  const rows = await prisma.product.findMany({
    where: widenedCategoryWhere("isqueiros"),
    include: productInclude,
    take: limit * 4,
  });
  const items = rows
    .map(mapProduct)
    .filter((p) => p.categorySlug === "isqueiros");
  const ceiling = (p: Product) =>
    p.variants.reduce((m, v) => Math.max(m, v.priceCents), 0);
  items.sort((a, b) => ceiling(b) - ceiling(a));
  return items.slice(0, limit);
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Levenshtein edit distance with early exit when the bound is exceeded.
// Used for typo-tolerant matching — see `termMatches`.
function lev(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1);
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1; // every alignment past this row is too far
    prev = cur;
  }
  return prev[n];
}

// Substring match first. The Levenshtein fallback was making "ligne 2"
// fuzzy-match into unrelated products via per-term typo tolerance (and
// once we also searched the description blob, words like "ligne" matched
// every "lighter" / "line" / "lined…" mention in body copy). New rule:
// fuzzy only on multi-word queries' SHORT (≤6 char) terms, edit distance
// 1 only. Anything longer requires an exact substring hit.
function termMatches(term: string, blob: string, words: string[]): boolean {
  if (blob.includes(term)) return true;
  if (term.length < 4 || term.length > 6) return false;
  for (const w of words) {
    if (Math.abs(w.length - term.length) > 1) continue;
    if (lev(term, w, 1) <= 1) return true;
  }
  return false;
}

// Full-catalogue search. Each term must match (AND) somewhere across product
// name (PT/EN), collection, category slug + name, and variant name / SKU.
// We DELIBERATELY no longer search the body description — the long-form
// brand copy was polluting matches (a search for "ligne 2" was pulling in
// any product whose description happened to mention 'ligne' or '2').
async function searchProductsDb(query: string): Promise<Product[]> {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const [rows, cats] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: productInclude,
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({ select: { slug: true, name: true } }),
  ]);
  const catName = new Map(cats.map((c) => [c.slug, c.name as Record<string, string>]));

  return rows.map(mapProduct).filter((p) => {
    const cn = catName.get(p.categorySlug);
    const blob = normalize(
      [
        p.name.pt,
        p.name.en,
        p.collection,
        p.categorySlug,
        cn?.pt,
        cn?.en,
        ...p.variants.flatMap((v) => [v.name.pt, v.name.en, v.sku]),
      ]
        .filter(Boolean)
        .join(" "),
    );
    const words = blob.split(/\s+/).filter(Boolean);
    return terms.every((t) => termMatches(t, blob, words));
  });
}

// --- pure helpers (no DB) ---

export type Gender = "men" | "women" | "unisex";

// Heuristic gender tag for leather goods. The Maison's catalogue doesn't carry
// an explicit gender field, so we infer from the collection (Victoria / Riviera
// are women's lines; Défi Explorer is a men's business line) and from explicit
// men's items (briefcase, document holder, weekend / travel bag). Crossbody,
// camera bag, cabas, x-bag etc. are unisex — both Men and Women columns now
// include unisex, so this is the right default.
// Gender follows the Maison's own taxonomy on st-dupont.com. The official
// "Leather goods woman" collection is exactly four lines: Victoria, Riviera,
// X-bag and the Apex trunk family (nano / mini / full trunk) — 40 SKUs, nothing
// else. The site's MEN leather section is the business/travel pieces: Défi
// Explorer, briefcases, document holders and travel bags. Everything else is
// unisex (card holders, wallets, pouches, Neo Capsule, Firehead, Atelier, …).
export function inferGender(p: Product): Gender {
  const s = p.slug.toLowerCase();
  const c = p.collection.toLowerCase();
  if (/victoria|riviera|x-bag/.test(c)) return "women";
  if (/^apex-(?:nano-trunk|mini-trunk|trunk)/.test(s)) return "women";
  // Monogram 1872 (malas): a mochila e a camera bag são unissexo; o resto da
  // gama — shopping, tote, pouch — é de senhora. Indicação da boutique.
  if (/monogram-1872/.test(s)) {
    return /backpack|camera-bag/.test(s) ? "unisex" : "women";
  }
  if (/explorer/.test(c)) return "men";
  if (/briefcase|document-holder|weekend-bag|travel-bag/.test(s)) return "men";
  return "unisex";
}

// Pen "usage" — drives the writing category's filter chip row. Matched against
// variant.attributes.type, which is a Localized label populated by the seed's
// TYPE preset (BP=Ballpoint / RB=Rollerball / FP=Fountain Pen). EN check only
// because the seed always sets a clean English value even on PT-only stores.
export type Usage = "ballpoint" | "rollerball" | "fountain";

export function isUsage(value: unknown): value is Usage {
  return value === "ballpoint" || value === "rollerball" || value === "fountain";
}

// Que tipo de escrita É esta variante — uma resposta só, nunca duas.
//
// Antes, `hasUsage` respondia ao nível do PRODUTO e a grelha desenha um cartão
// por VARIANTE. O Popoté é uma ficha com a caneta de tinta permanente (420316M)
// e o rollerball (422316M) lá dentro: bastava a variante 420 para o produto
// inteiro passar no filtro "Tinta Permanente", e os cartões do rollerball iam
// atrás. O mesmo erro que o filtro de stock já tinha tido, e pela mesma razão.
//
// A ordem dos sinais importa: primeiro o que descreve a VARIANTE (a etiqueta
// explícita, o nome dela, a referência), e só no fim o nome do produto. Como
// devolve um tipo único, uma variante nunca conta para dois filtros.
//
//   420/460/410 = tinta permanente · 422/412 = rollerball · 425/265/820/830 = esferográfica
// Os prefixos foram DEDUZIDOS do catalogo, nao adivinhados: para cada prefixo
// de tres digitos contaram-se os tipos declarados nos nomes das suas fichas, e
// so entram os que sao unanimes. O padrao que daí saiu é o terceiro digito —
// 0 tinta permanente, 2 rollerball, 5 esferografica — repetido em todas as
// familias (26x, 27x, 40x, 41x, 42x, 46x).
//
// A lista é explicita e nao uma regra sobre o digito, porque 830/835 tambem
// acabam em 0 e 5 e sao CINTOS (Line D · Cinto Reversivel). Estavam na lista
// dos esferograficos e faziam cintos aparecer no filtro das canetas.
const SINAIS: { usage: Usage; keys: RegExp; sku: RegExp }[] = [
  { usage: "fountain", keys: /(fountain\s?pen|foutain\s?pen|tinta permanente)/i, sku: /^(?:STD)?(260|270|400|410|420|460)/i },
  { usage: "rollerball", keys: /(roller\s?ball)/i, sku: /^(?:STD)?(262|272|402|412|422|462)/i },
  { usage: "ballpoint", keys: /(ballpoint|esferogr[áa]fica)/i, sku: /^(?:STD)?(045|265|275|405|425|465|700)/i },
];

export function variantUsage(p: Product, v: Product["variants"][number]): Usage | null {
  const tipo = v.attributes.type;
  for (const s of SINAIS) {
    if (tipo?.en && s.keys.test(tipo.en)) return s.usage;
    if (tipo?.pt && s.keys.test(tipo.pt)) return s.usage;
  }
  for (const s of SINAIS) if (s.keys.test(v.name.en) || s.keys.test(v.name.pt)) return s.usage;
  for (const s of SINAIS) if (s.sku.test(v.sku)) return s.usage;
  for (const s of SINAIS) if (s.keys.test(p.name.en) || s.keys.test(p.name.pt)) return s.usage;
  return null;
}

export function hasUsage(p: Product, usage: Usage): boolean {
  return p.variants.some((v) => variantUsage(p, v) === usage);
}

// Price-bucket filter (chip row on every catalogue page). Matches against
// the product's cheapest variant — a product with at least one variant in
// the bucket counts as "in range".
export type PriceBucket = "u200" | "200-500" | "500-1000" | "1000-2500" | "a2500";

export function isPriceBucket(value: unknown): value is PriceBucket {
  return value === "u200" || value === "200-500" || value === "500-1000" ||
    value === "1000-2500" || value === "a2500";
}

export function priceInBucket(product: Product, bucket: PriceBucket): boolean {
  const eur = productMinEur(product);
  switch (bucket) {
    case "u200": return eur < 200;
    case "200-500": return eur >= 200 && eur < 500;
    case "500-1000": return eur >= 500 && eur < 1000;
    case "1000-2500": return eur >= 1000 && eur < 2500;
    case "a2500": return eur >= 2500;
  }
}

// Cheapest variant's price in whole euros — the slider's bounds and the
// per-product filter both reduce on this figure.
export function productMinEur(product: Product): number {
  const min = product.variants.reduce(
    (m, v) => Math.min(m, v.priceCents),
    Number.MAX_SAFE_INTEGER,
  );
  return min === Number.MAX_SAFE_INTEGER ? 0 : Math.floor(min / 100);
}

// Inclusive range — a product matches when its cheapest variant lands
// between minEur and maxEur (both ends inclusive). Either bound can be
// undefined to mean "no limit on that side".
export function priceInRange(
  product: Product,
  minEur: number | undefined,
  maxEur: number | undefined,
): boolean {
  const eur = productMinEur(product);
  if (minEur !== undefined && eur < minEur) return false;
  if (maxEur !== undefined && eur > maxEur) return false;
  return true;
}

export function fromPrice(product: Product): Variant {
  return product.variants.reduce(
    (min, cur) => (cur.priceCents < min.priceCents ? cur : min),
    product.variants[0],
  );
}

// Common sales-page sorting. Catalogue queries return oldest→newest
// (createdAt asc), so reversing yields most-recent first.
export function sortProducts(
  items: Product[],
  sort: SortKey,
  locale: Locale,
): Product[] {
  const arr = [...items];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => fromPrice(a).priceCents - fromPrice(b).priceCents);
    case "price-desc":
      return arr.sort((a, b) => fromPrice(b).priceCents - fromPrice(a).priceCents);
    case "newest":
      return arr.reverse();
    case "name":
      return arr.sort((a, b) => a.name[locale].localeCompare(b.name[locale]));
    case "featured":
    default:
      // The default order is the editorial catalogue order: themed
      // sub-collections first (Géode/Popote/Maki-e/…), then base lines in
      // the explicit COLLECTION_ORDER sequence. Novelty pieces only float
      // *within* their own collection — they no longer jump the entire
      // grid to the top, which would scramble the section ordering.
      return arr.sort(
        (a, b) =>
          collectionRank(a.collection) - collectionRank(b.collection) ||
          Number(b.novelty) - Number(a.novelty),
      );
  }
}

export function formatPrice(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// ---------------------------------------------------------------------------
// Carrossel curado ("Em Destaque")
// ---------------------------------------------------------------------------
// Os artigos que o patrão escolhe a dedo em /admin/destaques, pela ordem que
// definiu. Devolve pares {product, sku} porque o cartão da grelha é por
// colourway, não por produto — a mesma forma que a home já usa para as
// Novidades.
//
// Lista vazia devolve [] e a secção não é desenhada. Entradas cujo artigo
// tenha sido apagado ou descontinuado são ignoradas em silêncio: o carrossel
// não é sítio para mostrar um buraco.
async function getCuratedCardsDb(
  rail = "DESTAQUES",
): Promise<{ product: Product; sku: string }[]> {
  const picks = await prisma.homeCarouselItem.findMany({
    where: { rail },
    orderBy: { position: "asc" },
    select: { sku: true },
  });
  if (picks.length === 0) return [];

  const skus = picks.map((p) => p.sku);
  const rows = await prisma.product.findMany({
    where: { variants: { some: { sku: { in: skus } } } },
    include: productInclude,
  });
  const bySku = new Map<string, Product>();
  for (const row of rows) {
    const p = mapProduct(row);
    for (const v of p.variants) bySku.set(v.sku, p);
  }

  const out: { product: Product; sku: string }[] = [];
  for (const { sku } of picks) {
    const product = bySku.get(sku);
    if (!product) continue;
    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant || variant.status === "DESCONTINUADO") continue;
    out.push({ product, sku });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// Leituras em cache
//
// Todas as funções acima que tocam em Postgres estão declaradas como *Db e
// são exportadas aqui envolvidas em cache, com a etiqueta `catalogo`. Quem
// as chama — páginas e as próprias funções derivadas (getRelatedProducts,
// getCollections, getCategoryModelThumbnails, que só filtram em memória o
// que getProductsByCategory devolve) — não muda nada.
//
// Ver lib/catalog-cache.ts para o porquê e para a invalidação nas escritas.
// ─────────────────────────────────────────────────────────────────────────

// O cache serializa em JSON e as datas voltam de lá como string. No Product
// só promoEndDate é Date, portanto reidrata-se à saída para o tipo declarado
// não passar a mentir.
function reidrata<T extends Product | undefined>(p: T): T {
  if (!p) return p;
  for (const v of p.variants) {
    if (typeof (v.promoEndDate as unknown) === "string") {
      v.promoEndDate = new Date(v.promoEndDate as unknown as string);
    }
  }
  return p;
}

function cacheProdutos<A extends unknown[]>(
  fn: (...args: A) => Promise<Product[]>,
  chave: string,
) {
  const emCache = comCache(fn, chave);
  return async (...args: A): Promise<Product[]> => (await emCache(...args)).map(reidrata);
}

export const getCategories = comCache(getCategoriesDb, "getCategories");
export const getCategory = comCache(getCategoryDb, "getCategory");
export const getProductsByCategory = cacheProdutos(getProductsByCategoryDb, "getProductsByCategory");
export const getProductsByTheme = cacheProdutos(getProductsByThemeDb, "getProductsByTheme");
export const getMostViewed = cacheProdutos(getMostViewedDb, "getMostViewed");
export const getProductsByVariantSkus = cacheProdutos(
  getProductsByVariantSkusDb,
  "getProductsByVariantSkus",
);
export const getNovelties = cacheProdutos(getNoveltiesDb, "getNovelties");
export const searchProducts = cacheProdutos(searchProductsDb, "searchProducts");

const getProductEmCache = comCache(getProductDb, "getProduct");
export async function getProduct(slug: string): Promise<Product | undefined> {
  // O cache guarda a ausência como null, não como undefined.
  return reidrata((await getProductEmCache(slug)) ?? undefined);
}

// As versões sem cache, para scripts de diagnóstico e manutenção. As
// exportadas acima só funcionam dentro de um pedido do Next — fora dele o
// unstable_cache rebenta com "Invariant: incrementalCache missing". E um
// script quer sempre o estado real da base, não uma cópia de há cinco minutos.
export const semCache = {
  getCategories: getCategoriesDb,
  getCategory: getCategoryDb,
  getProductsByCategory: getProductsByCategoryDb,
  getProductsByTheme: getProductsByThemeDb,
  getProduct: getProductDb,
  getMostViewed: getMostViewedDb,
  getProductsByVariantSkus: getProductsByVariantSkusDb,
  getNovelties: getNoveltiesDb,
  searchProducts: searchProductsDb,
  getCuratedCards: getCuratedCardsDb,
};

const getCuratedCardsEmCache = comCache(getCuratedCardsDb, "getCuratedCards");
export async function getCuratedCards(
  rail = "DESTAQUES",
): Promise<{ product: Product; sku: string }[]> {
  const cards = await getCuratedCardsEmCache(rail);
  return cards.map((c) => ({ ...c, product: reidrata(c.product) }));
}
