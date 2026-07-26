// Total de imagens no catálogo do site — soma de ProductVariant.images.length
// através de todas as variants, mais quebras úteis (com/sem, dupont-only, etc.).
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const variants = await prisma.productVariant.findMany({
    select: {
      id: true, sku: true, images: true, active: true, status: true,
      product: { select: { slug: true } },
    },
  });

  const totalVariants = variants.length;
  const withImages = variants.filter((v) => v.images.length > 0);
  const withoutImages = variants.filter((v) => v.images.length === 0);
  const totalImages = variants.reduce((s, v) => s + v.images.length, 0);
  const uniqueImages = new Set(variants.flatMap((v) => v.images)).size;

  const publishedVariants = variants.filter(
    (v) => v.active && v.status !== "DESCONTINUADO" && v.product?.slug !== "unmapped-inventory",
  );
  const publishedWithImages = publishedVariants.filter((v) => v.images.length > 0);
  const publishedImagesTotal = publishedVariants.reduce((s, v) => s + v.images.length, 0);

  console.log("========================================");
  console.log("Imagens no catálogo do site (estado actual)");
  console.log("========================================");
  console.log(`Variants no total:                    ${totalVariants}`);
  console.log(`  · com imagens:                      ${withImages.length}`);
  console.log(`  · sem imagens:                      ${withoutImages.length}`);
  console.log(`Imagens somadas (bruto, com repetidas): ${totalImages}`);
  console.log(`Imagens únicas (URL distinta):         ${uniqueImages}`);
  console.log("");
  console.log(`Publicadas no site (active · not DESCONTINUADO · com produto real):`);
  console.log(`  · variants:                          ${publishedVariants.length}`);
  console.log(`  · com imagens:                       ${publishedWithImages.length}`);
  console.log(`  · imagens somadas:                   ${publishedImagesTotal}`);

  // Histograma — quantas variants têm N imagens
  const hist = new Map<number, number>();
  for (const v of variants) hist.set(v.images.length, (hist.get(v.images.length) ?? 0) + 1);
  const sortedBuckets = [...hist.entries()].sort((a, b) => a[0] - b[0]);
  console.log("\nDistribuição (nº imagens → nº variants):");
  for (const [n, c] of sortedBuckets) console.log(`  ${String(n).padStart(3)} img${n === 1 ? " " : "s"}: ${c}`);

  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
