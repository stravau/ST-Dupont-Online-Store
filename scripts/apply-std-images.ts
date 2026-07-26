// Apply the ST_DUPONT_LINKS-IMAGENS.xlsx to ProductVariant.images using a
// POSITIONAL MERGE (não substitui tudo, nunca encolhe):
//   final[i] = excel[i]  se o Excel tem imagem na posição i
//              nossa[i]  senão (mantém a nossa cauda)
//
// Regra em prosa: onde o Excel oferece uma foto (main + urls extra por ordem),
// essa entra no lugar. As posições que o Excel deixa em branco, ou para além
// do fim da lista do Excel, ficam com a foto que já tínhamos. Nada se perde.
//
// Exemplos:
//   Excel 3 imgs, nossa 4 imgs  →  [excel0, excel1, excel2, nossa3]
//   Excel 4 imgs, nossa 3 imgs  →  [excel0, excel1, excel2, excel3]
//   Excel 3 imgs, nossa 0 imgs  →  [excel0, excel1, excel2]         (add)
//   Excel 0 imgs, nossa 3 imgs  →  [nossa0, nossa1, nossa2]         (no-op)
//
// Behaviour:
//   • 565 refs → 565 variants (100% match confirmed by the cross-ref script).
//   • Match by STD-stripped SKU only (nunca por EAN aqui — defensivo).
//   • Product.image / product.name / etc. NÃO são tocados.
//
// Usage:
//   npx tsx scripts/apply-std-images.ts                # dry-run (default)
//   npx tsx scripts/apply-std-images.ts --apply        # commit
import "dotenv/config";
import xlsx from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const XLSX_PATH = process.argv.find((a) => a.endsWith(".xlsx")) ?? "C:/Users/UTILIZ~1/AppData/Local/Temp/std-links.xlsx";
const APPLY = process.argv.includes("--apply");

// Same STD-strip helper the rest of the codebase uses.
function candidateSkus(ref: string): string[] {
  const tail = ref.replace(/^STD/i, "");
  const out = new Set<string>([tail, ref]);
  if (/^000\d{3}$/.test(tail)) out.add("9" + tail.slice(1));
  return [...out];
}

function collectImages(row: unknown[]): string[] {
  const out: string[] = [];
  // col 4 = main image; cols 5,7,9,... = additional url_N (col 6,8,10,... are ids we ignore)
  const main = row[4];
  if (typeof main === "string" && main.trim()) out.push(main.trim());
  for (let i = 5; i < row.length; i += 2) {
    const u = row[i];
    if (typeof u === "string" && u.trim()) out.push(u.trim());
  }
  return out;
}

function arraysEqualOrdered(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// Merge posicional: Excel ganha onde tem imagem, senão fica a nossa.
// O comprimento final é max(excel.length, nossa.length).
function mergeImages(excel: string[], ours: string[]): string[] {
  const out: string[] = [];
  const len = Math.max(excel.length, ours.length);
  for (let i = 0; i < len; i++) {
    if (i < excel.length && excel[i]) out.push(excel[i]);
    else if (i < ours.length && ours[i]) out.push(ours[i]);
  }
  return out;
}

async function main() {
  console.log(`Ficheiro: ${XLSX_PATH}`);
  console.log(`Modo: ${APPLY ? "APPLY (grava)" : "DRY-RUN (só relatório)"}\n`);

  const wb = xlsx.readFile(XLSX_PATH, { raw: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null, raw: true });

  interface FileRow { ref: string; images: string[]; }
  const fileRows: FileRow[] = [];
  const seenRefs = new Set<string>();
  let dupRefsInFile = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const ref = r[1] == null ? "" : String(r[1]).trim();
    if (!ref) continue;
    if (seenRefs.has(ref)) { dupRefsInFile++; continue; }
    seenRefs.add(ref);
    fileRows.push({ ref, images: collectImages(r) });
  }
  console.log(`Refs no ficheiro: ${fileRows.length}${dupRefsInFile ? ` (+${dupRefsInFile} duplicados ignorados)` : ""}`);

  // Pull the whole variant table once.
  const variants = await prisma.productVariant.findMany({
    select: { id: true, sku: true, ean: true, images: true },
  });
  const bySku = new Map(variants.map((v) => [v.sku.toUpperCase(), v]));

  interface Planned {
    ref: string;
    variantId: string;
    sku: string;
    oldImages: string[];
    newImages: string[];
    action: "noop" | "replace-slots" | "add" | "grow";
    replacedSlots: number; // slots que mudaram de URL (para reporting)
    preservedTail: number; // slots que ficaram só com a nossa foto
  }
  const planned: Planned[] = [];
  const notMatched: string[] = [];
  const noImagesInFile: string[] = [];

  for (const row of fileRows) {
    if (row.images.length === 0) { noImagesInFile.push(row.ref); continue; }
    let hit = null;
    for (const c of candidateSkus(row.ref)) {
      const v = bySku.get(c.toUpperCase());
      if (v) { hit = v; break; }
    }
    if (!hit) { notMatched.push(row.ref); continue; }
    // Safety: cross-ref by SKU only. Never fall back to EAN here to avoid
    // painting images on a variant that just happens to share a barcode
    // (defensive — SKUs are unique in our DB).
    const oldImages = hit.images ?? [];
    const newImages = mergeImages(row.images, oldImages);

    // Count how many slots actually changed URL vs how many we preserved
    // from our own tail (slots the Excel didn't cover).
    let replacedSlots = 0;
    for (let i = 0; i < Math.min(row.images.length, oldImages.length); i++) {
      if (row.images[i] !== oldImages[i]) replacedSlots++;
    }
    const preservedTail = Math.max(0, oldImages.length - row.images.length);

    let action: Planned["action"];
    if (arraysEqualOrdered(oldImages, newImages)) action = "noop";
    else if (oldImages.length === 0) action = "add";
    else if (newImages.length > oldImages.length) action = "grow";
    else action = "replace-slots";

    planned.push({ ref: row.ref, variantId: hit.id, sku: hit.sku, oldImages, newImages, action, replacedSlots, preservedTail });
  }

  // ------------- Report -------------
  const noop = planned.filter((p) => p.action === "noop").length;
  const adds = planned.filter((p) => p.action === "add").length;
  const grows = planned.filter((p) => p.action === "grow").length;
  const replaceSlots = planned.filter((p) => p.action === "replace-slots").length;
  const totalWrites = adds + grows + replaceSlots;
  const totalSlotsReplaced = planned.reduce((s, p) => s + p.replacedSlots, 0);
  const totalSlotsPreserved = planned.reduce((s, p) => s + p.preservedTail, 0);
  const totalNewSlots = planned.reduce(
    (s, p) => s + Math.max(0, p.newImages.length - p.oldImages.length),
    0,
  );
  console.log("");
  console.log("==================================================");
  console.log("PLANO — merge posicional (Excel ganha, nada encolhe)");
  console.log("==================================================");
  console.log(`Sem alteração (já iguais):                ${noop}`);
  console.log(`Adicionar (variant sem imgs):             ${adds}`);
  console.log(`Aumentar (Excel traz mais do que tínhamos): ${grows}`);
  console.log(`Só substituir slots existentes:            ${replaceSlots}`);
  console.log(`TOTAL DE ESCRITAS:                         ${totalWrites}`);
  console.log("");
  console.log(`Slots (URLs) substituídos por versão do Excel: ${totalSlotsReplaced}`);
  console.log(`Slots preservados (Excel não tinha alternativa): ${totalSlotsPreserved}`);
  console.log(`Slots novos (adicionados ao fim):              ${totalNewSlots}`);
  if (notMatched.length) console.log(`\nRefs sem match no catálogo: ${notMatched.length}   (${notMatched.slice(0, 6).join(", ")}…)`);
  if (noImagesInFile.length) console.log(`\nRefs sem imagens no ficheiro (ignoradas): ${noImagesInFile.length}`);

  console.log("\nAmostra — variants que vão RECEBER imagens de novo (add, primeiras 10):");
  for (const p of planned.filter((p) => p.action === "add").slice(0, 10)) {
    console.log(`  ${p.sku.padEnd(16)} · 0 → ${p.newImages.length} imgs`);
  }
  console.log("\nAmostra — variants que vão AUMENTAR (Excel traz mais):");
  for (const p of planned.filter((p) => p.action === "grow").slice(0, 10)) {
    console.log(`  ${p.sku.padEnd(16)} · ${p.oldImages.length} → ${p.newImages.length}  (${p.replacedSlots} slots com URL nova)`);
  }
  console.log("\nAmostra — casos onde ficam preservadas fotos nossas para além do Excel:");
  const withPreserved = planned.filter((p) => p.preservedTail > 0);
  for (const p of withPreserved.slice(0, 10)) {
    console.log(`  ${p.sku.padEnd(16)} · Excel ${p.newImages.length - p.preservedTail} + ${p.preservedTail} nossas preservadas = ${p.newImages.length} total`);
  }
  if (withPreserved.length > 10) console.log(`  … +${withPreserved.length - 10} outras com cauda preservada`);

  if (!APPLY) {
    console.log("\nDry-run — corre com --apply para gravar. Nada foi escrito.");
    await prisma.$disconnect();
    return;
  }

  console.log("\nA gravar…");
  let done = 0, failed = 0;
  const toWrite = planned.filter((p) => p.action !== "noop");
  const POOL = 20;
  let cursor = 0;
  const workers: Promise<void>[] = [];
  const kick = async () => {
    while (cursor < toWrite.length) {
      const p = toWrite[cursor++];
      try {
        await prisma.productVariant.update({ where: { id: p.variantId }, data: { images: p.newImages } });
        done++;
      } catch (e) {
        failed++;
        if (failed <= 5) console.error(`  falhou ${p.sku}: ${(e as Error).message.slice(0, 160)}`);
      }
    }
  };
  for (let k = 0; k < Math.min(POOL, toWrite.length); k++) workers.push(kick());
  await Promise.all(workers);
  console.log(`\nAplicadas: ${done} · falhadas: ${failed}`);

  await prisma.adminAction.create({
    data: {
      entityType: "UPLOAD_BATCH",
      action: "IMAGES_APPLY",
      entityId: "std-links-images",
      note: `ST_DUPONT_LINKS-IMAGENS: ${done} variants actualizadas (${adds} add · ${grows} grow · ${replaceSlots} slot-replace · ${noop} noop)`,
    },
  });

  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
