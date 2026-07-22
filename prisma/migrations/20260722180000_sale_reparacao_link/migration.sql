-- Reparação charging at the POS terminal — three schema pieces:
--   1. SaleType gains REPARACAO (service line, no stock effect)
--   2. SaleItemSource gains REPARACAO (row within a REPARACAO sale)
--   3. Sale gains repairId FK → Repair, so paying for a repair atomically
--      closes the Repair record (transitions status → RESOLVIDO)

ALTER TYPE "SaleType"       ADD VALUE 'REPARACAO';
ALTER TYPE "SaleItemSource" ADD VALUE 'REPARACAO';

ALTER TABLE "Sale" ADD COLUMN "repairId" TEXT;

ALTER TABLE "Sale"
  ADD CONSTRAINT "Sale_repairId_fkey"
  FOREIGN KEY ("repairId") REFERENCES "Repair"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Sale_repairId_idx"        ON "Sale"("repairId");
CREATE INDEX "Repair_customerName_idx"  ON "Repair"("customerName");
