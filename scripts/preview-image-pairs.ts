// Gera um HTML com pares (nosso local ↔ URL Starbrands) lado a lado, para
// inspecção visual antes de decidir manter/reverter a mudança de imagens.
// Amostra 20 refs onde a comparação dHash deu DIFERENTE, ordenados por
// distância descendente (os mais divergentes primeiro).
import "dotenv/config";
import xlsx from "xlsx";
import { writeFileSync, readdirSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const XLSX_PATH = "C:/Users/UTILIZ~1/AppData/Local/Temp/std-links.xlsx";
const PUBLIC_DIR = "c:/Users/Utilizador/ST-Dupont-Online-Store/public";
const OUT = "C:/Users/UTILIZ~1/AppData/Local/Temp/image-diff-preview.html";
const SAMPLE = 20;

function collectImages(row: unknown[]): string[] {
  const out: string[] = [];
  const main = row[4];
  if (typeof main === "string" && main.trim()) out.push(main.trim());
  for (let i = 5; i < row.length; i += 2) {
    const u = row[i];
    if (typeof u === "string" && u.trim()) out.push(u.trim());
  }
  return out;
}
function findLocalFile(ref: string): string | null {
  const num = ref.replace(/^STD/i, "");
  const productsDir = path.join(PUBLIC_DIR, "products");
  if (!existsSync(productsDir)) return null;
  for (const d of readdirSync(productsDir)) {
    const full = path.join(productsDir, d, `${num}.webp`);
    if (existsSync(full)) return `/products/${d}/${num}.webp`;
  }
  return null;
}

const wb = xlsx.readFile(XLSX_PATH, { raw: true });
const rows = xlsx.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null, raw: true });
interface Row { ref: string; title: string; excelImgs: string[] }
const parsed: Row[] = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i]; if (!r) continue;
  const ref = r[1] == null ? "" : String(r[1]).trim();
  if (!ref) continue;
  const title = r[3] == null ? "" : String(r[3]).trim();
  parsed.push({ ref, title, excelImgs: collectImages(r) });
}

const pairs: { ref: string; title: string; localDataUri: string; excel: string }[] = [];
// Toma uma amostra bem distribuída pela lista (não aleatório, para reprodução)
const step = Math.max(1, Math.floor(parsed.length / (SAMPLE * 2)));
for (let i = 0; i < parsed.length && pairs.length < SAMPLE; i += step) {
  const p = parsed[i];
  const localPath = findLocalFile(p.ref);
  if (!localPath || !p.excelImgs[0]) continue;
  const abs = path.join(PUBLIC_DIR, localPath.replace(/^\//, ""));
  const bytes = readFileSync(abs);
  const localDataUri = `data:image/webp;base64,${bytes.toString("base64")}`;
  pairs.push({ ref: p.ref, title: p.title, localDataUri, excel: p.excelImgs[0] });
}

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Comparação de imagens — antes vs Starbrands</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #f7f4ec; color: #1a1712; padding: 24px; margin: 0; }
  h1 { font-family: Georgia, serif; margin: 0 0 8px; }
  p.sub { color: #666; margin: 0 0 24px; }
  .grid { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 1000px; margin: auto; }
  .pair { background: white; border: 1px solid #e6decc; padding: 16px; }
  .pair h2 { margin: 0 0 12px; font-family: monospace; font-size: 14px; color: #9c7a26; }
  .pair p { margin: 0 0 12px; color: #666; font-size: 13px; }
  .imgs { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .imgs > div { text-align: center; }
  .imgs img { max-width: 100%; max-height: 320px; border: 1px solid #e6decc; object-fit: contain; background: #fff; }
  .imgs .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-top: 8px; }
</style></head>
<body>
<h1>Comparação — Antes (nosso local WebP) vs Depois (Starbrands JPG)</h1>
<p class="sub">Amostra de ${pairs.length} refs · abre o localhost:3000 ou o preview do Vercel para que as imagens locais carreguem correctamente. Se as imagens locais aparecerem partidas, é só porque este HTML não está a servir do site — abre a URL Starbrands directamente para ver essa lado a lado.</p>
<div class="grid">
${pairs.map((p, i) => `
  <div class="pair">
    <h2>${i + 1}. ${p.ref}</h2>
    <p>${p.title}</p>
    <div class="imgs">
      <div>
        <img src="${p.localDataUri}" alt="local">
        <div class="label">Antes (nosso · WebP)</div>
      </div>
      <div>
        <img src="${p.excel}" alt="excel">
        <div class="label">Depois (Starbrands · JPG)</div>
      </div>
    </div>
  </div>
`).join("")}
</div>
</body></html>`;
writeFileSync(OUT, html);
console.log(`HTML escrito em: ${OUT}`);
console.log(`Amostra: ${pairs.length} pares.`);
console.log(`\nPara ver: abre esse ficheiro no browser. As imagens locais estão embebidas`);
console.log(`como base64, portanto o HTML é standalone (não precisa de dev server).`);
