-- Sell other brands at the POS (V.N. Gaia only). A sale line can now be a
-- Dupont catalogue variant (source = DUPONT) or an OtherBrandItem
-- (source = OTHER_BRAND). Existing rows are all Dupont, hence the default.

-- Source enum
CREATE TYPE "SaleItemSource" AS ENUM ('DUPONT', 'OTHER_BRAND');

-- New columns on SaleItem
ALTER TABLE "SaleItem"
  ADD COLUMN "source" "SaleItemSource" NOT NULL DEFAULT 'DUPONT',
  ADD COLUMN "otherBrandItemId" TEXT;

-- FK to OtherBrandItem (nullable; keep the line's snapshot if the master row
-- is later removed)
ALTER TABLE "SaleItem"
  ADD CONSTRAINT "SaleItem_otherBrandItemId_fkey"
  FOREIGN KEY ("otherBrandItemId") REFERENCES "OtherBrandItem"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes for the new access paths / report filters
CREATE INDEX "SaleItem_otherBrandItemId_idx" ON "SaleItem"("otherBrandItemId");
CREATE INDEX "SaleItem_source_idx" ON "SaleItem"("source");
