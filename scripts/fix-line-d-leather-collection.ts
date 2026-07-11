// One-shot: reclassify every Line D leather / accessory split-child
// under the new "Line D" collection so it surfaces cleanly in
// /c/pele?col=Line D and /c/acessorios?col=Line D (per user request).
// Updates the product-level `collection` + `name` on Neon; variant
// names get the same rewrite so the catalogue card and the PDP h1
// both read "Line D · <Item>" instead of the mixed "Line D Eternity ·
// <Item>" the scrape produced.
//
// Category stays where CATEGORY_OVERRIDES in lib/catalog.ts route it
// (belts + line-d-3 items → pele; desk goods → acessorios) — this
// script only touches naming + collection.
//
// Dry-run by default; pass --apply to write.
//
//   $env:DATABASE_URL = "<neon>"
//   npx.cmd tsx scripts/fix-line-d-leather-collection.ts            # preview
//   npx.cmd tsx scripts/fix-line-d-leather-collection.ts --apply    # commit
//   Remove-Item Env:DATABASE_URL

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const APPLY = process.argv.includes("--apply");

interface Target {
  slug: string;
  productName: { pt: string; en: string };
  variantName: { pt: string; en: string };
}

const TARGETS: Target[] = [
  { slug: "line-d-2-pen-case",       productName: { pt: "Line D · Pen Case",       en: "Line D · Pen Case" },       variantName: { pt: "Line D · Pen Case",       en: "Line D · Pen Case" } },
  { slug: "line-d-2-reversible-belt",productName: { pt: "Line D · Reversible Belt",en: "Line D · Reversible Belt" },variantName: { pt: "Line D · Reversible Belt",en: "Line D · Reversible Belt" } },
  { slug: "line-d-2-pencil",         productName: { pt: "Line D · Copo de Secretária", en: "Line D · Desk Cup" }, variantName: { pt: "Line D · Copo de Secretária", en: "Line D · Desk Cup" } },
  { slug: "line-d-2-notebook-cover", productName: { pt: "Line D · Notebook Cover", en: "Line D · Notebook Cover" }, variantName: { pt: "Line D · Notebook Cover", en: "Line D · Notebook Cover" } },
  { slug: "line-d-2-belt",           productName: { pt: "Line D · Belt",           en: "Line D · Belt" },           variantName: { pt: "Line D · Belt",           en: "Line D · Belt" } },
  { slug: "line-d-2-desk-pad",       productName: { pt: "Line D · Desk Pad",       en: "Line D · Desk Pad" },       variantName: { pt: "Line D · Desk Pad",       en: "Line D · Desk Pad" } },
  { slug: "line-d-3-card-holder",    productName: { pt: "Line D · Card Holder",    en: "Line D · Card Holder" },    variantName: { pt: "Line D · Card Holder",    en: "Line D · Card Holder" } },
  { slug: "line-d-3-passport-holder",productName: { pt: "Line D · Passport Holder",en: "Line D · Passport Holder" },variantName: { pt: "Line D · Passport Holder",en: "Line D · Passport Holder" } },
  { slug: "line-d-3-wallet",         productName: { pt: "Line D · Wallet",         en: "Line D · Wallet" },         variantName: { pt: "Line D · Wallet",         en: "Line D · Wallet" } },
  { slug: "line-d-3-document-holder",productName: { pt: "Line D · Document Holder",en: "Line D · Document Holder" },variantName: { pt: "Line D · Document Holder",en: "Line D · Document Holder" } },
  { slug: "line-d-3-towel",          productName: { pt: "Line D · Towel",          en: "Line D · Towel" },          variantName: { pt: "Line D · Towel",          en: "Line D · Towel" } },
];

const NEW_COLLECTION = "Line D";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  let missing = 0, ok = 0;
  for (const t of TARGETS) {
    const p = await prisma.product.findUnique({
      where: { slug: t.slug },
      select: { id: true, collection: true, name: true, variants: { select: { id: true, sku: true, name: true } } },
    });
    if (!p) {
      console.warn(`  · MISSING ${t.slug}`);
      missing++;
      continue;
    }
    console.log(`  ${t.slug}`);
    console.log(`    collection: ${p.collection}  →  ${NEW_COLLECTION}`);
    console.log(`    product name: ${JSON.stringify(p.name)}  →  ${JSON.stringify(t.productName)}`);
    for (const v of p.variants) {
      // Rewrite the LEFT side of the " — colour" suffix if present,
      // preserving the colour tail so "Line D Eternity · Belt — Preto"
      // becomes "Line D · Belt — Preto" (not just "Line D · Belt").
      const cur = v.name as { pt?: string; en?: string } | null;
      const suffixPt = (cur?.pt ?? "").split(" — ")[1];
      const suffixEn = (cur?.en ?? "").split(" — ")[1];
      const nextPt = suffixPt ? `${t.variantName.pt} — ${suffixPt}` : t.variantName.pt;
      const nextEn = suffixEn ? `${t.variantName.en} — ${suffixEn}` : t.variantName.en;
      console.log(`    variant ${v.sku}: "${cur?.pt}" → "${nextPt}"`);
      if (APPLY) {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { name: { pt: nextPt, en: nextEn } },
        });
      }
    }
    if (APPLY) {
      await prisma.product.update({
        where: { id: p.id },
        data: { collection: NEW_COLLECTION, name: t.productName },
      });
    }
    ok++;
  }
  console.log(`\n${ok} products updated, ${missing} missing on Neon`);
  if (!APPLY) console.log("Dry-run only — pass --apply to commit.");
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
