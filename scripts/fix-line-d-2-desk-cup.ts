// One-shot: SKU 007110 was mis-labelled as "Line D Eternity · Lapiseira"
// (mechanical pencil). It is a leather desk pen cup — "Copo de
// Secretária". This fixes the product name AND the single variant name
// on Neon so both the catalogue card and the PDP h1 read correctly.
// Category is corrected at render time via CATEGORY_OVERRIDES in
// lib/catalog.ts.
//
// Dry-run by default; pass --apply to write.
//
//   $env:DATABASE_URL = "<neon>"
//   npx.cmd tsx scripts/fix-line-d-2-desk-cup.ts            # preview
//   npx.cmd tsx scripts/fix-line-d-2-desk-cup.ts --apply    # commit
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const APPLY = process.argv.includes("--apply");
const PRODUCT_SLUG = "line-d-2-pencil";
const NEW_PRODUCT_NAME = {
  pt: "Line D Eternity · Copo de Secretária",
  en: "Line D Eternity · Desk Cup",
};
const SKU = "007110";
const NEW_VARIANT_NAME = {
  pt: "Line D Eternity · Copo de Secretária",
  en: "Line D Eternity · Desk Cup",
};

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    select: { id: true, name: true, variants: { where: { sku: SKU }, select: { id: true, name: true } } },
  });
  if (!product) {
    console.error(`Product not found: ${PRODUCT_SLUG}`);
    process.exit(1);
  }
  const variant = product.variants[0];
  if (!variant) {
    console.error(`Variant not found on ${PRODUCT_SLUG}: SKU ${SKU}`);
    process.exit(1);
  }

  console.log(`Product ${PRODUCT_SLUG}`);
  console.log(`  current name: ${JSON.stringify(product.name)}`);
  console.log(`  new name:     ${JSON.stringify(NEW_PRODUCT_NAME)}`);
  console.log(`Variant ${SKU}`);
  console.log(`  current name: ${JSON.stringify(variant.name)}`);
  console.log(`  new name:     ${JSON.stringify(NEW_VARIANT_NAME)}`);

  if (!APPLY) {
    console.log("\nDry-run only — pass --apply to commit.");
    await prisma.$disconnect();
    return;
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { name: NEW_PRODUCT_NAME },
  });
  await prisma.productVariant.update({
    where: { id: variant.id },
    data: { name: NEW_VARIANT_NAME },
  });
  console.log("\nApplied.");

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
