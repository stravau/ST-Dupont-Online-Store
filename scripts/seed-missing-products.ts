// Additive Neon reconciliation. Runs the same seed-data transform as
// prisma/seed.ts, but INSERTS ONLY the products whose slug is not yet
// in Neon. Never deletes, never overwrites existing rows — safe to
// run against a Neon DB that already carries fresh ECI stock + PVP
// data.
//
// Use when the bundle-splits (line-d-2-*, line-d-3-*, initial-3, …)
// or any other newly-added seed products haven't landed on Neon
// because the initial destructive seed ran before they were authored.
//
// Dry-run by default; --apply to write.
//
//   $env:DATABASE_URL = "<neon>"
//   npx.cmd tsx scripts/seed-missing-products.ts            # preview
//   npx.cmd tsx scripts/seed-missing-products.ts --apply    # commit
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../app/generated/prisma/client";

// Reuse the seed's transform logic + data by importing directly.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — accessing the private helpers by direct import.
import { products } from "../prisma/seed-data";
import ECI_OVERLAY_JSON from "../prisma/eci-overlay.generated.json";
import DESC_OVERRIDES_RAW from "../prisma/description-overrides.json";

// Copy of transform() from prisma/seed.ts — self-contained so we
// don't have to expose the seed's internals. Import the required
// helper maps from the same files seed.ts uses.
import { BUNDLE_SPLITS } from "../prisma/bundle-splits.generated";
// (We rely on the compiler to keep the local transform in sync with
// prisma/seed.ts; if seed.ts evolves, update the copy below.)

const APPLY = process.argv.includes("--apply");
const ECI_OVERLAY = ECI_OVERLAY_JSON as Record<string, { ean: string | null; priceCents: number | null }>;
const DESC_OVERRIDES = DESC_OVERRIDES_RAW as Record<string, string>;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Minimal transform — copy of the split-only path from prisma/seed.ts.
// We only need the bundle-split children; every other product either
// already exists in Neon (from the earlier destructive seed) or would
// have been inserted then.
interface SplitPart {
  slug: string;
  name: { pt: string; en: string };
  collection?: string;
  prefixes?: string[];
  skus?: string[];
}
type SeedProduct = (typeof products)[number];

const SPLIT_PRODUCT: Record<string, SplitPart[]> = { ...BUNDLE_SPLITS };

function transformSplitsOnly(list: readonly SeedProduct[]): SeedProduct[] {
  const out: SeedProduct[] = [];
  for (const p of list) {
    const split = SPLIT_PRODUCT[p.slug];
    if (!split) continue;
    const assigned = new Set<string>();
    for (const part of split) {
      const partVariants = p.variants.filter((v) => {
        if (assigned.has(v.sku)) return false;
        const hit = part.skus
          ? part.skus.includes(v.sku)
          : (part.prefixes ?? []).some((pre) => v.sku.toUpperCase().startsWith(pre.toUpperCase()));
        if (hit) { assigned.add(v.sku); return true; }
        return false;
      });
      if (partVariants.length === 0) continue;
      out.push({
        ...p,
        slug: part.slug,
        name: part.name,
        collection: part.collection ?? p.collection,
        variants: partVariants.map((v) => ({
          ...v,
          name: v.attributes?.color
            ? {
                pt: `${part.name.pt} — ${v.attributes.color.label.pt}`,
                en: `${part.name.en} — ${v.attributes.color.label.en}`,
              }
            : part.name,
        })),
      });
    }
  }
  return out;
}

(async () => {
  const existing = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map((r) => r.slug),
  );
  console.log(`Neon holds ${existing.size} products currently.`);

  const splitChildren = transformSplitsOnly(products);
  const missing = splitChildren.filter((p) => !existing.has(p.slug));
  console.log(`Bundle-split children generated: ${splitChildren.length}`);
  console.log(`Missing from Neon: ${missing.length}`);

  if (missing.length === 0) {
    console.log("Nothing to do.");
    await prisma.$disconnect();
    return;
  }

  const cats = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catIdBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  for (const p of missing) {
    const catId = catIdBySlug.get(p.categorySlug);
    if (!catId) {
      console.warn(`  · SKIP ${p.slug} — no category "${p.categorySlug}"`);
      continue;
    }
    console.log(`  + ${p.slug}  (${p.variants.length} variant${p.variants.length === 1 ? "" : "s"})`);
    if (!APPLY) continue;
    const wwwBody = DESC_OVERRIDES[p.slug];
    const description = wwwBody ? { pt: wwwBody, en: wwwBody } : p.description;
    try {
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          description,
          collection: p.collection,
          image: p.image,
          featured: p.novelty ?? false,
          active: true,
          categoryId: catId,
          variants: {
            create: p.variants.map((v) => {
              const o = ECI_OVERLAY[v.sku];
              return {
                sku: v.sku,
                name: v.name,
                priceCents: o?.priceCents ?? v.priceCents,
                currency: v.currency,
                attributes: v.attributes as unknown as Prisma.InputJsonValue,
                images: v.images ?? (v.image ? [v.image] : []),
                stock: 25,
                // EAN left null on additive insert — the ECI overlay
                // may point the SKU at an EAN that's already claimed
                // by an orphan row from the earlier ECI import, and
                // ProductVariant.ean has a UNIQUE constraint. Next
                // ECI import will re-sync EANs onto this variant
                // (it prefers real variants over orphans on match).
                ean: null,
              };
            }),
          },
        },
      });
    } catch (e) {
      console.error(`  · FAILED ${p.slug}:`);
      console.error(e);
    }
  }

  const after = await prisma.product.count();
  console.log(`\nProducts in Neon after: ${after}`);
  if (!APPLY) console.log("Dry-run only — pass --apply to commit.");
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
