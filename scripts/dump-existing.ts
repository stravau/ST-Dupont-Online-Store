import { products } from "../prisma/seed-data";
import fs from "fs";

const skus = new Set<string>();
const slugs = new Set<string>();
let v = 0;
for (const p of products) {
  slugs.add(p.slug);
  for (const x of p.variants) {
    skus.add(x.sku.toUpperCase());
    v++;
  }
}

const out = "C:/tmp/existing.json";
fs.writeFileSync(
  out,
  JSON.stringify(
    { skus: [...skus], slugs: [...slugs], productCount: products.length, variantCount: v },
    null,
    2,
  ),
);
console.log(`wrote ${out}: ${products.length} products, ${v} variants, ${skus.size} unique SKUs`);
