// Import ECI_VNG_Controlo_v2_2_.xlsx (DB sheet) into OtherBrandItem.
//
// Analytics-only — this table is read-only from the boss's admin view;
// nothing here reaches the website or the POS terminal. Import rules:
//   • Skip ST DUPONT and DUPONT — those live in ProductVariant.
//   • Skip 0REPARAÇÕES internal SKUs (they're process placeholders).
//   • Skip rows without a Ref (empty tail / section separators).
//   • Upsert on `sku` — re-running the script refreshes stock + PVP
//     without breaking any manual annotations we add later.
//
// Usage:
//   npx tsx scripts/import-vng-other-brands.ts <path.xlsx>
//
// The Excel path defaults to the desktop copy so day-to-day re-imports
// are a single command.
import "dotenv/config";
import xlsx from "xlsx";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PATH = "C:/Users/Utilizador/Desktop/ECI_VNG_Controlo_v2_2_.xlsx";
const SKIP_BRANDS = new Set(["ST DUPONT", "DUPONT", "0REPARAÇÕES"]);

// Excel PVP is stored as decimal euros (number). Convert to integer cents,
// rounding to the nearest cent. Nulls stay null (some rows have no price).
function toCents(pvp: unknown): number | null {
  if (pvp == null || pvp === "") return null;
  const n = Number(pvp);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

// Some EAN cells arrive as numbers (Excel is aggressive about number
// coercion) — normalise to string, strip decimal noise like "12345.0".
function normEan(v: unknown): string | null {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.replace(/\.0+$/, "");
}

async function main() {
  const file = process.argv[2] ?? DEFAULT_PATH;
  console.log(`Reading ${path.basename(file)} …`);
  const wb = xlsx.readFile(file);
  const ws = wb.Sheets["DB"];
  if (!ws) throw new Error("Sheet 'DB' not found");
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as unknown[][];
  // Body starts at row 2 (row 0 is the section title, row 1 is headers).

  const body = rows.slice(2);
  let seen = 0, skipped = 0, imported = 0, updated = 0;
  // Track SKUs we've already processed in this pass — an ill-formed
  // Excel could repeat a Ref, which would blow up the unique index.
  const skusThisRun = new Set<string>();
  // Same guard for EANs — the unique index means the first winner keeps
  // the barcode; later duplicates drop it to null so the row still
  // imports (visible in the analytics view, just without a barcode).
  const eansThisRun = new Set<string>();
  // Two ECI Refs share one EAN (physically the same barcode used across
  // colour variants, for example) — the first row through the loop
  // claims the EAN, later duplicates drop it. Record what we drop so the
  // operator can decide later whether the Excel is wrong or whether the
  // second SKU genuinely needs its own barcode.
  const droppedEanSkus: string[] = [];

  for (const r of body) {
    if (!r) continue;
    const sku = r[1] == null ? "" : String(r[1]).trim();
    if (!sku) { skipped++; continue; }
    const brand = (r[2] == null ? "" : String(r[2]).trim()).toUpperCase();
    if (!brand || SKIP_BRANDS.has(brand)) { skipped++; continue; }
    if (skusThisRun.has(sku)) { skipped++; continue; }
    skusThisRun.add(sku);
    seen++;

    let ean = normEan(r[0]);
    if (ean) {
      if (eansThisRun.has(ean)) {
        droppedEanSkus.push(`${sku} (dup EAN ${ean})`);
        ean = null;
      } else {
        eansThisRun.add(ean);
      }
    }
    const desc = r[3] == null ? sku : String(r[3]).trim();
    const pvpCents = toCents(r[4]);
    const stock = Number(r[5]) || 0;

    // Upsert on sku (unique). Ref is the stable identity across imports;
    // EAN can be missing, description can drift, but Ref stays.
    const res = await prisma.otherBrandItem.upsert({
      where: { sku },
      create: { sku, brand, ean, descricao: desc, pvpCents, stock },
      update: { brand, ean, descricao: desc, pvpCents, stock },
    });
    // upsert returns the row — we don't get "was it new?" from Prisma directly,
    // so we sample createdAt/updatedAt to infer it. Same-tick timestamps ≈ new.
    const wasNew = Math.abs(res.createdAt.getTime() - res.updatedAt.getTime()) < 5;
    if (wasNew) imported++; else updated++;
  }

  console.log(`\nSummary`);
  console.log(`  Body rows           : ${body.length}`);
  console.log(`  Skipped             : ${skipped}   (blank / Dupont / reparações / dup SKU)`);
  console.log(`  Processed           : ${seen}`);
  console.log(`    ↳ Created         : ${imported}`);
  console.log(`    ↳ Updated         : ${updated}`);
  if (droppedEanSkus.length) {
    console.log(`  Dropped EAN (dup)   : ${droppedEanSkus.length}`);
    droppedEanSkus.slice(0, 10).forEach((s) => console.log(`      · ${s}`));
    if (droppedEanSkus.length > 10) console.log(`      … +${droppedEanSkus.length - 10} more`);
  }
  const total = await prisma.otherBrandItem.count();
  console.log(`  Table total (post)  : ${total}`);
  const byBrand = await prisma.otherBrandItem.groupBy({ by: ["brand"], _count: true, orderBy: { _count: { brand: "desc" } } });
  console.log(`  Brands: ${byBrand.length}`);
  byBrand.forEach((b) => console.log(`    · ${b.brand.padEnd(22)} ${String(b._count).padStart(5)}`));
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
