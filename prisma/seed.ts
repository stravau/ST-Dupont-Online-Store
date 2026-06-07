// Seeds the database from the corrected 2025/2026 catalogue in lib/catalog.ts.
// Idempotent: clears catalog tables then recreates. Run: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../app/generated/prisma/client";
import { categories, products, historyByCollection } from "./seed-data";
import type { SeedProduct } from "./seed-data";
import { collectionRank } from "../lib/collection-order";
import descriptionOverrides from "./description-overrides.json";

// Slug → description rewrite, scraped from the body_html on www.st-dupont.com.
// Applied per-product so the catalogue copy reads exactly the way the maison
// describes each piece, not the generic placeholder strings.
const DESC_OVERRIDES: Record<string, string> = descriptionOverrides as Record<string, string>;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// --- Catalogue cleanup --------------------------------------------------
// Applied at seed time so the seed-data.ts source stays as a raw record of
// what was imported from us.st-dupont.com — these maps capture the
// editorial overrides (dropouts, renames, category fixes, ordering).

const DROP_SLUGS = new Set<string>([
  // Lighters with no images
  "defi-extreme",
  "biggy",
  "slimmy",
  // Writing with no images
  "pen-case-single",
  "pen-case-double",
  "desk-blotter",
  "pen-tray",
  "notebook-a5",
  "notebook-pocket",
  "ink-bottle",
  "rollerball-refill",
  // Leather goods with no images
  "apex-wallet",
  "apex-card-holder",
  "defi-explorer-document-holder",
  "defi-explorer-backpack",
  "travel-bag",
  "weekend-bag",
  "briefcase",
  "urban-backpack",
  "crossbody-bag",
  "compact-crossbody",
  "leather-wallet",
  "slim-card-holder",
  "leather-key-holder",
  // Accessories with no images
  "cufflinks-montecristo-aurore",
  "money-clip",
  "key-ring",
  "cigar-cutter-fire-x",
  "cigar-case",
  "ashtray-fire-x",
  "humidor",
  "belt",
  "tie-clip",
  "gas-refill",
  "stones",
  "cigar-cutter-v",
  "cigar-case-double",
  "ashtray-porcelain",
  "humidor-travel",
  "classic-cufflinks",
  "classic-belt",
  "engraved-money-clip",
  "classic-tie-clip",
  // Monogram series with no images
  "twiggy-monogram",
  "slimmy-monogram",
  "biggy-monogram",
  "line-d-eternity-monogram",
  "cigar-case-monogram",
  "cigar-case-double-monogram",
  "cigarette-case-monogram",
  "cigar-cutter-monogram",
  "ashtray-monogram",
  "cufflinks-monogram",
  "money-clip-monogram",
  "key-ring-monogram",
  "writing-instrument",
  "writing-instruments",
  // 2026-06 editorial pass:
  // Drop the curated Ligne 2 (12 variants) — pipeline-imported `ligne-2-extra`
  // takes over the Ligne 2 collection with its 15 colourways.
  "ligne-2",
  // Drop the CURATED Twiggy — keep the pipeline twiggy-2 instead, since it
  // carries the colourway the user wanted back (blue). The `twiggy-2` slug
  // renames to `twiggy` below so the URL stays clean.
  "twiggy",
  // Monogram 1872 pruning — keep the 1st curated tile (le-grand-dupont-
  // monogram), drop the next three (the pipeline-imported 1872 products
  // that read as duplicates of the same theme).
  "le-grand-dupont-monogram-1872",
  "biggy-monogram-1872",
  "ligne-2-monogram-1872",
  // 2026-06 — EN-store import scrap that can't be salvaged into a sensible
  // collection (no Title-Collection tag, no theme tag, no Shopify category
  // mapping).
  "misc-2",
  "x",
  "defi-millenium",
  // 2026-06 — Cigar cutter swap (per editorial brief). Drop every existing
  // cutter slug; the www.st-dupont.com cutters take over the entire
  // Cortador de Charuto section.
  "cigar-cutter",
  "cigar-cutter-2",
  "cigar-cutter-extra",
  "cigar-cutter-fender",
  "cigar-cutter-fire-x-2",
  "cigar-cutter-monogram-1872",
  "cigar-cutter-monogram-1872-2",
  "cigar-cutter-monogram",
  // 20,000 Leagues — www imports carry the richer multi-variant set per
  // base line; drop the pipeline single-variant entries.
  "ligne-2-20000-lieues-sous-les-mers",
  "twiggy-20000-lieues-sous-les-mers",
  "slimmy-20000-lieues-sous-les-mers",
  // www import scrap — placeholder collections with no salvage path.
  "misc",
  "x-2",
  "misc-xl",
]);

const RENAME_SLUG: Record<string, string> = {
  "biggy-2": "biggy",
  "slimmy-2": "slimmy",
  "cigar-cutter-2": "cigar-cutter-extra",
  "initial-2": "initial-cinatic",
  "popote-2": "popote-writing",
  // ligne-2-extra inherits the canonical ligne-2 slug now that the curated
  // 12-variant entry is gone.
  "ligne-2-2": "ligne-2",
  "ligne-2-3": "ligne-2-lighter-case",
  // The pipeline Twiggy claims the canonical `twiggy` slug now that the
  // curated entry is gone.
  "twiggy-2": "twiggy",
  // 20,000 Leagues — keep the original literary title; Vanikoro is part of
  // the theme (the lost expedition ship) but the user prefers the headline.
  "slimmy-20000-lieues-sous-les-mers": "slimmy-20000-leagues",
  "twiggy-20000-lieues-sous-les-mers": "twiggy-20000-leagues",
  "ligne-2-20000-lieues-sous-les-mers": "ligne-2-20000-leagues",
  // Cleaner "Perfect Cling" slug (the original had a "ping" typo).
  "line-2-perfect-ping": "ligne-2-perfect-cling",
  // DC Comics → split the headline product (Lighter Necklace) cleanly.
  "dc-comics": "dc-comics-necklace",
};

const RECATEGORIZE: Record<string, "isqueiros" | "escrita" | "pele" | "acessorios"> = {
  "cigar-cutter": "acessorios",
  "cigar-cutter-extra": "acessorios",
  "cigar-cutter-monogram-1872": "acessorios",
  "ligne-2-lighter-case": "pele",
};

const RECOLLECTION: Record<string, string> = {
  // Ligne 2 ecosystem — only the *canonical* Ligne 2 stays under "Ligne 2".
  // Themed sub-lines move to their own collections so the Lighter grid
  // groups them in dedicated sections.
  "ligne-2": "Ligne 2",
  "ligne-2-lighter-case": "Ligne 2",
  "ligne-2-perfect-cling": "Ligne 2",
  "ligne-2-camo": "Ligne 2",
  "ligne-2-padron": "Ligne 2",
  // Themed lighter sub-lines — each lives only in its own collection so the
  // navbar columns and the catalogue page don't double-list them under the
  // base line they happen to be based on.
  "ligne-2-horse-mane": "Horse Mane",
  "ligne-2-orlinski": "Orlinski",
  "ligne-2-maki-e": "Maki-e",
  "ligne-2-fender": "Fender",
  "twiggy-fender": "Fender",
  "slimmy-fender": "Fender",
  "biggy-fender": "Fender",
  "slimmy-orlinski": "Orlinski",
  "biggy-orlinski": "Orlinski",
  "ligne-2-fuente": "Fuente",
  "le-grand-dupont-fuente": "Fuente",
  "fuente": "Fuente",
  "camera-bag-fuente": "Fuente",
  "ligne-2-fire-x": "Fire X",
  // Géode — dedicated collection across all base lines (Slim 7, Twiggy,
  // Slimmy, Minijet, Ligne 2).
  "slim-7-geode": "Géode",
  "twiggy-geode": "Géode",
  "slimmy-geode": "Géode",
  "minijet-geode": "Géode",
  "ligne-2-geode": "Géode",
  // Monogram 1872 — every "monogram 1872" item lives here, regardless of
  // the base line.
  "le-grand-dupont-monogram-1872": "Monogram 1872",
  "biggy-monogram-1872": "Monogram 1872",
  "ligne-2-monogram-1872": "Monogram 1872",
  "cigar-cutter-monogram-1872": "Monogram 1872",
  "eternity-monogram-1872": "Monogram 1872",
  "2-cigar-case-monogram-1872": "Monogram 1872",
  "le-grand-dupont-monogram": "Monogram 1872",
  // Popote — gathered into its own collection across lines + categories.
  "popote": "Popote",
  "popote-writing": "Popote",
  "le-grand-dupont-popote": "Popote",
  // DC Comics — gathered into its own collection.
  "dc-comics-necklace": "DC Comics",
  "ligne-2-dc-comics": "DC Comics",
  "ligne-2-catwoman": "DC Comics",
  // 20,000 Leagues — the cleaner headline replacing "Vanikoro".
  "slimmy-20000-leagues": "20,000 Leagues Under The Sea",
  "twiggy-20000-leagues": "20,000 Leagues Under The Sea",
  "ligne-2-20000-leagues": "20,000 Leagues Under The Sea",
  // Le Grand cleanup — the curated Le Grand survives (filtered down to two
  // colourways below) under the canonical Le Grand Dupont collection so the
  // legacy "Le Grand" section disappears from the grid.
  "le-grand-dupont": "Le Grand Dupont",
  // Défi family — consolidate XX/X extreme branches into one Défi Extreme.
  "defi-extreme-2": "Défi Extreme",
  "defi-xtreme": "Défi Extreme",
  "defi-xxtreme": "Défi Extreme",
  // Tail-singletons.
  "3-cigar-case-fluo": "3 Cigar Case · Fluo",
  "2-cigar-case-koi-fish": "2 Cigar Case · Koi",
  "atelier-2": "Atelier",
  "firehead-2": "Firehead",
  "accessories": "Acessórios",
  // EN store import — normalize Shopify's kebab-case collection labels
  // into the catalogue's canonical display strings.
  "box-10-refills": "Gas Refills",
  "box-12-refills": "Gas Refills",
  "box-5-refills": "Gas Refills",
  "box-7-refills": "Gas Refills",
  "gas-refill-2": "Gas Refills",
  "cigar-humidor-2": "Humidors",
  "keyring": "Key Holders",
  "keyrings": "Key Holders",
  "keyring-monogram-1872": "Monogram 1872",
  "keyrings-monogram-1872": "Monogram 1872",
  "pen-case-2": "Pen Cases",
  "tie-clip-2": "Tie Clips",
  "money-clip-2": "Money Clips",
  "money-clip-monogram-1872-2": "Monogram 1872",
  "cufflink-monogram-1872": "Monogram 1872",
  "ashtray-2": "Ashtrays",
  "ashtray-monogram-1872-2": "Monogram 1872",
  "ashtray-fire-x-2": "Fire X",
  "cigar-cutter-fire-x-2": "Fire X",
  "cigar-cutter-fender": "Fender",
  "cigar-cutter-monogram-1872-2": "Monogram 1872",
  "2-cigar-case-monogram-1872-2": "Monogram 1872",
  "cigarette-case-monogram-1872": "Monogram 1872",
  // Dragon themed pieces in the EN store.
  "eternity-dragon": "Dragon",
  "d-initial-dragon": "Dragon",
  "2-cigar-case-dragon": "Dragon",
  // Initial / D-Initial — collapse the writing variants under the Initial
  // collection so they don't form a parallel "D-Initial" sub-line.
  "d-initial-2": "Initial",
  "eternity-2": "Eternity",
  "eternity-monogram-1872-2": "Monogram 1872",
  "eternity-fire-x": "Fire X",
  // Singletons across base lines that fall under their themed collection.
  "twiggy-fire-x": "Fire X",
  "ligne-2-6": "Ligne 2",
  "maxijet-2": "Maxijet",
  "ligne-2-fender-2": "Fender",
  "crossbody-fender": "Fender",
  "document-holders-fender": "Fender",
  // www store collection-string normalizations.
  "tie-clip-3": "Tie Clips",
  "cigar-case-3": "Cigar case",
  "lighter-case-2": "Lighter Cases",
  "neo-capsule-3": "Neo Capsule",
  // Themed lighter sub-lines (capitalize / clean shopify-style stubs).
  "ligne-2-joker": "Joker",
  "eternity-joker": "Joker",
  "ligne-2-harley-quinn": "Harley Quinn",
  "eternity-harley-quinn": "Harley Quinn",
  "ligne-2-cohiba-behike": "Cohiba Behike",
  "le-grand-dupont-cohiba-behike": "Cohiba Behike",
  "camera-bag-cohiba-behike": "Cohiba Behike",
  "ligne-1-romeo-y-julieta": "Romeo y Julieta",
  "twiggy-romeo-y-julieta": "Romeo y Julieta",
  "le-grand-dupont-romeo-y-julieta": "Romeo y Julieta",
  "biggy-romeo-y-julieta": "Romeo y Julieta",
  "3-cigar-case-romeo-y-julieta": "Romeo y Julieta",
  "ashtray-romeo-y-julieta": "Romeo y Julieta",
  "liberte-presidence-de-la-republique": "Présidence de la République",
  "eternity-presidence-de-la-republique": "Présidence de la République",
  "d-logo": "D Logo",
};

const RENAME_NAME: Record<string, { pt: string; en: string }> = {
  "slimmy-20000-leagues": { pt: "Slimmy · 20.000 Léguas Submarinas", en: "Slimmy · 20,000 Leagues Under The Sea" },
  "twiggy-20000-leagues": { pt: "Twiggy · 20.000 Léguas Submarinas", en: "Twiggy · 20,000 Leagues Under The Sea" },
  "ligne-2-20000-leagues": { pt: "Ligne 2 · 20.000 Léguas Submarinas", en: "Ligne 2 · 20,000 Leagues Under The Sea" },
  "initial-cinatic": { pt: "Initial Cinatic", en: "Initial Cinatic" },
  "popote-writing": { pt: "Popote · Escrita", en: "Popote · Writing" },
  "ligne-2-lighter-case": { pt: "Ligne 2 · Estojo", en: "Ligne 2 · Lighter Case" },
  "ligne-2-perfect-cling": { pt: "Ligne 2 · Perfect Cling", en: "Ligne 2 · Perfect Cling" },
  "3-cigar-case-fluo": { pt: "Estojo Triplo · Fluo", en: "3 Cigar Case · Fluo" },
  "2-cigar-case-koi-fish": { pt: "Estojo Duplo · Koi", en: "2 Cigar Case · Koi" },
  "atelier-2": { pt: "Atelier", en: "Atelier" },
  "firehead-2": { pt: "Firehead", en: "Firehead" },
  "accessories": { pt: "Acessórios", en: "Accessories" },
  "cigar-cutter-extra": { pt: "Cortador de Charuto", en: "Cigar Cutter" },
  "dc-comics-necklace": {
    pt: "Lighter Necklace · DC Comics",
    en: "Lighter Necklace · DC Comics",
  },
  // Variant labels still say "Defi XXtreme" / "Defi Xtreme" inside these
  // products' descriptors; merge them under the canonical brand spelling so
  // every Défi Extreme card reads consistently.
  "defi-xtreme": { pt: "Défi Extreme", en: "Défi Extreme" },
  "defi-xxtreme": { pt: "Défi Extreme", en: "Défi Extreme" },
  "defi-extreme-2": { pt: "Défi Extreme", en: "Défi Extreme" },
  // The bare-"Popote" SKUs (C16016/17/18 — Ligne 2 family) read as a Ligne
  // 2 Popote on the catalogue card.
  "popote": { pt: "Ligne 2 · Popote", en: "Ligne 2 · Popote" },
};

// Variant filter — when present, only the listed SKUs of that product
// survive. Used for the Le Grand → Le Grand Dupont consolidation where the
// curated `le-grand-dupont` keeps just two colourways (Shiny Black Lacquer
// & Palladium + Sunburst Blue Lacquer & Palladium) per the editorial brief.
const KEEP_VARIANTS: Record<string, Set<string>> = {
  "le-grand-dupont": new Set(["C23780CL", "C23013N"]),
};

// Vanikoro → 20,000 Leagues text rewrite — sweep label strings too, since
// names like "Slimmy · 20000 Lieues sous les mers — Royal Blue" reach the
// cards via variant.name not just product.name.
function rewriteLeaguesText(s: string): string {
  return s
    .replace(/20\.000 L[ée]guas Submarinas/gi, "20.000 Léguas Submarinas")
    .replace(/20000 Lieues sous les mers/gi, "20,000 Leagues Under The Sea")
    .replace(/20\s?000 Lieues sous les mers/gi, "20,000 Leagues Under The Sea")
    .replace(/Vanikoro/gi, "20,000 Leagues Under The Sea");
}

// "Line" → "Ligne" sweep for the Perfect Cling product whose Shopify-
// imported labels still read "Line 2 Perfect Ping".
function rewriteLignePerfectCling(s: string): string {
  return s.replace(/Line 2 Perfect Ping/g, "Ligne 2 · Perfect Cling")
    .replace(/Perfect Ping/g, "Perfect Cling");
}

// Défi family unification — variant labels still read "Defi XXtreme" /
// "Defi Xtreme" inside the consolidated Défi Extreme collection.
function rewriteDefi(s: string): string {
  return s
    .replace(/Defi XXtreme/gi, "Défi Extreme")
    .replace(/D[eé]fi XXtreme/g, "Défi Extreme")
    .replace(/Defi Xtreme/gi, "Défi Extreme")
    .replace(/D[eé]fi Xtreme/g, "Défi Extreme");
}

// Legacy local copy kept for reference; the live order is the imported
// `collectionRank` from lib/collection-order so the navbar (getCollections)
// and the catalogue grid share one source of truth.
const _LEGACY_COLLECTION_ORDER_UNUSED = [
  // Themed lighter sub-lines (collected via RECOLLECTION above).
  "Géode",
  "Popote",
  "Maki-e",
  "Orlinski",
  "Horse Mane",
  "Fender",
  "Fuente",
  "Fire X",
  "Monogram 1872",
  "DC Comics",
  "20,000 Leagues Under The Sea",
  "Casablanca",
  "Game of Thrones",
  "Padrón",
  "Snake Skin",
  "Camo",
  "Dragon",
  "Architecture",
  // Lighter base lines — explicit order per editorial brief.
  "Le Grand Dupont",
  "Ligne 2",
  "Ligne 1",
  "Initial",
  "Initial Cinatic",
  "Biggy",
  "Twiggy",
  "Slimmy",
  "Slim 7",
  "Défi Extreme",
  "Windproof",
  "Minijet",
  "Maxijet",
  "Megajet",
  "Table lighter",
  "Torch",
  "Lighter Necklace",
  // Writing
  "Line D Eternity",
  "Classique",
  "Défi Millennium",
  "Liberté",
  "Eternity",
  "Marker Necklace",
  // Leather goods
  "Lighter Accessories",
  "Atelier",
  "Firehead",
  "Neo Capsule",
  "Camera Bag · Fuente",
  "Pen case",
  // Accessories
  "Cigar cutter",
  "Cigar case",
  "2 cigar case",
  "3 cigar case",
  "3 Cigar Case · Fluo",
  "2 Cigar Case · Koi",
  "Double Cigar Case",
  "Acessórios",
];


function transform(list: readonly SeedProduct[]): SeedProduct[] {
  const out: SeedProduct[] = [];
  for (const p of list) {
    if (DROP_SLUGS.has(p.slug)) continue;
    const newSlug = RENAME_SLUG[p.slug] ?? p.slug;
    const newCategory = RECATEGORIZE[newSlug] ?? p.categorySlug;
    const newCollection = RECOLLECTION[newSlug] ?? p.collection;
    const newName = RENAME_NAME[newSlug] ?? p.name;
    const keep = KEEP_VARIANTS[p.slug];
    const variants = (keep ? p.variants.filter((v) => keep.has(v.sku)) : p.variants).map((v) => ({
      ...v,
      name: {
        pt: rewriteDefi(rewriteLignePerfectCling(rewriteLeaguesText(v.name.pt))),
        en: rewriteDefi(rewriteLignePerfectCling(rewriteLeaguesText(v.name.en))),
      },
    }));
    // After variant filter the product may have no variants — drop it.
    if (variants.length === 0) continue;
    out.push({
      ...p,
      slug: newSlug,
      name: {
        pt: rewriteDefi(rewriteLignePerfectCling(rewriteLeaguesText(newName.pt))),
        en: rewriteDefi(rewriteLignePerfectCling(rewriteLeaguesText(newName.en))),
      },
      categorySlug: newCategory,
      collection: rewriteDefi(rewriteLignePerfectCling(newCollection)),
      variants,
    });
  }
  // Sort by collection rank, then by cheapest variant inside the Géode
  // section so "cheapest → most expensive" is the default browsing order
  // for that themed group.
  const cheapest = (p: SeedProduct) =>
    p.variants.reduce((m, v) => Math.min(m, v.priceCents), Number.MAX_SAFE_INTEGER);
  return out
    .map((p, i) => ({ p, i, rank: collectionRank(p.collection), price: cheapest(p) }))
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      // Inside the Géode section, sort by cheapest variant ascending.
      if (a.p.collection === "Géode") return a.price - b.price;
      return a.i - b.i;
    })
    .map((x) => x.p);
}

async function main() {
  // Clear in FK-safe order (no orders/carts reference these yet in dev).
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.create({
      data: { slug: c.slug, name: c.name, tagline: c.tagline, history: c.history },
    });
    categoryIdBySlug.set(c.slug, row.id);
  }

  const finalProducts = transform(products);
  console.log(
    `Seeding ${finalProducts.length} products (dropped ${products.length - finalProducts.length}).`,
  );

  for (const p of finalProducts) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category for product ${p.slug}`);
    const wwwBody = DESC_OVERRIDES[p.slug];
    const description = wwwBody ? { pt: wwwBody, en: wwwBody } : p.description;
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description,
        history: historyByCollection[p.collection] ?? undefined,
        collection: p.collection,
        image: p.image,
        featured: p.novelty ?? false,
        active: true,
        categoryId,
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            priceCents: v.priceCents,
            currency: v.currency,
            attributes: v.attributes as unknown as Prisma.InputJsonValue,
            images: v.images ?? (v.image ? [v.image] : []),
            stock: 25,
          })),
        },
      },
    });
  }

  const [cats, prods, vars] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
  ]);
  console.log(`Seeded: ${cats} categories, ${prods} products, ${vars} variants.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
