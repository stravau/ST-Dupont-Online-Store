-- Repairs: Tipo (Isqueiro/Escrita/Pele) + modelo da peça + custo estimado.
-- The old free-text "reference" is kept for history; the UI now uses
-- repairType + modelName. Backfill modelName from reference so no existing
-- piece name is lost. repairType stays NULL for historical rows (set in the
-- admin when known — avoids guessing the ambiguous ones).

CREATE TYPE "RepairType" AS ENUM ('ISQUEIRO', 'ESCRITA', 'PELE');

ALTER TABLE "Repair"
  ADD COLUMN "repairType" "RepairType",
  ADD COLUMN "modelName" TEXT,
  ADD COLUMN "estimatedCostCents" INTEGER;

-- Preserve the existing piece name.
UPDATE "Repair" SET "modelName" = "reference" WHERE "modelName" IS NULL AND "reference" <> '';
