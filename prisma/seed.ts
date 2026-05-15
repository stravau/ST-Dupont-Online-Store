// Seeds the database from the corrected 2025/2026 catalogue in lib/catalog.ts.
// Idempotent: clears catalog tables then recreates. Run: npm run db:seed
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { categories, products } from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear in FK-safe order (no orders/carts reference these yet in dev).
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.create({
      data: { slug: c.slug, name: c.name, tagline: c.tagline },
    });
    categoryIdBySlug.set(c.slug, row.id);
  }

  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category for product ${p.slug}`);
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
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
