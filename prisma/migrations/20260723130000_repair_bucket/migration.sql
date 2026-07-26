-- Repair.bucket — which of the three ECI Excel sheets the row came from.
-- The three share the same column layout but mean different things
-- (repair-in-progress, general aftersales, archived). Existing rows are
-- backfilled as REPARACAO (the original import target).

CREATE TYPE "RepairBucket" AS ENUM (
  'REPARACAO',
  'ASSUNTO_VARIOS',
  'ASSUNTO_TERMINADO'
);

ALTER TABLE "Repair"
  ADD COLUMN "bucket" "RepairBucket" NOT NULL DEFAULT 'REPARACAO';

CREATE INDEX "Repair_bucket_idx" ON "Repair"("bucket");
