// Sanity check: para variants onde o Excel traz URLs "diferentes" das nossas,
// verificar (a) se são de hosts diferentes ou (b) se estão a apontar para o
// mesmo ficheiro (nome de ficheiro final igual apesar do path diferente).
// Baixa também 5 pares aleatórios e compara hashes SHA-256 dos bytes para
// dar prova cabal de "iguais" vs "diferentes".
import "dotenv/config";
import xlsx from "xlsx";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const XLSX_PATH = "C:/Users/UTILIZ~1/AppData/Local/Temp/std-links.xlsx";

function candidateSkus(ref: string): string[] {
  const tail = ref.replace(/^STD/i, "");
  const out = new Set<string>([tail, ref]);
  if (/^000\d{3}$/.test(tail)) out.add("9" + tail.slice(1));
  return [...out];
}
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
function hostOf(u: string): string { try { return new URL(u).host; } catch { return "?"; } }
function fileOf(u: string): string { try { return decodeURIComponent(new URL(u).pathname.split("/").pop() ?? ""); } catch { return "?"; } }

const SITE_BASE = "https://st-dupont-online-store.vercel.app";
async function sha256(url: string, timeoutMs = 20000): Promise<{ size: number; hash: string; url: string } | null> {
  const full = url.startsWith("http") ? url : `${SITE_BASE}${url}`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(full, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return { size: buf.length, hash: createHash("sha256").update(buf).digest("hex"), url: full };
  } catch { return null; }
}

async function main() {
  const wb = xlsx.readFile(XLSX_PATH, { raw: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null, raw: true });
  const fileByRef = new Map<string, string[]>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue;
    const ref = r[1] == null ? "" : String(r[1]).trim();
    if (!ref) continue;
    fileByRef.set(ref, collectImages(r));
  }

  const variants = await prisma.productVariant.findMany({ select: { sku: true, images: true } });
  const bySku = new Map(variants.map((v) => [v.sku.toUpperCase(), v]));

  // ---- 1. HOSTS ----
  const excelHosts = new Map<string, number>();
  const ourHosts = new Map<string, number>();
  const pairs: { sku: string; ours: string; excel: string; sameFile: boolean }[] = [];
  let slotsCompared = 0, slotsSameFile = 0, slotsDifferentFile = 0;

  for (const [ref, imgs] of fileByRef) {
    for (const c of candidateSkus(ref)) {
      const v = bySku.get(c.toUpperCase());
      if (!v) continue;
      const oursArr = v.images ?? [];
      // compara slot-a-slot (as posições onde AMBOS têm URL, e as URLs
      // diferem literalmente — os "replace" reais)
      const commonLen = Math.min(oursArr.length, imgs.length);
      for (let i = 0; i < commonLen; i++) {
        const excel = imgs[i]; const ours = oursArr[i];
        if (!excel || !ours) continue;
        excelHosts.set(hostOf(excel), (excelHosts.get(hostOf(excel)) ?? 0) + 1);
        ourHosts.set(hostOf(ours), (ourHosts.get(hostOf(ours)) ?? 0) + 1);
        if (excel === ours) continue;
        slotsCompared++;
        const same = fileOf(excel).toLowerCase() === fileOf(ours).toLowerCase();
        if (same) slotsSameFile++; else slotsDifferentFile++;
        if (pairs.length < 200) pairs.push({ sku: v.sku, ours, excel, sameFile: same });
      }
      break;
    }
  }

  console.log("=== Hosts (URLs que APARECEM em slots comuns) ===");
  console.log("Excel:");
  for (const [h, n] of [...excelHosts.entries()].sort((a,b) => b[1] - a[1])) console.log(`  ${h.padEnd(40)} ${n}`);
  console.log("\nNós:");
  for (const [h, n] of [...ourHosts.entries()].sort((a,b) => b[1] - a[1])) console.log(`  ${h.padEnd(40)} ${n}`);

  console.log(`\n=== Slots onde a URL difere entre nós e o Excel ===`);
  console.log(`Comparados:        ${slotsCompared}`);
  console.log(`Mesmo ficheiro final (só o host/path muda): ${slotsSameFile}`);
  console.log(`Ficheiro DIFERENTE:                          ${slotsDifferentFile}`);

  // Amostra dos "same file" (para o utilizador confirmar que é redundância)
  const sameSamples = pairs.filter(p => p.sameFile).slice(0, 10);
  const diffSamples = pairs.filter(p => !p.sameFile).slice(0, 10);
  console.log(`\nAmostra 'mesmo ficheiro' (${Math.min(10, sameSamples.length)} de ${slotsSameFile}):`);
  for (const p of sameSamples) console.log(`  ${p.sku}\n     nosso : ${p.ours}\n     excel : ${p.excel}`);
  console.log(`\nAmostra 'ficheiro DIFERENTE' (${Math.min(10, diffSamples.length)} de ${slotsDifferentFile}):`);
  for (const p of diffSamples) console.log(`  ${p.sku}\n     nosso : ${p.ours}\n     excel : ${p.excel}`);

  // ---- 2. HASH SHA-256 de 5 pares aleatórios (prova cabal) ----
  const toHash = [...(sameSamples.slice(0, 3)), ...(diffSamples.slice(0, 5))];
  console.log(`\n=== SHA-256 de ${toHash.length} pares (prova cabal) ===`);
  for (const p of toHash) {
    const [oh, eh] = await Promise.all([sha256(p.ours), sha256(p.excel)]);
    if (!oh || !eh) { console.log(`  ${p.sku}: um dos downloads falhou (ours ${oh ? "ok" : "FAIL"}, excel ${eh ? "ok" : "FAIL"})`); continue; }
    const equal = oh.hash === eh.hash;
    console.log(`  ${p.sku}   ${equal ? "IGUAIS" : "DIFERENTES"}   (${oh.size} vs ${eh.size} bytes)`);
    if (!equal) {
      console.log(`     nosso : ${p.ours}  → ${oh.hash.slice(0, 16)}…`);
      console.log(`     excel : ${p.excel}  → ${eh.hash.slice(0, 16)}…`);
    }
  }

  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
