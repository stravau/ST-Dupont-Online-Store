// Peek at ST_DUPONT_LINKS-IMAGENS.xlsx — see the sheets, columns, and sample
// rows so we know which column has the REF and which has the image URL.
import xlsx from "xlsx";
const wb = xlsx.readFile("C:/Users/UTILIZ~1/AppData/Local/Temp/std-links.xlsx", { raw: true });
console.log("Sheets:", wb.SheetNames.join(" | "));
for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
  console.log(`\n=== ${name} · ${rows.length} rows ===`);
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    console.log(`  R${i}:`, JSON.stringify(rows[i]).slice(0, 260));
  }
  if (rows.length > 6) {
    const mid = Math.floor(rows.length / 2);
    console.log(`  Rmid(${mid}):`, JSON.stringify(rows[mid]).slice(0, 260));
    console.log(`  Rlast(${rows.length - 1}):`, JSON.stringify(rows[rows.length - 1]).slice(0, 260));
  }
}
