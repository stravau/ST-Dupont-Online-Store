// Gera a página de revisão das traduções a partir de i18n-todo.csv (do
// i18n-report) + i18n-traducoes.json (as traduções propostas).
//
//   npx tsx scripts/i18n-review-build.ts
//     → escreve i18n-review.html  (abre no browser, revê, exporta o aprovado)
//
// O HTML é autónomo: original vs tradução lado a lado, cada linha com
// Aprovar / Rejeitar, o texto editável, e um botão que descarrega
// i18n-aprovado.json para o script de aplicação consumir. Não grava nada
// na base de dados — isso é o passo seguinte, e só com o que foi aprovado.
import * as fs from "fs";

interface Item {
  tabela: string;
  ref: string;
  campo: string;
  original: string;
  traducao: string;
}

// --- ler o CSV do relatório (tabela,ref,campo,problema,chars,texto_original)
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [], val = "", quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { val += '"'; i++; }
      else if (c === '"') quoted = false;
      else val += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { cur.push(val); val = ""; }
    else if (c === "\n") { cur.push(val); rows.push(cur); cur = []; val = ""; }
    else if (c !== "\r") val += c;
  }
  if (val || cur.length) { cur.push(val); rows.push(cur); }
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ""])));
}

const csvPath = "i18n-todo.csv";
const trPath = "i18n-traducoes.json";
if (!fs.existsSync(csvPath)) {
  console.error(`Falta ${csvPath}. Corre primeiro:  npx tsx scripts/i18n-report.ts --csv`);
  process.exit(1);
}
const csv = parseCsv(fs.readFileSync(csvPath, "utf8"));
const traducoes: Record<string, string> = fs.existsSync(trPath)
  ? JSON.parse(fs.readFileSync(trPath, "utf8"))
  : {};

const key = (r: { tabela: string; ref: string; campo: string }) => `${r.tabela}|${r.ref}|${r.campo}`;
const items: Item[] = csv.map((r) => ({
  tabela: r.tabela, ref: r.ref, campo: r.campo,
  original: r.texto_original ?? "",
  traducao: traducoes[key({ tabela: r.tabela, ref: r.ref, campo: r.campo })] ?? "",
}));

const semTraducao = items.filter((i) => !i.traducao).length;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const html = `<!doctype html>
<html lang="pt"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisão de traduções — S.T. Dupont</title>
<style>
  :root { --ink:#0a1a30; --cream:#eef3fa; --gold:#b58a34; --line:#d9dee7; --muted:#4a5a72; }
  * { box-sizing: border-box; }
  body { margin:0; font:15px/1.55 -apple-system,Segoe UI,Roboto,sans-serif; background:var(--cream); color:var(--ink); }
  header { position:sticky; top:0; z-index:10; background:var(--ink); color:var(--cream); padding:14px 20px;
           display:flex; flex-wrap:wrap; gap:14px; align-items:center; }
  header h1 { margin:0; font-size:16px; letter-spacing:.14em; text-transform:uppercase; font-weight:600; }
  .stat { font-size:13px; opacity:.85; }
  .stat b { color:#e7c98b; }
  button { font:inherit; cursor:pointer; border:1px solid var(--line); background:#fff; padding:7px 14px; border-radius:2px; }
  button.primary { background:var(--gold); border-color:var(--gold); color:#fff; font-weight:600; }
  main { padding:20px; max-width:1400px; margin:0 auto; }
  .row { background:#fff; border:1px solid var(--line); border-left:3px solid var(--line); margin-bottom:12px; }
  .row.ok { border-left-color:#2bb673; }
  .row.no { border-left-color:#b94a3a; opacity:.55; }
  .meta { display:flex; flex-wrap:wrap; gap:10px; align-items:center; padding:8px 14px; border-bottom:1px solid var(--line);
          font-size:12px; color:var(--muted); }
  .tag { background:var(--cream); padding:2px 8px; border-radius:2px; font-family:ui-monospace,monospace; font-size:11px; }
  .cols { display:grid; grid-template-columns:1fr 1fr; }
  @media (max-width:900px){ .cols { grid-template-columns:1fr; } }
  .col { padding:12px 14px; }
  .col + .col { border-left:1px solid var(--line); }
  .lbl { font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .orig { white-space:pre-wrap; color:var(--muted); }
  textarea { width:100%; min-height:80px; font:inherit; padding:8px; border:1px solid var(--line); border-radius:2px; resize:vertical; }
  .acts { display:flex; gap:8px; padding:0 14px 12px; }
  .missing { background:#fff7e6; border:1px solid #e8c877; padding:10px 14px; margin-bottom:14px; font-size:13px; }
</style></head>
<body>
<header>
  <h1>Revisão de traduções</h1>
  <span class="stat"><b id="nOk">0</b> aprovadas · <b id="nNo">0</b> rejeitadas · <b id="nTodo">0</b> por decidir</span>
  <span style="flex:1"></span>
  <button onclick="aprovarTodas()">Aprovar todas</button>
  <button class="primary" onclick="exportar()">Descarregar aprovadas</button>
</header>
<main>
  ${semTraducao ? `<div class="missing"><b>${semTraducao}</b> campos ainda sem tradução proposta — aparecem com a caixa vazia; podes escrever à mão.</div>` : ""}
  <div id="lista"></div>
</main>
<script>
const ITEMS = ${JSON.stringify(items)};
const estado = {}; // key -> "ok" | "no"
const K = (i) => i.tabela + "|" + i.ref + "|" + i.campo;

function render() {
  document.getElementById("lista").innerHTML = ITEMS.map((it, idx) => {
    const k = K(it), st = estado[k] || "";
    return \`<div class="row \${st}" id="r\${idx}">
      <div class="meta">
        <span class="tag">\${it.tabela}.\${it.campo}</span>
        <span>\${it.ref}</span>
      </div>
      <div class="cols">
        <div class="col"><div class="lbl">Original</div><div class="orig">\${esc(it.original)}</div></div>
        <div class="col"><div class="lbl">Português</div>
          <textarea oninput="edit(\${idx}, this.value)">\${esc(it.traducao)}</textarea></div>
      </div>
      <div class="acts">
        <button onclick="marcar(\${idx},'ok')">✓ Aprovar</button>
        <button onclick="marcar(\${idx},'no')">✕ Rejeitar</button>
      </div>
    </div>\`;
  }).join("");
  cont();
}
function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function edit(i, v){ ITEMS[i].traducao = v; }
function marcar(i, v){ estado[K(ITEMS[i])] = v; const el = document.getElementById("r"+i); el.className = "row " + v; cont(); }
function aprovarTodas(){ ITEMS.forEach(it => { if (it.traducao.trim()) estado[K(it)] = "ok"; }); render(); }
function cont(){
  const vals = Object.values(estado);
  document.getElementById("nOk").textContent = vals.filter(v=>v==="ok").length;
  document.getElementById("nNo").textContent = vals.filter(v=>v==="no").length;
  document.getElementById("nTodo").textContent = ITEMS.length - vals.length;
}
function exportar(){
  const out = ITEMS.filter(it => estado[K(it)] === "ok" && it.traducao.trim())
                   .map(it => ({ tabela: it.tabela, ref: it.ref, campo: it.campo, pt: it.traducao.trim() }));
  if (!out.length) { alert("Nada aprovado ainda."); return; }
  const blob = new Blob([JSON.stringify(out, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "i18n-aprovado.json"; a.click();
}
render();
</script>
</body></html>`;

fs.writeFileSync("i18n-review.html", html, "utf8");
console.log(`✓ i18n-review.html escrito — ${items.length} campos (${semTraducao} sem tradução proposta).`);
console.log("  Abre no browser, revê, e carrega em «Descarregar aprovadas».");
