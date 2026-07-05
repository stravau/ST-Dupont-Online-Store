// Push variant NAME + COLOUR (label + hex) edits from seed-data.ts
// straight into Neon, without touching stock, EAN, PVP or any of the
// today's boutique-facing data. Use after hand-fixing a variant name
// in seed-data.ts (e.g. Slim 7 · Géode Verde/Dourado 027036) so the
// change lands on the live site without a destructive re-seed.
//
// Dry-run by default; pass --apply to write.
//
//   $env:DATABASE_URL = "<neon>"
//   npx tsx scripts/sync-variant-names.ts            # preview
//   npx tsx scripts/sync-variant-names.ts --apply    # commit
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import * as fs from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const SEED_PATH = "prisma/seed-data.ts";
const APPLY = process.argv.includes("--apply");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

interface SeedVariant {
  sku: string;
  pt: string;
  en: string;
  colourPt: string | null;
  colourEn: string | null;
  hex: string[];
}

// Very targeted regex against seed-data.ts. Captures the variant
// literal blocks — matches the shape produced by the seed generator
// scripts. Comments in the file don't matter because they never sit
// inside a variant literal.
function parseSeed(text: string): SeedVariant[] {
  const re = /\{\s*sku:\s*`([^`]+)`,\s*name:\s*\{\s*pt:\s*`([^`]+)`,\s*en:\s*`([^`]+)`\s*\},[\s\S]*?attributes:\s*\{[\s\S]*?color:\s*\{\s*label:\s*\{\s*pt:\s*`([^`]+)`,\s*en:\s*`([^`]+)`\s*\},\s*hex:\s*\[([^\]]*)\][\s\S]*?\}[\s\S]*?\}/g;
  const noColourRe = /\{\s*sku:\s*`([^`]+)`,\s*name:\s*\{\s*pt:\s*`([^`]+)`,\s*en:\s*`([^`]+)`\s*\}/g;
  const out: SeedVariant[] = [];
  const withColour = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const [, sku, pt, en, cPt, cEn, hexList] = m;
    const hex = [...hexList.matchAll(/"([^"]+)"/g)].map((h) => h[1]);
    out.push({ sku, pt, en, colourPt: cPt, colourEn: cEn, hex });
    withColour.add(sku);
  }
  // Variants without a colour attribute (rare — writing instruments,
  // some accessories) still contribute name-only updates.
  while ((m = noColourRe.exec(text))) {
    const [, sku, pt, en] = m;
    if (withColour.has(sku)) continue;
    out.push({ sku, pt, en, colourPt: null, colourEn: null, hex: [] });
  }
  return out;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface DbAttrsColor {
  label?: { pt?: string; en?: string };
  hex?: string[];
}
interface DbAttrs {
  color?: DbAttrsColor;
  [k: string]: unknown;
}

(async () => {
  console.log(`Reading ${SEED_PATH} ${APPLY ? "(APPLY)" : "(dry-run)"}`);
  const seedText = fs.readFileSync(SEED_PATH, "utf8");
  const seed = parseSeed(seedText);
  console.log(`  ${seed.length.toLocaleString("pt-PT")} variant literals in seed`);

  let updated = 0, noop = 0, missing = 0;
  const samples: string[] = [];

  for (const s of seed) {
    const db = await prisma.productVariant.findUnique({
      where: { sku: s.sku },
      select: { id: true, name: true, attributes: true },
    });
    if (!db) { missing++; continue; }

    const dbName = db.name as { pt?: string; en?: string } | null;
    const dbAttrs = (db.attributes ?? {}) as DbAttrs;
    const dbColour = dbAttrs.color;

    const nameChanged = dbName?.pt !== s.pt || dbName?.en !== s.en;
    let colourChanged = false;
    if (s.colourPt !== null) {
      const cPt = dbColour?.label?.pt ?? null;
      const cEn = dbColour?.label?.en ?? null;
      const cHex = dbColour?.hex ?? [];
      if (cPt !== s.colourPt || cEn !== s.colourEn) colourChanged = true;
      if (cHex.length !== s.hex.length || cHex.some((h, i) => h !== s.hex[i])) colourChanged = true;
    }

    if (!nameChanged && !colourChanged) { noop++; continue; }

    if (samples.length < 15) {
      const oldPt = dbName?.pt ?? "?";
      samples.push(`  ${s.sku.padEnd(12)} "${oldPt}"  →  "${s.pt}"`);
    }
    updated++;

    if (APPLY) {
      const nextAttrs: DbAttrs = { ...dbAttrs };
      if (s.colourPt !== null) {
        nextAttrs.color = {
          ...(nextAttrs.color ?? {}),
          label: { pt: s.colourPt, en: s.colourEn ?? "" },
          hex: s.hex,
        };
      }
      await prisma.productVariant.update({
        where: { id: db.id },
        data: {
          name: { pt: s.pt, en: s.en },
          attributes: nextAttrs as object,
        },
      });
    }
  }

  console.log("");
  console.log(`Variants updated: ${updated.toLocaleString("pt-PT")}`);
  console.log(`No-op (in sync):  ${noop.toLocaleString("pt-PT")}`);
  console.log(`Missing in DB:    ${missing.toLocaleString("pt-PT")}`);
  if (samples.length) {
    console.log("");
    console.log("Sample of renames:");
    for (const s of samples) console.log(s);
  }
  if (!APPLY) console.log("\nDry-run only — pass --apply to commit.");

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
