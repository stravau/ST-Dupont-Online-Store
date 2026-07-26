// v6 — CLIP semantic similarity (nada de perceptual hashes).
// Cada imagem passa por CLIP ViT-B/32 e sai um vector 512-dim
// L2-normalizado. Comparação por cosine similarity, que para o mesmo
// produto rende ≥0.95 mesmo com re-shoot ou variação de crop/lighting.
//
// Thresholds baseados em como CLIP se comporta com fotografia de produto:
//   sim ≥ 0.95 → SAME (mesma foto ou re-shoot idêntico)
//   0.85 ≤ sim < 0.95 → PROB_SAME (mesmo produto, variação mínima)
//   0.70 ≤ sim < 0.85 → AMBÍGUO (mesmo produto ângulo diferente, ou similar)
//   sim < 0.70 → DIFFERENT (fotos genuinamente diferentes)
//
// Cache dos embeddings em disco → re-runs são instantâneos.
import { pipeline, env, RawImage } from "@xenova/transformers";
import xlsx from "xlsx";
import sharp from "sharp";
import { writeFileSync, readdirSync, existsSync, readFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

env.cacheDir = "C:/Users/UTILIZ~1/AppData/Local/Temp/xenova-cache";
env.allowRemoteModels = true;

const XLSX_PATH = "C:/Users/UTILIZ~1/AppData/Local/Temp/std-links.xlsx";
const PUBLIC_DIR = "c:/Users/Utilizador/ST-Dupont-Online-Store/public";
const STARBRANDS_CACHE = "C:/Users/UTILIZ~1/AppData/Local/Temp/starbrands-cache";
const EMB_CACHE = "C:/Users/UTILIZ~1/AppData/Local/Temp/clip-embeddings";
const OUT = "C:/Users/UTILIZ~1/AppData/Local/Temp/image-review-v6.html";
const PAGE_SIZE = 10;

for (const d of [STARBRANDS_CACHE, EMB_CACHE]) if (!existsSync(d)) mkdirSync(d, { recursive: true });

function md5(s) { return createHash("md5").update(s).digest("hex"); }
function collectImages(row) {
  const out = [];
  const main = row[4];
  if (typeof main === "string" && main.trim()) out.push(main.trim());
  for (let i = 5; i < row.length; i += 2) {
    const u = row[i];
    if (typeof u === "string" && u.trim()) out.push(u.trim());
  }
  return out;
}
function findLocalImagesForRef(ref) {
  const num = ref.replace(/^STD/i, "");
  const productsDir = path.join(PUBLIC_DIR, "products");
  if (!existsSync(productsDir)) return [];
  const found = [];
  for (const d of readdirSync(productsDir)) {
    const subdir = path.join(productsDir, d);
    let files = [];
    try { files = readdirSync(subdir); } catch { continue; }
    const re = new RegExp(`^${num.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}(?:[-_](\\d+))?\\.webp$`, "i");
    for (const f of files) {
      const m = f.match(re);
      if (!m) continue;
      const n = m[1] ? parseInt(m[1], 10) - 1 : 0;
      found.push({ web: `/products/${d}/${f}`, idx: n });
    }
  }
  found.sort((a, b) => a.idx - b.idx);
  return found;
}
async function fetchToCache(url, timeoutMs = 20000) {
  const cached = path.join(STARBRANDS_CACHE, md5(url) + ".bin");
  if (existsSync(cached) && statSync(cached).size > 0) return readFileSync(cached);
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeoutMs);
    const r = await fetch(url, { signal: c.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(cached, buf);
    return buf;
  } catch { return null; }
}

// L2-normalize a Float32Array in place (returns the same array).
function normalize(vec) {
  let n = 0;
  for (let i = 0; i < vec.length; i++) n += vec[i] * vec[i];
  n = Math.sqrt(n);
  if (n === 0) return vec;
  for (let i = 0; i < vec.length; i++) vec[i] /= n;
  return vec;
}
function cosine(a, b) {
  // Both already L2-normalized → cosine = dot product
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// -------- Load CLIP --------
console.log("A carregar CLIP ViT-B/32…");
const t0 = Date.now();
const extractor = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32");
console.log(`OK (${((Date.now() - t0) / 1000).toFixed(1)}s)`);

// -------- Embedding com cache --------
// Chave da cache = hash MD5 do buffer da imagem (imutável se a imagem
// não mudou). Retorna Float32Array(512) L2-normalizado.
async function embed(buf, cacheKey) {
  const cached = path.join(EMB_CACHE, cacheKey + ".f32");
  if (existsSync(cached) && statSync(cached).size === 512 * 4) {
    return new Float32Array(readFileSync(cached).buffer, 0, 512);
  }
  // Decode qualquer formato (webp/jpg/png) → raw RGBA → RawImage
  const { data, info } = await sharp(buf, { failOn: "none", unlimited: true })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const img = new RawImage(new Uint8ClampedArray(data), info.width, info.height, 4);
  const result = await extractor(img, { pooling: "mean", normalize: true });
  const vec = normalize(new Float32Array(result.data));
  writeFileSync(cached, Buffer.from(vec.buffer));
  return vec;
}

// -------- Excel + refs --------
const wb = xlsx.readFile(XLSX_PATH, { raw: true });
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null, raw: true });
const refs = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i]; if (!r) continue;
  const ref = r[1] == null ? "" : String(r[1]).trim();
  if (!ref) continue;
  const title = r[3] == null ? "" : String(r[3]).trim();
  const excelImgs = collectImages(r);
  const locals = findLocalImagesForRef(ref);
  if (!excelImgs.length || !locals.length) continue;
  refs.push({ ref, title, excelImgs, locals });
}
console.log(`Refs a processar: ${refs.length}`);

// -------- Embed all locals --------
console.log(`\nEmbedding locais (${refs.reduce((s, r) => s + r.locals.length, 0)} imagens)…`);
const localVecs = new Map(); // web path -> Float32Array
const t1 = Date.now();
let doneL = 0;
for (const r of refs) {
  for (const l of r.locals) {
    if (localVecs.has(l.web)) continue;
    const abs = path.join(PUBLIC_DIR, l.web.replace(/^\//, ""));
    const buf = readFileSync(abs);
    const key = "local_" + md5(l.web);
    try {
      const vec = await embed(buf, key);
      localVecs.set(l.web, vec);
    } catch (e) {
      console.error(`  skip ${l.web}: ${e.message.slice(0, 80)}`);
    }
    doneL++;
    if (doneL % 50 === 0) process.stdout.write(`  ${doneL}\r`);
  }
}
console.log(`  ${doneL} feito em ${((Date.now() - t1) / 1000).toFixed(1)}s`);

// -------- Embed all Starbrands --------
console.log(`\nEmbedding Starbrands (${refs.reduce((s, r) => s + r.excelImgs.length, 0)} URLs)…`);
const excelVecs = new Map(); // url -> Float32Array
const t2 = Date.now();
let doneE = 0, failedE = 0;
for (const r of refs) {
  for (const u of r.excelImgs) {
    if (excelVecs.has(u)) continue;
    const buf = await fetchToCache(u);
    if (!buf) { failedE++; continue; }
    const key = "excel_" + md5(u);
    try {
      const vec = await embed(buf, key);
      excelVecs.set(u, vec);
    } catch (e) {
      failedE++;
      if (failedE <= 5) console.error(`  skip ${u.slice(-50)}: ${e.message.slice(0, 60)}`);
    }
    doneE++;
    if (doneE % 50 === 0) process.stdout.write(`  ${doneE}\r`);
  }
}
console.log(`  ${doneE} feito em ${((Date.now() - t2) / 1000).toFixed(1)}s   (${failedE} falhas)`);

// -------- Match + verdict per ref --------
function verdictOf(sim) {
  if (sim >= 0.95) return "SAME";
  if (sim >= 0.85) return "PROB_SAME";
  if (sim >= 0.70) return "AMBIGUOUS";
  return "DIFFERENT";
}

console.log(`\nMatching por cosine similarity…`);
const output = [];
for (const r of refs) {
  const L = r.locals.map(l => ({ web: l.web, vec: localVecs.get(l.web) })).filter(x => x.vec);
  const E = r.excelImgs.map(u => ({ url: u, vec: excelVecs.get(u) })).filter(x => x.vec);

  const cand = [];
  for (let li = 0; li < L.length; li++) for (let ei = 0; ei < E.length; ei++) {
    const sim = cosine(L[li].vec, E[ei].vec);
    cand.push({ li, ei, sim });
  }
  cand.sort((a, b) => b.sim - a.sim); // best match first

  const usedL = new Set(), usedE = new Set();
  const pairs = [];
  for (const c of cand) {
    if (usedL.has(c.li) || usedE.has(c.ei)) continue;
    usedL.add(c.li); usedE.add(c.ei);
    pairs.push({
      local: L[c.li].web,
      excel: E[c.ei].url,
      sim: +c.sim.toFixed(4),
      verdict: verdictOf(c.sim),
    });
  }
  const orphansLocal = L.filter((_, i) => !usedL.has(i)).map(l => l.web);
  const orphansExcel = E.filter((_, i) => !usedE.has(i)).map(e => e.url);

  // Embed local as data URI for the HTML
  const pairsWithData = pairs.map((p) => {
    const abs = path.join(PUBLIC_DIR, p.local.replace(/^\//, ""));
    const bytes = readFileSync(abs);
    return { ...p, localDataUri: `data:image/webp;base64,${bytes.toString("base64")}` };
  });
  const orphansLocalData = orphansLocal.map((w) => {
    const abs = path.join(PUBLIC_DIR, w.replace(/^\//, ""));
    return `data:image/webp;base64,${readFileSync(abs).toString("base64")}`;
  });

  output.push({
    ref: r.ref, title: r.title,
    pairs: pairsWithData,
    orphansLocal: orphansLocalData,
    orphansExcel,
  });
}

// -------- Categorize + auto decisions --------
const autoState = {};
let allSameRefs = 0, allDiffRefs = 0, mixedRefs = 0;
let samePairs = 0, probSamePairs = 0, ambigPairs = 0, diffPairs = 0;
for (const r of output) {
  const verdicts = r.pairs.map(p => p.verdict);
  const hasOrphans = r.orphansLocal.length + r.orphansExcel.length > 0;
  const allSame = verdicts.every(v => v === "SAME" || v === "PROB_SAME");
  const allDiff = verdicts.every(v => v === "DIFFERENT");
  if (allSame && !hasOrphans) allSameRefs++;
  else if (allDiff && !hasOrphans) allDiffRefs++;
  else mixedRefs++;

  for (let i = 0; i < r.pairs.length; i++) {
    const v = r.pairs[i].verdict;
    if (v === "SAME") { samePairs++; autoState[r.ref + "#" + i] = "keep"; }
    else if (v === "PROB_SAME") { probSamePairs++; autoState[r.ref + "#" + i] = "keep"; }
    else if (v === "AMBIGUOUS") ambigPairs++;
    else if (v === "DIFFERENT") { diffPairs++; }
  }
}
const totalPairs = output.reduce((s, r) => s + r.pairs.length, 0);
console.log("\n=================================");
console.log("VERDICTOS CLIP (semântico)");
console.log("=================================");
console.log(`Refs totais:         ${output.length}`);
console.log(`  · TODAS same/prob: ${allSameRefs}  → auto-KEEP, não precisa revisão`);
console.log(`  · TODAS different: ${allDiffRefs}`);
console.log(`  · MISTO:           ${mixedRefs}`);
console.log(`\nPares totais:        ${totalPairs}`);
console.log(`  · SAME (sim≥0.95):   ${samePairs}   AUTO-KEEP`);
console.log(`  · PROB (0.85-0.95):  ${probSamePairs}   AUTO-KEEP (podes over)`);
console.log(`  · AMBÍGUO (0.70-0.85): ${ambigPairs}   PRECISA REVISÃO`);
console.log(`  · DIFFERENT (<0.70):  ${diffPairs}   provavelmente reverter`);
console.log(`\nÓrfãos: ${output.reduce((s, r) => s + r.orphansLocal.length, 0)} locais + ${output.reduce((s, r) => s + r.orphansExcel.length, 0)} starbrands`);

// -------- HTML --------
const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Review v6 · CLIP semântico</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f7f4ec; color: #1a1712; margin: 0; padding: 0 0 60px; }
  header { position: sticky; top: 0; background: #1a1712; color: #f7f4ec; padding: 12px 20px; display: flex; align-items: center; gap: 16px; z-index: 10; flex-wrap: wrap; }
  header h1 { margin: 0; font-family: Georgia, serif; font-size: 15px; }
  .progress { flex: 1; min-width: 200px; height: 8px; background: rgba(255,255,255,0.15); border-radius: 4px; overflow: hidden; }
  .progress .bar { height: 100%; background: #d4a017; transition: width 0.2s; }
  .stats { font-size: 12px; letter-spacing: 0.06em; color: #d4a017; white-space: nowrap; }
  button { font-family: inherit; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.3); background: transparent; color: #f7f4ec; padding: 6px 10px; cursor: pointer; border-radius: 2px; }
  button:hover { border-color: #d4a017; color: #d4a017; }
  button.primary { background: #d4a017; color: #1a1712; border-color: #d4a017; }
  .navBar { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #f0ead4; position: sticky; top: 60px; z-index: 9; flex-wrap: wrap; }
  .navBar .pgLabel { font-size: 13px; color: #666; margin: 0 8px; }
  .navBar .bulkBtns { margin-left: auto; display: flex; gap: 8px; }
  .navBar .bulkBtns button { color: #1a1712; border-color: #ccc; }
  .navBar .bulkBtns button.keep { background: #3b7551; color: white; border-color: #3b7551; }
  .navBar .bulkBtns button.revert { background: #b94a3a; color: white; border-color: #b94a3a; }
  main { max-width: 1400px; margin: 0 auto; padding: 20px; }
  .refCard { background: white; border: 1px solid #e6decc; margin-bottom: 16px; padding: 16px; }
  .refHead { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  .refHead .ref { font-family: monospace; font-size: 18px; color: #9c7a26; }
  .refHead .title { flex: 1; color: #666; font-size: 13px; margin: 0 12px; }
  .refHead .meta { font-size: 11px; color: #999; }
  .refBtns { display: flex; gap: 6px; margin: 6px 0 12px; }
  .refBtns button { color: #1a1712; border-color: #ccc; padding: 4px 10px; font-size: 10px; }
  .refBtns button.k { background: #3b7551; color: white; border-color: #3b7551; }
  .refBtns button.r { background: #b94a3a; color: white; border-color: #b94a3a; }
  .pair { display: grid; grid-template-columns: 100px 1fr 1fr 150px; gap: 12px; align-items: center; padding: 10px 0; border-top: 1px solid #f0ead4; }
  .pair:first-of-type { border-top: none; }
  .pair .sig { font-family: monospace; font-size: 10px; text-align: center; padding: 6px 6px; border-radius: 3px; line-height: 1.4; }
  .pair .sig.same       { background: #b8e6b8; color: #1e4020; }
  .pair .sig.prob_same  { background: #d4f0d4; color: #2d5f2d; }
  .pair .sig.ambiguous  { background: #fff3d4; color: #7a5a0a; }
  .pair .sig.different  { background: #f7d4d4; color: #8c2a2a; }
  .pair .sig .v { font-weight: bold; letter-spacing: 0.1em; display: block; margin-bottom: 3px; font-size: 10px; }
  .pair .sig .sim { font-size: 14px; font-weight: bold; }
  .pair .img { text-align: center; }
  .pair .img img { max-width: 100%; max-height: 220px; object-fit: contain; background: #fff; border: 1px solid #f0ead4; }
  .pair .img .lab { margin-top: 3px; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #aaa; }
  .pair .btns { display: flex; flex-direction: column; gap: 4px; }
  .pair .btns button { padding: 6px 10px; text-align: center; color: #1a1712; border-color: #ccc; font-size: 10px; }
  .pair .btns .keep.on { background: #3b7551; color: white; border-color: #3b7551; }
  .pair .btns .revert.on { background: #b94a3a; color: white; border-color: #b94a3a; }
  .pair.decided-keep { background: rgba(59, 117, 81, 0.04); }
  .pair.decided-revert { background: rgba(185, 74, 58, 0.06); }
  .orphans { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #ddd; font-size: 12px; color: #666; }
  .orphans strong { color: #1a1712; }
  .orphanGrid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
  .orphanGrid img { max-height: 120px; max-width: 160px; object-fit: contain; background: #fff; border: 1px solid #f0ead4; padding: 2px; }
  .pgFooter { text-align: center; padding: 20px 0; display: flex; justify-content: center; gap: 12px; align-items: center; }
  .exportPanel { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: none; align-items: center; justify-content: center; z-index: 100; }
  .exportPanel.open { display: flex; }
  .exportBox { background: white; padding: 24px; max-width: 700px; width: 90%; }
  .exportBox textarea { width: 100%; height: 320px; font-family: monospace; font-size: 12px; padding: 8px; border: 1px solid #e6decc; }
</style></head>
<body>
<header>
  <h1>Review v6 · CLIP semântico · <span id="statsLabel"></span></h1>
  <div class="progress"><div class="bar" id="bar"></div></div>
  <div class="stats">
    <span style="color:#3b7551">✓ <span id="keepCount">0</span></span> ·
    <span style="color:#b94a3a">✗ <span id="revertCount">0</span></span> ·
    pending <span id="pendingCount">0</span>
  </div>
  <button class="primary" onclick="openExport()">Exportar</button>
</header>
<div class="navBar">
  <button onclick="prevPage()">◀ Anterior</button>
  <span class="pgLabel">Página <strong id="pgNum">1</strong> / <strong id="pgTotal">1</strong></span>
  <button onclick="nextPage()">Seguinte ▶</button>
  <label style="font-size:12px;color:#666;margin-left:12px">Ir para: <input type="number" id="pgJump" min="1" style="width:60px" onchange="goToPage(parseInt(this.value,10))"></label>
  <label style="font-size:12px;color:#666;margin-left:12px">Filtro:
    <select id="filter" onchange="applyFilter()">
      <option value="pending" selected>Só refs pendentes</option>
      <option value="ambiguous">Só AMBÍGUAS</option>
      <option value="different">Só DIFFERENT</option>
      <option value="orphans">Só refs com órfãos</option>
      <option value="all">Todas</option>
    </select>
  </label>
  <div class="bulkBtns">
    <button class="keep" onclick="setPage('keep')">✓ Aprovar TODA a página</button>
    <button class="revert" onclick="setPage('revert')">✗ Reverter TODA a página</button>
  </div>
</div>

<main id="main"></main>

<div class="pgFooter">
  <button onclick="prevPage()">◀ Anterior</button>
  <span class="pgLabel">Página <span id="pgNumFoot">1</span> / <span id="pgTotalFoot">1</span></span>
  <button onclick="nextPage()">Seguinte ▶</button>
</div>

<div class="exportPanel" id="exportPanel">
  <div class="exportBox">
    <h2>Lista final de reverts</h2>
    <textarea id="exportText" readonly></textarea>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
      <button onclick="closeExport()">Fechar</button>
      <button class="primary" onclick="copyExport()">Copiar</button>
    </div>
  </div>
</div>

<script>
const REFS = ${JSON.stringify(output)};
const AUTO = ${JSON.stringify(autoState)};
const PAGE_SIZE = ${PAGE_SIZE};
const KEY = "std-image-review-v6";
let state = JSON.parse(localStorage.getItem(KEY) ?? "{}");
for (const [k, v] of Object.entries(AUTO)) if (!(k in state)) state[k] = v;
localStorage.setItem(KEY, JSON.stringify(state));
let pgIdx = parseInt(localStorage.getItem(KEY + "-pg") ?? "0", 10) || 0;
let currentFilter = "pending";

function pairKey(ref, i) { return ref + "#" + i; }
function getDec(ref, i) { return state[pairKey(ref, i)] ?? null; }
function setDec(ref, i, v) {
  const k = pairKey(ref, i);
  if (v === null) delete state[k]; else state[k] = v;
  localStorage.setItem(KEY, JSON.stringify(state));
}
function verdictClass(v) { return v.toLowerCase(); }

function filteredRefs() {
  if (currentFilter === "all") return REFS;
  if (currentFilter === "pending") return REFS.filter(r => r.pairs.some((_, i) => !getDec(r.ref, i)));
  if (currentFilter === "ambiguous") return REFS.filter(r => r.pairs.some(p => p.verdict === "AMBIGUOUS"));
  if (currentFilter === "different") return REFS.filter(r => r.pairs.some(p => p.verdict === "DIFFERENT"));
  if (currentFilter === "orphans") return REFS.filter(r => r.orphansLocal.length + r.orphansExcel.length > 0);
  return REFS;
}
function currentPage() {
  const filt = filteredRefs();
  const totalPages = Math.max(1, Math.ceil(filt.length / PAGE_SIZE));
  if (pgIdx >= totalPages) pgIdx = totalPages - 1;
  if (pgIdx < 0) pgIdx = 0;
  return { page: filt.slice(pgIdx * PAGE_SIZE, (pgIdx + 1) * PAGE_SIZE), totalPages, totalFiltered: filt.length };
}

function render() {
  const { page, totalPages, totalFiltered } = currentPage();
  const main = document.getElementById("main");
  main.innerHTML = "";
  document.getElementById("pgNum").textContent = pgIdx + 1;
  document.getElementById("pgTotal").textContent = totalPages;
  document.getElementById("pgNumFoot").textContent = pgIdx + 1;
  document.getElementById("pgTotalFoot").textContent = totalPages;

  page.forEach((r) => {
    const card = document.createElement("div");
    card.className = "refCard";
    card.innerHTML = \`
      <div class="refHead">
        <div class="ref">\${r.ref}</div>
        <div class="title">\${r.title}</div>
        <div class="meta">\${r.pairs.length} par(es) · \${r.orphansLocal.length}L + \${r.orphansExcel.length}E órfãos</div>
      </div>
      <div class="refBtns">
        <span style="color:#666;font-size:11px;align-self:center;margin-right:4px">Ref inteira:</span>
        <button class="k" onclick="setRef('\${r.ref}', 'keep')">✓ Manter tudo</button>
        <button class="r" onclick="setRef('\${r.ref}', 'revert')">✗ Reverter tudo</button>
        <button onclick="setRef('\${r.ref}', null)">Limpar</button>
      </div>
      \${r.pairs.map((p, i) => {
        const d = getDec(r.ref, i);
        return \`
          <div class="pair \${d ? 'decided-' + d : ''}">
            <div class="sig \${verdictClass(p.verdict)}">
              <span class="v">\${p.verdict}</span>
              <span class="sim">\${(p.sim * 100).toFixed(1)}%</span>
            </div>
            <div class="img"><img loading="lazy" decoding="async" src="\${p.localDataUri}"><div class="lab">Local</div></div>
            <div class="img"><img loading="lazy" decoding="async" src="\${p.excel}"><div class="lab">Starbrands</div></div>
            <div class="btns">
              <button class="keep \${d === 'keep' ? 'on' : ''}" onclick="toggle('\${r.ref}', \${i}, 'keep')">✓ Manter</button>
              <button class="revert \${d === 'revert' ? 'on' : ''}" onclick="toggle('\${r.ref}', \${i}, 'revert')">✗ Reverter</button>
            </div>
          </div>
        \`;
      }).join("")}
      \${r.orphansLocal.length ? \`<div class="orphans"><strong>Só local (Starbrands não tem):</strong><div class="orphanGrid">\${r.orphansLocal.map(u => \`<img loading="lazy" src="\${u}">\`).join("")}</div></div>\` : ""}
      \${r.orphansExcel.length ? \`<div class="orphans"><strong>Só Starbrands (não temos localmente):</strong><div class="orphanGrid">\${r.orphansExcel.map(u => \`<img loading="lazy" src="\${u}">\`).join("")}</div></div>\` : ""}
    \`;
    main.appendChild(card);
  });
  updateStats(totalFiltered);
  localStorage.setItem(KEY + "-pg", String(pgIdx));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function setRef(ref, v) {
  const r = REFS.find(x => x.ref === ref); if (!r) return;
  r.pairs.forEach((_, i) => setDec(ref, i, v));
  render();
}
function toggle(ref, i, v) {
  const cur = getDec(ref, i);
  setDec(ref, i, cur === v ? null : v);
  render();
}
function setPage(v) {
  const { page } = currentPage();
  page.forEach((r) => r.pairs.forEach((_, i) => setDec(r.ref, i, v)));
  render();
}
function prevPage() { if (pgIdx > 0) { pgIdx--; render(); } }
function nextPage() { const { totalPages } = currentPage(); if (pgIdx < totalPages - 1) { pgIdx++; render(); } }
function goToPage(n) { const { totalPages } = currentPage(); if (!isNaN(n)) { pgIdx = Math.max(0, Math.min(totalPages - 1, n - 1)); render(); } }
function applyFilter() { currentFilter = document.getElementById("filter").value; pgIdx = 0; render(); }
function updateStats(vRefs) {
  let total = 0, keep = 0, revert = 0;
  for (const r of REFS) for (let i = 0; i < r.pairs.length; i++) {
    total++;
    const d = getDec(r.ref, i);
    if (d === "keep") keep++;
    else if (d === "revert") revert++;
  }
  document.getElementById("keepCount").textContent = keep;
  document.getElementById("revertCount").textContent = revert;
  document.getElementById("pendingCount").textContent = total - keep - revert;
  document.getElementById("statsLabel").textContent = vRefs + " refs · " + total + " pares";
  document.getElementById("bar").style.width = (100 * (keep + revert) / Math.max(1, total)) + "%";
}
function openExport() {
  const groups = {};
  for (const r of REFS) for (let i = 0; i < r.pairs.length; i++) {
    if (getDec(r.ref, i) === "revert") {
      groups[r.ref] = groups[r.ref] || [];
      groups[r.ref].push(r.pairs[i].local);
    }
  }
  const txt = Object.entries(groups).map(([ref, arr]) => \`\${ref}  → reverter: \${arr.join(" · ")}\`).join("\\n");
  document.getElementById("exportText").value = txt || "(nada marcado para reverter)";
  document.getElementById("exportPanel").classList.add("open");
}
function closeExport() { document.getElementById("exportPanel").classList.remove("open"); }
function copyExport() {
  const t = document.getElementById("exportText"); t.select(); document.execCommand("copy");
  const b = event.target; const old = b.textContent; b.textContent = "Copiado ✓"; setTimeout(() => b.textContent = old, 1500);
}
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
  if (e.key === "ArrowRight") { e.preventDefault(); nextPage(); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); prevPage(); }
});
render();
</script>
</body></html>`;
writeFileSync(OUT, html);
console.log(`\nHTML v6 escrito em: ${OUT}`);
console.log(`Tamanho: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
