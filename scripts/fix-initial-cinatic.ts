// One-shot: `initial-2` (SKU 020845) and `initial-3` (020840/020841/
// 020844) are Initial Cinatic *lighters* — the description explicitly
// says "Isqueiro Initial, decoração em guilloché cinético". Neon has
// them under collection "Initial" and, for initial-3, category
// "escrita". Move both products to collection "Initial Cinatic";
// initial-3's categoryId also flips to the isqueiros category.
//
// Dry-run by default; pass --apply to write.
//
//   $env:DATABASE_URL = "<neon>"
//   npx.cmd tsx scripts/fix-initial-cinatic.ts            # preview
//   npx.cmd tsx scripts/fix-initial-cinatic.ts --apply    # commit
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const APPLY = process.argv.includes("--apply");
const NEW_COLLECTION = "Initial Cinatic";
const TARGETS = [
  { slug: "initial-2", moveTo: "isqueiros" as const },
  { slug: "initial-3", moveTo: "isqueiros" as const },
];

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  const isqueirosCat = await prisma.category.findUnique({
    where: { slug: "isqueiros" },
    select: { id: true },
  });
  if (!isqueirosCat) {
    console.error("Category 'isqueiros' not found on Neon.");
    process.exit(1);
  }

  for (const t of TARGETS) {
    const p = await prisma.product.findUnique({
      where: { slug: t.slug },
      select: { id: true, collection: true, category: { select: { slug: true } } },
    });
    if (!p) {
      console.warn(`  MISSING ${t.slug}`);
      continue;
    }
    console.log(`${t.slug}`);
    console.log(`  collection: "${p.collection}" → "${NEW_COLLECTION}"`);
    console.log(`  category:   "${p.category.slug}" → "${t.moveTo}"`);
    if (APPLY) {
      await prisma.product.update({
        where: { id: p.id },
        data: { collection: NEW_COLLECTION, categoryId: isqueirosCat.id },
      });
    }
  }
  if (!APPLY) console.log("\nDry-run only — pass --apply to commit.");
  else console.log("\nApplied.");
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
