// Generates prisma/eci-overlay.generated.json — { SKU: { ean, priceCents } }
// sourced from the ECI control sheet (DB tab), keyed by OUR seed SKU.
// Baked into the repo so the seed restores EAN + current price on every
// reseed (the reseed wipes the DB, so EANs must live in the seed source).
// Re-run when a new control sheet arrives:
//   npx tsx scripts/gen-eci-overlay.ts "<path to xlsx>"
import * as XLSX from "xlsx";
import fs from "fs";
import { products } from "../prisma/seed-data";

const FILE = process.argv.find((a) => a.endsWith(".xlsx")) ??
  "C:/Users/luis_/Downloads/ECI_LIS_Controlo_v1_2_2026 (002)LUIS.xlsx";
const wb = XLSX.readFile(FILE);
const raw = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["DB"], { header: 1, defval: null });
const ctl = new Map<string, { ean: string; pvp: number }>();
for (let i = 2; i < raw.length; i++) {
  const r = raw[i]; if (!r || typeof r[1] !== "string") continue;
  if (/^(OUTROS|SB-)/.test(r[1])) continue;
  const key = r[1].replace(/^STD/, "").toUpperCase();
  const pvp = typeof r[4] === "number" ? r[4] : NaN;
  const ean = r[0] != null ? String(r[0]).trim() : "";
  if (!ctl.has(key)) ctl.set(key, { ean, pvp: pvp > 0 ? pvp : 0 });
}
function cands(sku: string): string[] {
  const up = sku.toUpperCase();
  const out = [up, up.replace(/N$/, "")];
  const m = up.match(/^C0*(\d+)[A-Z]*$/);
  if (m) { out.push("0" + m[1], m[1]); }
  if (/^000\d{3}$/.test(up)) out.push("9" + up.slice(1));
  if (/^900\d{3}$/.test(up)) out.push("000" + up.slice(3));
  return [...new Set(out)];
}

const overlay: Record<string, { ean: string | null; priceCents: number | null }> = {};
let priced = 0, eaned = 0, changed = 0;
const sample: string[] = [];
for (const p of products) for (const v of p.variants) {
  let c; for (const k of cands(v.sku)) { if (ctl.has(k)) { c = ctl.get(k); break; } }
  if (!c) continue;
  const priceCents = c.pvp > 0 ? Math.round(c.pvp * 100) : null;
  const ean = c.ean || null;
  if (!priceCents && !ean) continue;
  overlay[v.sku] = { ean, priceCents };
  if (priceCents) { priced++; if (priceCents !== v.priceCents) { changed++; if (sample.length < 10) sample.push(`${v.sku} €${v.priceCents/100}→€${priceCents/100}`); } }
  if (ean) eaned++;
}
fs.writeFileSync("prisma/eci-overlay.generated.json", JSON.stringify(overlay, null, 0));
console.log(`overlay entries: ${Object.keys(overlay).length} | with price: ${priced} | with EAN: ${eaned} | price changes: ${changed}`);
console.log("sample changes:", sample.join(" | "));
