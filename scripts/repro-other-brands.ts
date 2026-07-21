// Repros the queries OtherBrandsView runs, so a Prisma-level error
// surfaces here in a readable stack (not as a Next error digest).
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  console.log("1) count(where={})");
  console.log("   ->", await prisma.otherBrandItem.count({}));

  console.log("2) findMany (page 1)");
  const rows = await prisma.otherBrandItem.findMany({ orderBy: { updatedAt: "desc" }, take: 50 });
  console.log("   ->", rows.length, "rows; first sku:", rows[0]?.sku);

  console.log("3) groupBy _count._all");
  const b = await prisma.otherBrandItem.groupBy({ by: ["brand"], _count: { _all: true }, orderBy: { brand: "asc" } });
  console.log("   ->", b.length, "brands; sample:", b.slice(0, 3));

  console.log("4) count facets");
  console.log("   ->", await prisma.otherBrandItem.count());
  console.log("   -> out of stock:", await prisma.otherBrandItem.count({ where: { stock: { lte: 0 } } }));
  console.log("   -> low:", await prisma.otherBrandItem.count({ where: { stock: { gt: 0, lte: 5 } } }));

  console.log("5) valuation");
  const val = await prisma.otherBrandItem.findMany({
    where: { stock: { gt: 0 }, pvpCents: { not: null } },
    select: { stock: true, pvpCents: true },
  });
  const total = val.reduce((s, r) => s + r.stock * (r.pvpCents ?? 0), 0);
  console.log("   ->", val.length, "valued rows; total cents:", total);
}

main().then(() => process.exit(0)).catch((e) => { console.error("FAILED:", e); process.exit(1); });
