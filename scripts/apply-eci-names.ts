// Reads the ECI DB sheet and rewrites variant NAMES + COLOURS in seed-
// data.ts using the ECI descriptions as the source of truth. Only
// touches variants where the trailing tokens of the ECI desc match
// known colour keywords — anything ambiguous is skipped so we don't
// ship garbage like "Ligne 2 — Isqueiro L2 Verticale Preto".
//
// Dry-run by default; --apply writes seed-data.ts. Push those edits
// to Neon with `npm run names:sync -- --apply`.
//
//   npx tsx scripts/apply-eci-names.ts
//   npx tsx scripts/apply-eci-names.ts --apply

import * as fs from "fs";
import * as xlsx from "xlsx";

const SEED_PATH = "prisma/seed-data.ts";
const ECI_PATH = "c:/Users/Utilizador/Desktop/ECI_LIS_Controlo_v1_2_2026 (002).xlsx";
const APPLY = process.argv.includes("--apply");

// Colour / finish glossary keyed on the raw ECI token (uppercase).
// value.pt / value.en are the display strings; value.hex is the
// swatch colour used when this token is a solo colour (multi-token
// specs merge hexes).
const COLOUR: Record<string, { pt: string; en: string; hex: string }> = {
  BLACK:    { pt: "Preto",       en: "Black",      hex: "#15171c" },
  BLK:      { pt: "Preto",       en: "Black",      hex: "#15171c" },
  WHITE:    { pt: "Branco",      en: "White",      hex: "#f2f2f0" },
  WHT:      { pt: "Branco",      en: "White",      hex: "#f2f2f0" },
  BLUE:     { pt: "Azul",        en: "Blue",       hex: "#1f3c66" },
  BLU:      { pt: "Azul",        en: "Blue",       hex: "#1f3c66" },
  NAVY:     { pt: "Marinho",     en: "Navy",       hex: "#1a2440" },
  GREEN:    { pt: "Verde",       en: "Green",      hex: "#1f6b3a" },
  GRN:      { pt: "Verde",       en: "Green",      hex: "#1f6b3a" },
  RED:      { pt: "Vermelho",    en: "Red",        hex: "#7d2b27" },
  BURGUNDY: { pt: "Bordô",       en: "Burgundy",   hex: "#6b1c2a" },
  BURG:     { pt: "Bordô",       en: "Burgundy",   hex: "#6b1c2a" },
  YELLOW:   { pt: "Amarelo",     en: "Yellow",     hex: "#e7c440" },
  YEL:      { pt: "Amarelo",     en: "Yellow",     hex: "#e7c440" },
  ORANGE:   { pt: "Laranja",     en: "Orange",     hex: "#e6752a" },
  ORA:      { pt: "Laranja",     en: "Orange",     hex: "#e6752a" },
  PURPLE:   { pt: "Roxo",        en: "Purple",     hex: "#6e3f8a" },
  VIOLET:   { pt: "Violeta",     en: "Violet",     hex: "#6e3f8a" },
  PINK:     { pt: "Rosa",        en: "Pink",       hex: "#e6a1b3" },
  ROSE:     { pt: "Rosa",        en: "Rose",       hex: "#e6a1b3" },
  BROWN:    { pt: "Castanho",    en: "Brown",      hex: "#6b4a2a" },
  GREY:     { pt: "Cinzento",    en: "Grey",       hex: "#7a7d83" },
  GRAY:     { pt: "Cinzento",    en: "Gray",       hex: "#7a7d83" },
  GRIS:     { pt: "Cinzento",    en: "Grey",       hex: "#7a7d83" },
  GOLD:     { pt: "Dourado",     en: "Gold",       hex: "#c8a24a" },
  GOLDEN:   { pt: "Dourado",     en: "Golden",     hex: "#c8a24a" },
  GLD:      { pt: "Dourado",     en: "Gold",       hex: "#c8a24a" },
  SILVER:   { pt: "Prateado",    en: "Silver",     hex: "#b9bcc2" },
  SILVERY:  { pt: "Prateado",    en: "Silvery",    hex: "#b9bcc2" },
  SIL:      { pt: "Prateado",    en: "Silver",     hex: "#b9bcc2" },
  PLATA:    { pt: "Prateado",    en: "Silver",     hex: "#b9bcc2" },
  CHROME:   { pt: "Crómio",      en: "Chrome",     hex: "#c9ccd1" },
  CROMADO:  { pt: "Cromado",     en: "Chromed",    hex: "#c9ccd1" },
  CHR:      { pt: "Crómio",      en: "Chrome",     hex: "#c9ccd1" },
  BRONZE:   { pt: "Bronze",      en: "Bronze",     hex: "#8c6b3a" },
  COPPER:   { pt: "Cobre",       en: "Copper",     hex: "#b87333" },
  PALLADIUM:{ pt: "Paládio",     en: "Palladium",  hex: "#b9bcc2" },
  PALADIO:  { pt: "Paládio",     en: "Palladium",  hex: "#b9bcc2" },
  PAL:      { pt: "Paládio",     en: "Palladium",  hex: "#b9bcc2" },
  CARBON:   { pt: "Carbono",     en: "Carbon",     hex: "#1a1a1a" },
};

interface ColourSpec {
  pt: string;
  en: string;
  hex: string[];
}

// Take the last 1-3 slash-joined tokens of the ECI desc; only accept
// as a colour spec if EVERY token in the tail matches the glossary.
function parseColourTail(desc: string): ColourSpec | null {
  const tokens = desc.trim().split(/\s+/);
  if (tokens.length === 0) return null;
  const tail = tokens[tokens.length - 1];
  const parts = tail.split(/[/+]/).map((p) => p.replace(/[.,;:]$/g, "").toUpperCase().trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const resolved = parts.map((p) => COLOUR[p]);
  if (resolved.some((r) => !r)) return null;
  return {
    pt: resolved.map((r) => r.pt).join(" / "),
    en: resolved.map((r) => r.en).join(" / "),
    hex: resolved.map((r) => r.hex),
  };
}

interface EciRow { sku: string; desc: string }

function loadEci(): Map<string, string> {
  const wb = xlsx.readFile(ECI_PATH);
  const ws = wb.Sheets["DB"];
  const rows = xlsx.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
  const map = new Map<string, string>();
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    if (!r || typeof r[1] !== "string") continue;
    const ref = r[1] as string;
    const desc = r[3] != null ? String(r[3]) : "";
    if (!desc) continue;
    // Store under both raw ref and STD-stripped tail for lookup flex.
    map.set(ref.toLowerCase(), desc);
    const tail = ref.replace(/^STD/i, "").toLowerCase();
    if (tail !== ref.toLowerCase()) map.set(tail, desc);
  }
  return map;
}

interface VariantLoc {
  sku: string;
  namePt: string;
  nameEn: string;
  priceCents: number;
  colourPt: string | null;
  productSlug: string;
  matchStart: number;
  matchEnd: number;
  original: string;
}

function findVariants(seed: string): VariantLoc[] {
  const out: VariantLoc[] = [];
  // Product-block scan so we know each variant's parent slug.
  const productRe = /\n    slug: `([a-z0-9-]+)`,[\s\S]*?(?=\n    slug: `|\n  ]\s*;)/g;
  let pm: RegExpExecArray | null;
  while ((pm = productRe.exec(seed))) {
    const productSlug = pm[1];
    const block = pm[0];
    const blockStart = pm.index;
    const vRe = /\{\s*sku:\s*`([^`]+)`,\s*name:\s*\{\s*pt:\s*`([^`]+)`,\s*en:\s*`([^`]+)`\s*\},[^\}]*priceCents:\s*(\d+)[\s\S]*?attributes:[\s\S]*?(?:color:\s*\{\s*label:\s*\{\s*pt:\s*`([^`]+)`)?[\s\S]*?(?=\{\s*sku:\s*`|\]\s*,\s*(?:image|attributes)|\]\s*\})/g;
    let vm: RegExpExecArray | null;
    while ((vm = vRe.exec(block))) {
      out.push({
        sku: vm[1],
        namePt: vm[2],
        nameEn: vm[3],
        priceCents: Number.parseInt(vm[4], 10),
        colourPt: vm[5] ?? null,
        productSlug,
        matchStart: blockStart + vm.index,
        matchEnd: blockStart + vm.index + vm[0].length,
        original: vm[0],
      });
    }
  }
  return out;
}

// Group variants by (product, name.pt, price, colour.pt) — the same
// customer-visible identity we used in previous audits. Anything with
// group size >= 2 is a candidate for a rename, because those siblings
// are guaranteed to render as visually duplicate cards.
function inDupGroup(all: VariantLoc[]): Set<string> {
  const groups = new Map<string, string[]>();
  for (const v of all) {
    const k = `${v.productSlug}|${v.namePt.toLowerCase()}|${v.priceCents}|${(v.colourPt ?? "").toLowerCase()}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(v.sku);
  }
  const out = new Set<string>();
  for (const [, skus] of groups) if (skus.length >= 2) for (const s of skus) out.add(s);
  return out;
}

function prefixOf(name: string): string {
  const idx = name.lastIndexOf(" — ");
  return idx >= 0 ? name.slice(0, idx) : name;
}

(async () => {
  const seed = fs.readFileSync(SEED_PATH, "utf8");
  const eci = loadEci();
  const variants = findVariants(seed);

  interface Edit {
    sku: string;
    beforePt: string;
    afterPt: string;
    afterEn: string;
    hex: string[];
    matchStart: number;
    matchEnd: number;
    original: string;
    replaced: string;
  }
  const edits: Edit[] = [];
  const skipped: { sku: string; reason: string; desc?: string }[] = [];
  const dup = inDupGroup(variants);
  console.log(`Variants in a duplicate group: ${dup.size}`);

  // Pre-compute which dup groups the ECI can actually differentiate:
  // for each group, all sibling ECI colour-tail specs must be UNIQUE.
  // Groups that would end up with identical replacement names (e.g.
  // four Estojos that all resolve to "Preto") get skipped as a whole.
  const groupOf = new Map<string, string>();
  const groupSkus = new Map<string, string[]>();
  for (const v of variants) {
    const k = `${v.productSlug}|${v.namePt.toLowerCase()}|${v.priceCents}|${(v.colourPt ?? "").toLowerCase()}`;
    groupOf.set(v.sku, k);
    if (!groupSkus.has(k)) groupSkus.set(k, []);
    groupSkus.get(k)!.push(v.sku);
  }
  const differentiableGroups = new Set<string>();
  for (const [k, skus] of groupSkus) {
    if (skus.length < 2) continue;
    const specs = skus.map((sk) => {
      const desc = eci.get(sk.toLowerCase());
      if (!desc) return null;
      const spec = parseColourTail(desc);
      return spec ? spec.pt : null;
    });
    if (specs.some((s) => !s)) continue;
    const set = new Set(specs);
    if (set.size === skus.length) differentiableGroups.add(k);
  }
  console.log(`Groups the ECI can differentiate: ${differentiableGroups.size}`);

  for (const v of variants) {
    if (!dup.has(v.sku)) { skipped.push({ sku: v.sku, reason: "not a duplicate" }); continue; }
    const gk = groupOf.get(v.sku)!;
    if (!differentiableGroups.has(gk)) { skipped.push({ sku: v.sku, reason: "group can't be split via ECI" }); continue; }
    const desc = eci.get(v.sku.toLowerCase());
    if (!desc) { skipped.push({ sku: v.sku, reason: "no ECI desc" }); continue; }
    const spec = parseColourTail(desc);
    if (!spec) { skipped.push({ sku: v.sku, reason: "tail not in glossary", desc }); continue; }

    const prefixPt = prefixOf(v.namePt);
    const prefixEn = prefixOf(v.nameEn);
    const newPt = `${prefixPt} — ${spec.pt}`;
    const newEn = `${prefixEn} — ${spec.en}`;

    if (newPt === v.namePt && newEn === v.nameEn) { continue; }

    // Build the replacement — swap only the name + colour label + hex,
    // never touch anything else in the variant literal.
    let replaced = v.original.replace(`pt: \`${v.namePt}\``, `pt: \`${newPt}\``);
    replaced = replaced.replace(`en: \`${v.nameEn}\``, `en: \`${newEn}\``);
    // Update colour.label if present in the literal.
    replaced = replaced.replace(
      /(color:\s*\{\s*label:\s*\{\s*)pt:\s*`([^`]+)`,\s*en:\s*`([^`]+)`(\s*\})/,
      (_, a, _pt, _en, c) => `${a}pt: \`${spec.pt}\`, en: \`${spec.en}\`${c}`,
    );
    // Update hex list.
    const hexLiteral = spec.hex.map((h) => `"${h}"`).join(", ");
    replaced = replaced.replace(/(hex:\s*)\[[^\]]*\]/, `$1[${hexLiteral}]`);

    if (replaced === v.original) { continue; }

    edits.push({
      sku: v.sku, beforePt: v.namePt, afterPt: newPt, afterEn: newEn, hex: spec.hex,
      matchStart: v.matchStart, matchEnd: v.matchEnd, original: v.original, replaced,
    });
  }

  console.log(`Variants scanned:    ${variants.length}`);
  console.log(`Edits queued:        ${edits.length}`);
  console.log(`Skipped (safety):    ${skipped.length}`);
  console.log("");
  console.log("Sample of proposed edits:");
  for (const e of edits.slice(0, 25)) {
    console.log(`  ${e.sku.padEnd(12)} "${e.beforePt}"  →  "${e.afterPt}"`);
  }
  const skipReasons = new Map<string, number>();
  for (const s of skipped) skipReasons.set(s.reason, (skipReasons.get(s.reason) ?? 0) + 1);
  console.log("");
  console.log("Skip reasons:");
  for (const [r, n] of skipReasons) console.log(`  ${n.toString().padStart(4)} × ${r}`);

  if (!APPLY) {
    console.log("\nDry-run only — pass --apply to write seed-data.ts");
    return;
  }

  edits.sort((a, b) => b.matchStart - a.matchStart);
  let next = seed;
  for (const e of edits) {
    next = next.slice(0, e.matchStart) + e.replaced + next.slice(e.matchEnd);
  }
  fs.writeFileSync(SEED_PATH, next, "utf8");
  console.log(`\nWrote ${edits.length} name+colour rewrites to ${SEED_PATH}`);
})();
