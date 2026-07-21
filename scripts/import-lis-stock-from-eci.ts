// Loads ONLY the Lisboa (LIS) stock from an ECI_LIS_Controlo Excel into
// ProductVariant.stockLis, matching by EAN then REF. Only touches Dupont
// rows in the DB sheet — non-Dupont rows (KAWECO, REP_* internal codes)
// are silently skipped. After setting stockLis it recomputes the aggregate
// stock = stockLis(new) + stockVng(current). Prices and stockVng stay put.
//
// Same layout as scripts/import-vng-other-brands.ts (positional columns
// on the DB sheet: 0=EAN, 1=Ref, 2=Marca, 3=Descrição, 4=PVP, 5=Stock Teórico).
//
//   $env:DATABASE_URL = "<neon url>"
//   npx tsx scripts/import-lis-stock-from-eci.ts                 # dry-run (default file on desktop)
//   npx tsx scripts/import-lis-stock-from-eci.ts --apply         # commit
//   npx tsx scripts/import-lis-stock-from-eci.ts "<path.xlsx>" --apply
import "dotenv/config";
import * as path from "path";
import xlsx from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const DEFAULT_FILE = "C:/Users/Utilizador/Desktop/ECI_LIS_Controlo_v1_2_2026 (002).xlsx";
const FILE = process.argv.find((a) => a.endsWith(".xlsx")) ?? DEFAULT_FILE;
const APPLY = process.argv.includes("--apply");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Strip STD prefix; 000NNN also tries 900NNN (legacy gas-refill numbering);
// finally the raw ref too. Mirrors import-vng-stock.ts.
function refCandidates(ref: string): string[] {
  const tail = ref.replace(/^STD/, "");
  const out: string[] = [tail];
  if (/^000\d{3}$/.test(tail)) out.push("9" + tail.slice(1));
  if (ref !== tail) out.push(ref);
  return out;
}

// Excel EANs sometimes arrive as numbers with a trailing ".0"; normalise.
function normEan(v: unknown): string | null {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  return s ? s.replace(/\.0+$/, "") : null;
}

(async () => {
  console.log(`Reading ${path.basename(FILE)} ${APPLY ? "(APPLY)" : "(dry-run)"} — apenas stockLis (Dupont)`);
  const wb = xlsx.readFile(FILE);
  const ws = wb.Sheets["DB"];
  if (!ws) throw new Error("Sheet 'DB' not found");
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as unknown[][];
  // DB sheet layout: row 0 = section title, row 1 = headers, row 2..N = data.
  const body = rows.slice(2);

  interface Row { ean: string | null; ref: string; desc: string; stockLis: number; }
  const dupontRows: Row[] = [];
  let skippedNonDupont = 0, skippedBlank = 0;
  for (const r of body) {
    if (!r) continue;
    const ref = r[1] == null ? "" : String(r[1]).trim();
    if (!ref) { skippedBlank++; continue; }
    const brand = (r[2] == null ? "" : String(r[2]).trim()).toUpperCase();
    // Only ST DUPONT / DUPONT feeds ProductVariant.stockLis — the non-Dupont
    // rows in this Excel (KAWECO, REP_*) don't map to catalogue variants.
    if (brand !== "ST DUPONT" && brand !== "DUPONT") { skippedNonDupont++; continue; }
    dupontRows.push({
      ean: normEan(r[0]),
      ref,
      desc: r[3] == null ? ref : String(r[3]).trim(),
      // Stock Teórico can go negative in the sheet (short receipts / prior
      // over-sales). Clamp to 0 so we don't write negatives into stockLis.
      stockLis: Math.max(0, Math.trunc(Number(r[5]) || 0)),
    });
  }

  console.log(`Linhas ST DUPONT / DUPONT: ${dupontRows.length}   (não-Dupont ${skippedNonDupont}, em branco ${skippedBlank})`);

  const variants = await prisma.productVariant.findMany({
    select: { id: true, sku: true, ean: true, stockLis: true, stockVng: true },
  });
  const bySku = new Map(variants.map((v) => [v.sku, v]));
  const byEan = new Map(variants.filter((v) => v.ean).map((v) => [v.ean as string, v]));

  let matched = 0, unmatched = 0, changed = 0, noop = 0, unitsLis = 0;
  const updates: { id: string; stockLis: number; stock: number }[] = [];
  const sampleUnmatched: string[] = [];

  for (const row of dupontRows) {
    let hit = row.ean ? byEan.get(row.ean) : undefined;
    if (!hit) {
      for (const c of refCandidates(row.ref)) { const v = bySku.get(c); if (v) { hit = v; break; } }
    }
    if (!hit) {
      unmatched++;
      if (sampleUnmatched.length < 12) sampleUnmatched.push(`REF=${row.ref} EAN=${row.ean ?? "—"} ${row.desc}`);
      continue;
    }
    matched++;
    unitsLis += row.stockLis;
    if ((hit.stockLis ?? 0) === row.stockLis) { noop++; continue; }
    changed++;
    updates.push({ id: hit.id, stockLis: row.stockLis, stock: row.stockLis + (hit.stockVng ?? 0) });
  }

  console.log("");
  console.log(`Correspondidas:                          ${matched}  (por EAN ou REF)`);
  console.log(`  → a atualizar stockLis:                ${changed}`);
  console.log(`  → já iguais (no-op):                   ${noop}`);
  console.log(`Sem correspondência (ignoradas):         ${unmatched}`);
  console.log(`Total de unidades LIS no ficheiro:       ${unitsLis}`);
  if (sampleUnmatched.length) {
    console.log("\nAmostra sem correspondência:");
    for (const s of sampleUnmatched) console.log(`  ${s}`);
  }

  if (!APPLY) {
    console.log("\nDry-run — corre com --apply para gravar. Só mexe em stockLis (+ total). stockVng e preços ficam intactos.");
    await prisma.$disconnect();
    return;
  }

  console.log("\nA aplicar (apenas stockLis + total)…");
  let done = 0, failed = 0;
  for (const u of updates) {
    try {
      await prisma.productVariant.update({ where: { id: u.id }, data: { stockLis: u.stockLis, stock: u.stock } });
      done++;
    } catch (e) {
      failed++;
      if (failed <= 5) console.error(`  falhou: ${(e as Error).message.slice(0, 160)}`);
    }
  }
  await prisma.adminAction.create({
    data: { entityType: "UPLOAD_BATCH", action: "IMPORT", entityId: "lis-stock-eci", note: `Stock Lisboa (LIS) de ${path.basename(FILE)}: ${done} variantes atualizadas` },
  });
  console.log(`\nAtualizadas: ${done} · falhadas: ${failed}. stockVng e preços não foram tocados.`);
  await prisma.$disconnect();
})().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
