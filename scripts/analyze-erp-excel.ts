// Diagnostic: cross-references the ECI/Starbrands ERP Excel against
// our seed-data SKUs to report match / orphan counts before we run
// the actual import. Run with:
//   npx tsx scripts/analyze-erp-excel.ts
// Reads the file path from argv[2] or defaults to the Desktop copy.

import * as xlsx from "xlsx";
import * as fs from "node:fs";
import * as path from "node:path";

const FILE = process.argv[2] ?? "c:/Users/Utilizador/Desktop/ECI_LIS_Controlo_v1_2_2026 (002).xlsx";
const SEED = path.resolve(__dirname, "../prisma/seed-data.ts");

const wb = xlsx.readFile(FILE);
const ws = wb.Sheets["DB"];
const rows = xlsx.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });

// Pull every SKU we currently ship in seed-data.
const seedText = fs.readFileSync(SEED, "utf8");
const seedSkus = new Set<string>();
for (const m of seedText.matchAll(/sku:\s*`([^`]+)`/g)) seedSkus.add(m[1]);

interface ExcelRow {
  ean: string | null;
  ref: string;
  brand: string | null;
  desc: string | null;
  pvp: number | null;
  stock: number | null;
}

const data: ExcelRow[] = [];
for (let i = 2; i < rows.length; i++) {
  const r = rows[i];
  if (!r || typeof r[1] !== "string") continue;
  data.push({
    ean: typeof r[0] === "number" ? String(r[0]) : r[0] as string | null,
    ref: r[1] as string,
    brand: r[2] as string | null,
    desc: r[3] as string | null,
    pvp: r[4] as number | null,
    stock: r[5] as number | null,
  });
}

// Match attempts:
//   1. Strip leading 'STD' → direct match.
//   2. Tails that start with '000' (the 4-digit STD000NNN family) →
//      ALSO try replacing '000' with '900' (gas refills / flints in
//      our seed live under that prefix).
function attemptMatch(ref: string): string | null {
  const tail = ref.replace(/^STD/, "");
  if (seedSkus.has(tail)) return tail;
  if (/^000\d{3}$/.test(tail)) {
    const alt = "9" + tail.slice(1);
    if (seedSkus.has(alt)) return alt;
  }
  // Some non-STD prefixes (KW, SB) won't have a tail to strip — try
  // the raw ref against the seed too.
  if (seedSkus.has(ref)) return ref;
  return null;
}

const matched: { excel: string; ours: string; row: ExcelRow }[] = [];
const orphans: ExcelRow[] = [];
const eanlessMatches: { excel: string; ours: string; row: ExcelRow }[] = [];

for (const row of data) {
  if (!row.ref) continue;
  // Filter out admin / SB-* / OUTROS rows that aren't real products.
  if (/^(OUTROS|SB-)/.test(row.ref)) continue;
  const ours = attemptMatch(row.ref);
  if (ours) {
    matched.push({ excel: row.ref, ours, row });
    if (!row.ean) eanlessMatches.push({ excel: row.ref, ours, row });
  } else {
    orphans.push(row);
  }
}

console.log("==== Cross-reference report ====");
console.log("Excel rows considered :", data.length);
console.log("Matched (will UPDATE) :", matched.length);
console.log("Orphans (will INSERT) :", orphans.length);
console.log("Matched w/o EAN       :", eanlessMatches.length);

// Show prefix breakdown of orphans so we know which scraped families
// are missing from our seed.
const orphanPrefix: Record<string, number> = {};
for (const o of orphans) {
  const p = o.ref.match(/^([A-Z]+)/)?.[1] ?? "?";
  orphanPrefix[p] = (orphanPrefix[p] ?? 0) + 1;
}
console.log("\nOrphan ref prefixes:");
for (const [p, c] of Object.entries(orphanPrefix).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${p.padEnd(8)} ${c}`);
}

console.log("\nSample matches (first 5):");
for (const m of matched.slice(0, 5)) {
  console.log(`  ${m.excel.padEnd(15)} → ${m.ours.padEnd(12)} | EAN ${(m.row.ean ?? "—").padEnd(13)} | PVP €${m.row.pvp} | stock ${m.row.stock} | ${m.row.desc}`);
}

console.log("\nSample orphans (first 5):");
for (const o of orphans.slice(0, 5)) {
  console.log(`  ${o.ref.padEnd(15)} | EAN ${(o.ean ?? "—").padEnd(13)} | PVP €${o.pvp} | stock ${o.stock} | ${o.desc}`);
}
