// Connects to Neon (same DATABASE_URL as `npm run db:seed`), reads every
// product + variant, flattens to one row per variant, and writes
// `db-export.xlsx` to the project root.
//
// Run:
//   $env:DATABASE_URL = 'postgresql://...neon...'
//   npx tsx scripts/export-products.ts

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Localized = { pt?: string; en?: string };
type VariantAttrs = {
  color?: { label?: Localized; hex?: string[] };
  finish?: Localized;
  size?: Localized;
  type?: Localized;
};

function loc(obj: unknown, key: "pt" | "en"): string {
  if (!obj || typeof obj !== "object") return "";
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}

function eur(cents: number): string {
  return (cents / 100).toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

async function main() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
      variants: { orderBy: { priceCents: "asc" } },
    },
    orderBy: [{ category: { slug: "asc" } }, { collection: "asc" }, { slug: "asc" }],
  });

  console.log(`Loaded ${products.length} products from Neon.`);

  const rows: Record<string, string | number>[] = [];
  for (const p of products) {
    const catSlug = p.category.slug;
    const catName = loc(p.category.name, "pt");
    for (const v of p.variants) {
      const attrs = (v.attributes ?? {}) as VariantAttrs;
      const images = (v.images ?? []) as string[];
      rows.push({
        "Category Slug": catSlug,
        "Category Name (PT)": catName,
        Collection: p.collection,
        "Product Slug": p.slug,
        "Product Name (PT)": loc(p.name, "pt"),
        "Product Name (EN)": loc(p.name, "en"),
        "Product Description (PT)": loc(p.description, "pt"),
        "Product Description (EN)": loc(p.description, "en"),
        "Product History (PT)": loc(p.history, "pt"),
        "Product History (EN)": loc(p.history, "en"),
        "Product Hero Image": p.image ?? "",
        Featured: p.featured ? "Yes" : "",
        "Variant SKU": v.sku,
        "Variant Name (PT)": loc(v.name, "pt"),
        "Variant Name (EN)": loc(v.name, "en"),
        "Price (cents)": v.priceCents,
        "Price (EUR)": eur(v.priceCents),
        Currency: v.currency,
        Stock: v.stock,
        "Colour (PT)": loc(attrs.color?.label, "pt"),
        "Colour (EN)": loc(attrs.color?.label, "en"),
        "Colour Hex 1": attrs.color?.hex?.[0] ?? "",
        "Colour Hex 2": attrs.color?.hex?.[1] ?? "",
        "Finish (PT)": loc(attrs.finish, "pt"),
        "Finish (EN)": loc(attrs.finish, "en"),
        "Size (PT)": loc(attrs.size, "pt"),
        "Size (EN)": loc(attrs.size, "en"),
        "Pen Type (PT)": loc(attrs.type, "pt"),
        "Pen Type (EN)": loc(attrs.type, "en"),
        "Image 1": images[0] ?? "",
        "Image 2": images[1] ?? "",
        "Image 3": images[2] ?? "",
        "Image 4": images[3] ?? "",
        "Image Count": images.length,
        "Product Page URL": `https://st-dupont-online-store.vercel.app/pt/p/${p.slug}?v=${encodeURIComponent(v.sku)}`,
      });
    }
  }
  console.log(`Flattened ${rows.length} variant rows.`);

  // Build the workbook — one sheet per category + an "All" sheet.
  const wb = XLSX.utils.book_new();

  const allSheet = XLSX.utils.json_to_sheet(rows);
  applyWidths(allSheet, rows);
  XLSX.utils.book_append_sheet(wb, allSheet, "All Products");

  const byCat = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = String(r["Category Slug"]);
    if (!byCat.has(k)) byCat.set(k, []);
    byCat.get(k)!.push(r);
  }
  const sheetNames: Record<string, string> = {
    isqueiros: "Lighters",
    escrita: "Writing",
    pele: "Leather",
    acessorios: "Accessories",
  };
  for (const [slug, group] of byCat) {
    const sheet = XLSX.utils.json_to_sheet(group);
    applyWidths(sheet, group);
    XLSX.utils.book_append_sheet(wb, sheet, sheetNames[slug] ?? slug);
  }

  const out = path.join(process.cwd(), "db-export.xlsx");
  XLSX.writeFile(wb, out);
  console.log(`Wrote ${out} (${rows.length} rows, ${byCat.size + 1} sheets).`);
}

function applyWidths(sheet: XLSX.WorkSheet, rows: Record<string, string | number>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  // Column widths: a sensible cap so descriptions don't make Excel explode.
  const widths = headers.map((h) => {
    if (/Description|History/i.test(h)) return { wch: 70 };
    if (/Name|Image|URL/i.test(h)) return { wch: 32 };
    if (/Slug|Collection|Colour|Finish|Size|Type/i.test(h)) return { wch: 22 };
    return { wch: 16 };
  });
  sheet["!cols"] = widths;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
