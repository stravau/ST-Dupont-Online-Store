-- OtherBrandItem — flat stock master for the non-Dupont brands sold only
-- at V. N. de Gaia (Lamy, Kaweco, Filofax, Parker, Pelikan, Caran d'Ache,
-- etc.). These items live only in-store; no Product/Variant link.

CREATE TABLE "OtherBrandItem" (
  "id"        TEXT NOT NULL,
  "brand"     TEXT NOT NULL,
  "sku"       TEXT NOT NULL,
  "ean"       TEXT,
  "descricao" TEXT NOT NULL,
  "pvpCents"  INTEGER,
  "stock"     INTEGER NOT NULL DEFAULT 0,
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OtherBrandItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OtherBrandItem_sku_key" ON "OtherBrandItem"("sku");
CREATE UNIQUE INDEX "OtherBrandItem_ean_key" ON "OtherBrandItem"("ean");
CREATE INDEX "OtherBrandItem_brand_idx"  ON "OtherBrandItem"("brand");
CREATE INDEX "OtherBrandItem_active_idx" ON "OtherBrandItem"("active");
