// Post-mortem after the run that died writing the audit log — recreate the
// AdminAction entry so the batch is traceable + verify the actual state of
// ProductVariant.images in Neon.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const total = await prisma.productVariant.count();
  const withImages = await prisma.productVariant.count({ where: { images: { isEmpty: false } } });
  const withStarbrands = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `select count(*)::bigint as count from "ProductVariant" where exists (select 1 from unnest(images) as u where u like 'https://images.starbrands.pt/%')`,
  );
  const starbrandsCount = Number(withStarbrands[0]?.count ?? BigInt(0));

  // Contar TOTAL de URLs (bruto) e de URLs Starbrands por unnest
  const stats = await prisma.$queryRawUnsafe<{ total: bigint; starbrands: bigint }[]>(
    `select
       count(*)::bigint as total,
       count(*) filter (where u like 'https://images.starbrands.pt/%')::bigint as starbrands
     from "ProductVariant" v, unnest(v.images) as u`,
  );
  console.log("Estado actual de ProductVariant.images:");
  console.log(`  Total variants:                 ${total}`);
  console.log(`  Com imagens:                    ${withImages}`);
  console.log(`  Com pelo menos 1 URL Starbrands: ${starbrandsCount}`);
  console.log(`  URLs somadas:                   ${Number(stats[0]?.total ?? BigInt(0))}`);
  console.log(`  URLs Starbrands:                ${Number(stats[0]?.starbrands ?? BigInt(0))}`);
  console.log(`  URLs locais (nossa cauda):      ${Number(stats[0]?.total ?? BigInt(0)) - Number(stats[0]?.starbrands ?? BigInt(0))}`);

  await prisma.adminAction.create({
    data: {
      entityType: "UPLOAD_BATCH",
      action: "IMAGES_APPLY",
      entityId: "std-links-images",
      note: `ST_DUPONT_LINKS-IMAGENS aplicado: 565 variants — 185 add + 114 grow + 266 slot-replace (merge posicional, cauda local preservada)`,
    },
  });
  console.log("\nAudit log criado.");
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
