// Seeds the database from the corrected 2025/2026 catalogue in lib/catalog.ts.
// Idempotent: clears catalog tables then recreates. Run: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../app/generated/prisma/client";
import { categories, products, historyByCollection } from "./seed-data";
import type { SeedProduct } from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// --- Catalogue cleanup --------------------------------------------------
// Applied at seed time so the seed-data.ts source stays as a raw record of
// what was imported from us.st-dupont.com — these maps capture the
// editorial overrides (dropouts, renames, category fixes, ordering).

// Products with no usable photo on disk (audit run 2026-06-06): drop so
// catalogue grids never render an empty-tile placeholder.
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
  // Generic "writing-instruments-*" tiles that don't have a real model line
  "writing-instrument",
  "writing-instruments",
]);

// Slug renames — applied AFTER the drop pass. The "-2" / "-3" suffixes were
// the pipeline's collision-avoidance against existing curated slugs; once
// the placeholder originals are dropped, the suffixed product can claim
// the original slug.
const RENAME_SLUG: Record<string, string> = {
  "biggy-2": "biggy",
  "slimmy-2": "slimmy",
  "cigar-cutter-2": "cigar-cutter",
  // initial-2 is the Initial *Cinatic* lighter, NOT the writing Initial.
  "initial-2": "initial-cinatic",
  // popote-2 is the writing Popote (FP + roller); popote (lighters) keeps
  // its slug so its URL stays stable.
  "popote-2": "popote-writing",
  // The Ligne 2 SKUs my pipeline added under -2/-3 are legitimately Ligne 2
  // — but with my own colourways. Keep them as siblings of the curated
  // ligne-2 entry; the catalogue page groups by `collection` so both
  // render in the same Ligne 2 section.
  "ligne-2-2": "ligne-2-extra",
  "ligne-2-3": "ligne-2-lighter-case",
  "twiggy-2": "twiggy-extra",
  // Vanikoro is the lost expedition ship in 20,000 Leagues — a cleaner
  // brand-name for the collection than the verbatim French title.
  "slimmy-20000-lieues-sous-les-mers": "slimmy-vanikoro",
  "twiggy-20000-lieues-sous-les-mers": "twiggy-vanikoro",
  "ligne-2-20000-lieues-sous-les-mers": "ligne-2-vanikoro",
};

// Category corrections — cigar accessories are not "Lighters" even when the
// US site cross-lists them under that collection.
const RECATEGORIZE: Record<string, "isqueiros" | "escrita" | "pele" | "acessorios"> = {
  "cigar-cutter": "acessorios",
  "cigar-cutter-monogram-1872": "acessorios",
  "ligne-2-lighter-case": "pele",
};

// Collection rewrites — normalise to canonical line names so the catalogue
// page's collection-grouping puts every Ligne 2 (and Vanikoro, Géode, etc.)
// in one section instead of splitting on tiny string differences.
const RECOLLECTION: Record<string, string> = {
  "ligne-2-extra": "Ligne 2",
  "ligne-2-lighter-case": "Ligne 2",
  "slimmy-vanikoro": "Vanikoro",
  "twiggy-vanikoro": "Vanikoro",
  "ligne-2-vanikoro": "Vanikoro",
  "twiggy-extra": "Twiggy",
  "popote-writing": "Popote",
  "initial-cinatic": "Initial Cinatic",
  // Accessory tail-singletons: normalise the noisy Shopify-derived names.
  "3-cigar-case-fluo": "3 Cigar Case · Fluo",
  "2-cigar-case-koi-fish": "2 Cigar Case · Koi",
  "atelier-2": "Atelier",
  "firehead-2": "Firehead",
  "accessories": "Acessórios",
};

// Product display-name rewrites for Vanikoro (the slugs alone don't carry
// the surface label — the card title comes from `name.{pt|en}`).
const RENAME_NAME: Record<string, { pt: string; en: string }> = {
  "slimmy-vanikoro": { pt: "Slimmy · Vanikoro", en: "Slimmy · Vanikoro" },
  "twiggy-vanikoro": { pt: "Twiggy · Vanikoro", en: "Twiggy · Vanikoro" },
  "ligne-2-vanikoro": { pt: "Ligne 2 · Vanikoro", en: "Ligne 2 · Vanikoro" },
  "initial-cinatic": { pt: "Initial Cinatic", en: "Initial Cinatic" },
  "popote-writing": { pt: "Popote · Escrita", en: "Popote · Writing" },
  "ligne-2-extra": { pt: "Ligne 2", en: "Ligne 2" },
  "ligne-2-lighter-case": { pt: "Ligne 2 · Estojo", en: "Ligne 2 · Lighter Case" },
  "twiggy-extra": { pt: "Twiggy", en: "Twiggy" },
  "3-cigar-case-fluo": { pt: "Estojo Triplo · Fluo", en: "3 Cigar Case · Fluo" },
  "2-cigar-case-koi-fish": { pt: "Estojo Duplo · Koi", en: "2 Cigar Case · Koi" },
  "atelier-2": { pt: "Atelier", en: "Atelier" },
  "firehead-2": { pt: "Firehead", en: "Firehead" },
  "accessories": { pt: "Acessórios", en: "Accessories" },
};

// Walk variant labels too and rewrite "20.000 Léguas" / "20000 Lieues" →
// "Vanikoro" so the per-card SKU title reads cleanly.
function rewriteVanikoroText(s: string): string {
  return s
    .replace(/20\.000 L[ée]guas Submarinas/gi, "Vanikoro")
    .replace(/20000 Lieues sous les mers/gi, "Vanikoro");
}

// Collection display order. Anything not listed sorts after, preserving
// original seed order. Lighters first, then writing, then leather goods,
// then accessories. Within lighters, Windproof + Défi Extreme adjacent
// per the editorial brief.
const COLLECTION_ORDER = [
  // Lighters — core lines first
  "Ligne 2",
  "Le Grand Dupont",
  "Slim 7",
  "Twiggy",
  "Slimmy",
  "Biggy",
  "Maxijet",
  "Minijet",
  "Megajet",
  "Windproof",
  "Défi Extreme",
  "Défi XXtreme",
  "Défi Xtreme",
  // Themed lighter sub-lines
  "Popote",
  "Géode",
  "Orlinski",
  "Maki-e",
  "Horse Mane",
  "DC Comics",
  "Vanikoro",
  "Fuente",
  "Fender",
  "Casablanca",
  "Game of Thrones",
  "Padrón",
  "Snake Skin",
  "Camo",
  "Fire X",
  "Dragon",
  "Monogram 1872",
  "Initial",
  "Initial Cinatic",
  "Lighter Necklace",
  "Torch",
  "Architecture",
  "Line 2 Perfect Cling",
  // Writing
  "Line D Eternity",
  "Classique",
  "Défi Millennium",
  "Liberté",
  "Eternity",
  "Marker Necklace",
  // Leather goods (grouped by line)
  "Lighter Accessories",
  "Atelier",
  "Firehead",
  "Neo Capsule",
  "Camera Bag · Fuente",
  "Pen case",
  // Accessories (cigar core lines first, themed last)
  "Cigar cutter",
  "Cigar case",
  "2 cigar case",
  "3 cigar case",
  "3 Cigar Case · Fluo",
  "2 Cigar Case · Koi",
  "Double Cigar Case",
  "Acessórios",
];

function collectionRank(c: string): number {
  const i = COLLECTION_ORDER.indexOf(c);
  return i === -1 ? COLLECTION_ORDER.length : i;
}

function transform(list: readonly SeedProduct[]): SeedProduct[] {
  const out: SeedProduct[] = [];
  for (const p of list) {
    if (DROP_SLUGS.has(p.slug)) continue;
    const newSlug = RENAME_SLUG[p.slug] ?? p.slug;
    const newCategory = RECATEGORIZE[newSlug] ?? p.categorySlug;
    const newCollection = RECOLLECTION[newSlug] ?? p.collection;
    const newName = RENAME_NAME[newSlug] ?? p.name;
    out.push({
      ...p,
      slug: newSlug,
      name: {
        pt: rewriteVanikoroText(newName.pt),
        en: rewriteVanikoroText(newName.en),
      },
      categorySlug: newCategory,
      collection: newCollection,
      variants: p.variants.map((v) => ({
        ...v,
        name: {
          pt: rewriteVanikoroText(v.name.pt),
          en: rewriteVanikoroText(v.name.en),
        },
      })),
    });
  }
  // Stable sort by collection rank — products with the same rank keep their
  // original relative order so curated entries stay above pipeline-added
  // ones within a line.
  return out
    .map((p, i) => ({ p, i, rank: collectionRank(p.collection) }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
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
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
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
