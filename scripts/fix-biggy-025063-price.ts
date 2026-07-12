// One-shot: Biggy Orlinski Laranja (SKU 025063) was priced at €506
// on Neon; correct price is €460. Aligns Neon with seed-data.ts.
//
// Dry-run by default; pass --apply to write.
//
//   $env:DATABASE_URL = "<neon>"
//   npx.cmd tsx scripts/fix-biggy-025063-price.ts            # preview
//   npx.cmd tsx scripts/fix-biggy-025063-price.ts --apply    # commit
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const APPLY = process.argv.includes("--apply");
const SKU = "025063";
const NEW_PRICE_CENTS = 46000;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  const v = await prisma.productVariant.findUnique({
    where: { sku: SKU },
    select: { id: true, priceCents: true, name: true },
  });
  if (!v) {
    console.error(`Variant not found: SKU ${SKU}`);
    process.exit(1);
  }
  console.log(`SKU ${SKU}  ${JSON.stringify(v.name)}`);
  console.log(`  price: ${v.priceCents} cents  →  ${NEW_PRICE_CENTS} cents`);

  if (!APPLY) {
    console.log("\nDry-run only — pass --apply to commit.");
    await prisma.$disconnect();
    return;
  }
  await prisma.productVariant.update({
    where: { id: v.id },
    data: { priceCents: NEW_PRICE_CENTS },
  });
  console.log("\nApplied.");
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
