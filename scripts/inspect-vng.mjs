// One-off — inspect ECI_VNG_Controlo Excel structure so the DB shape can
// be designed against real data. Not part of the app; run with:
//   node scripts/inspect-vng.mjs <path-to-xlsx>
import xlsx from "xlsx";

const path = process.argv[2];
if (!path) {
  console.error("usage: node scripts/inspect-vng.mjs <path.xlsx>");
  process.exit(1);
}

const wb = xlsx.readFile(path);
console.log("Sheets:", wb.SheetNames.join(" | "));

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
  console.log(`\n=== ${name} · ${rows.length} rows ===`);
  const previewCount = Math.min(10, rows.length);
  for (let i = 0; i < previewCount; i++) {
    console.log(`R${i}:`, JSON.stringify(rows[i]).slice(0, 300));
  }
  if (rows.length > previewCount) {
    const mid = Math.floor(rows.length / 2);
    console.log(`  … (${rows.length - previewCount} more)`);
    console.log(`Rmid(${mid}):`, JSON.stringify(rows[mid]).slice(0, 300));
    console.log(`Rlast(${rows.length - 1}):`, JSON.stringify(rows[rows.length - 1]).slice(0, 300));
  }
}
