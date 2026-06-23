// Generates four .xlsx files in this directory — one per admin upload
// route. Real SKUs come from the seed (gas-refill-2 / box-12-refills /
// box-10-refills variants) so the resolver in lib/admin-upload.ts
// actually matches them; fake / invalid rows test the validation
// + accounting paths (unmatched / skipped / unchanged).
//
// Run with: node test-uploads/generate.js

const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

// Writes BOTH .xlsx and .csv for each sheet.
// .xlsx is what the production upload routes expect (`xlsx.read` handles
// both transparently anyway), .csv exists so you can open / eyeball the
// data in any editor without Office.
function write(filename, rows) {
  const ws = xlsx.utils.json_to_sheet(rows);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

  const xlsxOut = path.join(__dirname, filename);
  xlsx.writeFile(wb, xlsxOut, { bookType: "xlsx", compression: true });

  const csvOut  = path.join(__dirname, filename.replace(/\.xlsx$/, ".csv"));
  // UTF-8 BOM so Excel picks PT chars (Português, etc.) up correctly
  // when the admin double-clicks the .csv preview.
  fs.writeFileSync(csvOut, "﻿" + xlsx.utils.sheet_to_csv(ws));

  console.log(`✓ ${filename} + ${path.basename(csvOut)} (${rows.length} rows)`);
}

// ---- PVP --------------------------------------------------------
write("pvp.xlsx", [
  // Real SKU, new price → should update.
  { REF: "900430", PVP: 18.50, DATA_INICIO: "2026-06-24" },
  // Real SKU, big jump → should update.
  { REF: "000432", PVP: 32.00 },
  // Real SKU, identical to typical current → counted as `unchanged`
  // (well, you'll see). Either way exercises the no-op branch.
  { REF: "900436", PVP: 15.00 },
  // Bogus REF → counted as `unmatched`.
  { REF: "DOES-NOT-EXIST", PVP: 99.00 },
  // Negative price → counted as `skipped`.
  { REF: "900434", PVP: -5.00 },
]);

// ---- STOCK ------------------------------------------------------
write("stock.xlsx", [
  // Real SKU, set to 25.
  { REF: "900430", STOCK: 25 },
  // Real SKU, force out-of-stock (tests the red stock tone in admin).
  { REF: "900434", STOCK: 0 },
  // Real SKU, low stock (tests the amber tone).
  { REF: "000436", STOCK: 3 },
  // Bogus REF → `unmatched`.
  { REF: "BAD-SKU-123", STOCK: 10 },
  // Negative → `skipped`.
  { REF: "900433", STOCK: -1 },
]);

// ---- PROMO ------------------------------------------------------
// Two weeks from today as the end date.
const promoEnd = new Date();
promoEnd.setDate(promoEnd.getDate() + 14);
const promoEndStr = promoEnd.toISOString().slice(0, 10);

write("promo.xlsx", [
  // Real SKU, set a 19.99 promo expiring in 2 weeks.
  { REF: "900430", PVP_PROMO: 19.99, DATA_INICIO: "2026-06-24", DATA_FIM: promoEndStr },
  // Real SKU, clear the promo (empty cells → null promo).
  { REF: "900434", PVP_PROMO: null, DATA_INICIO: null, DATA_FIM: null },
  // PROMO set but DATA_FIM missing → should be REJECTED by the new
  // guard (was previously creating evergreen promos).
  { REF: "000432", PVP_PROMO: 25.00, DATA_INICIO: "2026-06-24" /* no DATA_FIM */ },
  // Bogus REF → `unmatched`.
  { REF: "NOPE-999", PVP_PROMO: 10.00, DATA_FIM: promoEndStr },
  // Negative promo → `skipped`.
  { REF: "900436", PVP_PROMO: -3.00, DATA_FIM: promoEndStr },
]);

// ---- NEW ARTICLES ----------------------------------------------
write("new-articles.xlsx", [
  // Brand-new article — valid 13-digit EAN, real category slug.
  {
    EAN: "5601234567890",
    REF: "TEST-NEW-001",
    DESCRICAO: "Teste · Isqueiro Novo",
    PVP: 145.00,
    STOCK: 5,
    CATEGORIA: "isqueiros",
    COLECAO: "Test Collection",
    IMAGEM_URL: "/products/popote/000430.webp",
  },
  // Valid 8-digit EAN, fallback category (no CATEGORIA → acessorios).
  {
    EAN: "12345678",
    REF: "TEST-NEW-002",
    DESCRICAO: "Teste · Acessório Sem Categoria",
    PVP: 25.00,
    STOCK: 0,
  },
  // Invalid EAN (5 digits) → should be SKIPPED by the new validator.
  {
    EAN: "12345",
    REF: "TEST-NEW-003",
    DESCRICAO: "Teste · EAN Inválido",
    PVP: 50.00,
    STOCK: 10,
  },
  // Missing required PVP → `skipped`.
  {
    REF: "TEST-NEW-004",
    DESCRICAO: "Teste · Sem Preço",
    STOCK: 3,
  },
  // Missing both REF and DESCRICAO → `skipped`.
  {
    EAN: "9999999999999",
    PVP: 10.00,
  },
  // Existing SKU (real one) → should hit the UPDATE branch, NOT create.
  {
    REF: "900430",
    DESCRICAO: "Teste · Update de SKU existente",
    PVP: 20.00,
    STOCK: 50,
  },
]);

console.log("\nDone. Upload these via /admin/uploads.");
