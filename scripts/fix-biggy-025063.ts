// One-shot: SKU 025063 was mis-filed on Neon as a slimmy-orlinski
// variant. It is actually the Biggy Orlinski Laranja (€506, not €414).
// Seed-data.ts is already correct — this pushes the move to Neon so
// the live PDP/card render the right title, price and images without
// a destructive full re-seed.
//
// Dry-run by default; pass --apply to write.
//
//   $env:DATABASE_URL = "<neon>"
//   npx tsx scripts/fix-biggy-025063.ts            # preview
//   npx tsx scripts/fix-biggy-025063.ts --apply    # commit
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const APPLY = process.argv.includes("--apply");
const SKU = "025063";
const TARGET_SLUG = "biggy-orlinski";
const TARGET_NAME = { pt: "Biggy · Orlinski — Laranja", en: "Biggy · Orlinski — Orange" };
const TARGET_PRICE_CENTS = 50600;
const TARGET_IMAGE = "/products/slimmy-orlinski/025063.webp";
const TARGET_IMAGES = [
  "/products/slimmy-orlinski/025063.webp",
  "/products/slimmy-orlinski/025063-2.webp",
  "/products/slimmy-orlinski/025063-3.webp",
  "/products/slimmy-orlinski/025063-4.webp",
];

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  const target = await prisma.product.findUnique({
    where: { slug: TARGET_SLUG },
    select: { id: true, slug: true },
  });
  if (!target) {
    console.error(`Target product not found: ${TARGET_SLUG}`);
    process.exit(1);
  }

  const variant = await prisma.productVariant.findUnique({
    where: { sku: SKU },
    select: {
      id: true,
      productId: true,
      name: true,
      priceCents: true,
      images: true,
      product: { select: { slug: true } },
    },
  });
  if (!variant) {
    console.error(`Variant not found: SKU ${SKU}`);
    process.exit(1);
  }

  console.log(`SKU ${SKU} currently under product: ${variant.product.slug}`);
  console.log(`  name:  ${JSON.stringify(variant.name)}`);
  console.log(`  price: ${variant.priceCents} cents`);
  console.log(`  images (${variant.images.length}):`);
  for (const i of variant.images) console.log(`    ${i}`);
  console.log("");
  console.log(`Will move to: ${TARGET_SLUG}`);
  console.log(`  name:  ${JSON.stringify(TARGET_NAME)}`);
  console.log(`  price: ${TARGET_PRICE_CENTS} cents`);
  console.log(`  images (${TARGET_IMAGES.length}):`);
  for (const i of TARGET_IMAGES) console.log(`    ${i}`);

  if (!APPLY) {
    console.log("\nDry-run only — pass --apply to commit.");
    await prisma.$disconnect();
    return;
  }

  await prisma.productVariant.update({
    where: { id: variant.id },
    data: {
      productId: target.id,
      name: TARGET_NAME,
      priceCents: TARGET_PRICE_CENTS,
      images: TARGET_IMAGES,
    },
  });
  console.log("\nApplied.");

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
