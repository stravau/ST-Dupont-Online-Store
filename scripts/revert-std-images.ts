// Reverte a variant.images de refs específicas ao estado pré-Excel:
// para cada ref, apaga as URLs Starbrands e volta a pôr APENAS os
// ficheiros locais WebP que existiam em public/products/.
//
// Ordem final da lista = ordem de descoberta dos ficheiros:
//   1º slot: <num>.webp (main)
//   depois: <num>-2.webp, <num>-3.webp, … (numerados por ordem)
//   depois: <num>_2.webp, <num>_3.webp, … (variante de nome com _)
//
// Passa as refs via argv (uma ou várias, com ou sem prefixo STD).
// Passa --apply para gravar; sem isso é dry-run.
//
// Ex.:
//   npx tsx scripts/revert-std-images.ts STD007107 STD020845 STD040841 STD1AX153GN2 STD1AX683UD1
//   npx tsx scripts/revert-std-images.ts STD007107 --apply
import "dotenv/config";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const PUBLIC_DIR = "c:/Users/Utilizador/ST-Dupont-Online-Store/public";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const refs = args.filter((a) => a.toUpperCase().startsWith("STD") || /^[A-Z0-9]/.test(a));
if (!refs.length) {
  console.error("Uso: npx tsx scripts/revert-std-images.ts <REF1> [REF2 …] [--apply]");
  process.exit(1);
}

function candidateSkus(ref: string): string[] {
  const tail = ref.replace(/^STD/i, "");
  const out = new Set<string>([tail, ref]);
  if (/^000\d{3}$/.test(tail)) out.add("9" + tail.slice(1));
  return [...out];
}

// Para uma ref, encontra TODOS os ficheiros locais que aparentam ser
// as suas imagens: <num>.webp (slot 0), <num>-N.webp (slot N+1), e o
// mesmo padrão com underscore. Retorna paths relativos à web.
function findLocalImagesForRef(ref: string): string[] {
  const num = ref.replace(/^STD/i, "");
  const productsDir = path.join(PUBLIC_DIR, "products");
  if (!existsSync(productsDir)) return [];
  const found: { web: string; sortKey: number }[] = [];
  for (const d of readdirSync(productsDir)) {
    const subdir = path.join(productsDir, d);
    let files: string[] = [];
    try { files = readdirSync(subdir); } catch { continue; }
    for (const f of files) {
      // Match <num>.webp, <num>-N.webp, <num>_N.webp
      const re = new RegExp(`^${num.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[-_](\\d+))?\\.webp$`, "i");
      const m = f.match(re);
      if (!m) continue;
      const n = m[1] ? parseInt(m[1], 10) : 1; // 1 = main
      found.push({ web: `/products/${d}/${f}`, sortKey: n });
    }
  }
  found.sort((a, b) => a.sortKey - b.sortKey);
  return found.map((x) => x.web);
}

async function main() {
  console.log(`Refs a reverter: ${refs.length}`);
  console.log(`Modo: ${APPLY ? "APPLY (grava)" : "DRY-RUN"}\n`);

  interface Plan { ref: string; sku: string; variantId: string; oldImages: string[]; newImages: string[]; }
  const plan: Plan[] = [];
  const missing: string[] = [];
  const notInDb: string[] = [];

  for (const rawRef of refs) {
    const locals = findLocalImagesForRef(rawRef);
    if (!locals.length) { missing.push(rawRef); continue; }

    // Match variant by candidate SKUs
    let variant = null;
    for (const c of candidateSkus(rawRef)) {
      const v = await prisma.productVariant.findFirst({
        where: { sku: c },
        select: { id: true, sku: true, images: true },
      });
      if (v) { variant = v; break; }
    }
    if (!variant) { notInDb.push(rawRef); continue; }

    plan.push({
      ref: rawRef,
      sku: variant.sku,
      variantId: variant.id,
      oldImages: variant.images ?? [],
      newImages: locals,
    });
  }

  console.log(`Planos: ${plan.length}   sem ficheiro local: ${missing.length}   sem variant na DB: ${notInDb.length}\n`);

  for (const p of plan) {
    console.log(`  ${p.ref}  →  variant ${p.sku}`);
    console.log(`    antes (${p.oldImages.length}): ${p.oldImages.slice(0, 3).join(" · ")}${p.oldImages.length > 3 ? " …" : ""}`);
    console.log(`    depois (${p.newImages.length}): ${p.newImages.join(" · ")}`);
  }
  if (missing.length) console.log(`\nSem ficheiro local (não é possível reverter): ${missing.join(", ")}`);
  if (notInDb.length) console.log(`Sem variant na DB (verifica a ref): ${notInDb.join(", ")}`);

  if (!APPLY) {
    console.log("\nDry-run — corre com --apply para gravar.");
    await prisma.$disconnect();
    return;
  }

  let done = 0, failed = 0;
  for (const p of plan) {
    try {
      await prisma.productVariant.update({ where: { id: p.variantId }, data: { images: p.newImages } });
      done++;
    } catch (e) {
      failed++;
      console.error(`  falhou ${p.sku}: ${(e as Error).message.slice(0, 160)}`);
    }
  }
  await prisma.adminAction.create({
    data: {
      entityType: "UPLOAD_BATCH",
      action: "IMAGES_REVERT",
      entityId: "std-links-images",
      note: `Revertidas ${done} refs ao estado local WebP: ${plan.map((p) => p.sku).join(", ")}`,
    },
  });
  console.log(`\nRevertidas: ${done}   falhadas: ${failed}`);

  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
