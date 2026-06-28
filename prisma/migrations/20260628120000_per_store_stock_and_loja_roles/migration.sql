-- Per-store stock columns on ProductVariant (application keeps
-- `stock` == stockLis + stockVng on every write).
ALTER TABLE "ProductVariant" ADD COLUMN "stockLis" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductVariant" ADD COLUMN "stockVng" INTEGER NOT NULL DEFAULT 0;

-- Two extra UserRole values for boutique-scoped accounts. LOJA_LIS
-- only edits stockLis in /admin/variants, LOJA_VNG only stockVng.
-- ADMIN edits everything.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'LOJA_LIS';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'LOJA_VNG';
