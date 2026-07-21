// Deep-dive into the DB sheet of ECI_VNG_Controlo — the stock master.
// Lists column headers (R1), unique brands with counts, and a couple of
// rows per brand so I can spot brand-specific quirks before writing the
// import.
import xlsx from "xlsx";

const path = process.argv[2];
if (!path) { console.error("usage: node scripts/inspect-vng-db.mjs <path.xlsx>"); process.exit(1); }

const wb = xlsx.readFile(path);
const ws = wb.Sheets["DB"];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });

const headers = rows[1];
console.log("Headers (row 1):");
headers.forEach((h, i) => { if (h != null) console.log(`  [${i}] ${h}`); });

// Body = row 2 onwards. Column indices from R1:
//   0 EAN | 1 Ref | 2 Marca | 3 Descrição | 4 PVP | 5 Stock Teórico
//   6 Mov_POS | 7 Mov_Int_Ext | 8 Reserva | 9 Danif | 10 Enc
// Skip empty tail rows and section separators.
const data = rows.slice(2).filter((r) => r && (r[1] != null || r[0] != null));
console.log(`\nData rows: ${data.length}`);

const brandCount = new Map();
const brandStock = new Map();
const brandExamples = new Map();
for (const r of data) {
  const brand = (r[2] ?? "(no brand)").toString().trim();
  brandCount.set(brand, (brandCount.get(brand) ?? 0) + 1);
  brandStock.set(brand, (brandStock.get(brand) ?? 0) + (Number(r[5]) || 0));
  if (!brandExamples.has(brand)) brandExamples.set(brand, r);
}

const sorted = [...brandCount.entries()].sort((a, b) => b[1] - a[1]);
console.log(`\nBrands: ${sorted.length}`);
console.log("brand".padEnd(25), "SKUs", "stock");
for (const [brand, count] of sorted) {
  const s = brandStock.get(brand) ?? 0;
  console.log(brand.padEnd(25), String(count).padStart(5), String(s).padStart(7));
}

// Sanity — any DUPONT rows here? shouldn't be (VNG file, but "DB" may contain them).
const dupont = data.filter((r) => /dupont/i.test(String(r[2] ?? "")));
console.log(`\nDUPONT rows in this VNG DB: ${dupont.length}`);
if (dupont.length) console.log("  sample:", JSON.stringify(dupont[0]).slice(0, 260));

// PVP sanity — expect Number (euros), sometimes null
const withPvp = data.filter((r) => r[4] != null);
const pvpTypes = new Set(withPvp.map((r) => typeof r[4]));
console.log(`\nPVP present on ${withPvp.length}/${data.length}. Types: ${[...pvpTypes].join(", ")}`);

// EAN sanity — some rows have no EAN (SB-REP-* internal SKUs). Report how many.
const withEan = data.filter((r) => r[0] != null);
console.log(`EAN present on ${withEan.length}/${data.length}`);
