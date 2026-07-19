-- Replace the RepairStatus enum with the exact "Estado" dropdown from the Excel
-- Reparações sheet. Existing rows are remapped (best-effort) so the type change
-- succeeds; a follow-up re-import (import-eci-repairs.ts --reset) restores each
-- ticket's precise Excel status.

-- 1. Park the old type.
ALTER TYPE "RepairStatus" RENAME TO "RepairStatus_old";

-- 2. Create the new type with the canonical dropdown values.
CREATE TYPE "RepairStatus" AS ENUM (
  'AGUARDANDO_CLIENTE',
  'AGUARDANDO_STD',
  'AGUARDANDO_JM',
  'AGUARDANDO_PR',
  'ART_EM_REPARACAO',
  'RESOLVIDO',
  'POR_DAR_RESPOSTA',
  'POR_VERIFICAR'
);

-- 3. Drop the column default before retyping.
ALTER TABLE "Repair" ALTER COLUMN "status" DROP DEFAULT;

-- 4. Convert the column, mapping the old values onto the new set.
ALTER TABLE "Repair" ALTER COLUMN "status" TYPE "RepairStatus" USING (
  CASE "status"::text
    WHEN 'RESOLVIDO'          THEN 'RESOLVIDO'
    WHEN 'A_AGUARDAR_CLIENTE' THEN 'AGUARDANDO_CLIENTE'
    WHEN 'EM_ESPANHA'         THEN 'AGUARDANDO_STD'
    WHEN 'EM_ANALISE'         THEN 'ART_EM_REPARACAO'
    WHEN 'ORCAMENTO_ENVIADO'  THEN 'AGUARDANDO_CLIENTE'
    WHEN 'ABERTO'             THEN 'POR_VERIFICAR'
    ELSE 'POR_VERIFICAR'
  END::"RepairStatus"
);

-- 5. Restore a default matching the schema.
ALTER TABLE "Repair" ALTER COLUMN "status" SET DEFAULT 'POR_VERIFICAR';

-- 6. Remove the old type.
DROP TYPE "RepairStatus_old";
