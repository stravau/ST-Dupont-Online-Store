-- AlterTable: ERP-import fields driven by the daily Starbrands Excel
ALTER TABLE "ProductVariant" ADD COLUMN "ean" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "pvpStartDate" TIMESTAMP(3);
ALTER TABLE "ProductVariant" ADD COLUMN "promoPriceCents" INTEGER;
ALTER TABLE "ProductVariant" ADD COLUMN "promoStartDate" TIMESTAMP(3);
ALTER TABLE "ProductVariant" ADD COLUMN "promoEndDate" TIMESTAMP(3);

-- Unique index on EAN (only when present — null values don't conflict)
CREATE UNIQUE INDEX "ProductVariant_ean_key" ON "ProductVariant"("ean");

-- Lookup indexes
CREATE INDEX "ProductVariant_ean_idx" ON "ProductVariant"("ean");
CREATE INDEX "ProductVariant_promoEndDate_idx" ON "ProductVariant"("promoEndDate");
