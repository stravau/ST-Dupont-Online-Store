-- Os oito estados da folha de Excel passam a quatro, os que a boutique usa
-- mesmo: em verificação em loja · aguardando S.T. Dupont · aguardando recolha
-- em loja · resolvido.
--
-- MAPEAMENTO (contagens no momento da migração):
--   RESOLVIDO          58 -> RESOLVIDO
--   POR_VERIFICAR       7 -> EM_VERIFICACAO_LOJA
--   AGUARDANDO_STD      4 -> AGUARDANDO_STD
--   AGUARDANDO_CLIENTE  3 -> AGUARDANDO_RECOLHA   (o cliente vem levantar)
--   ART_EM_REPARACAO    1 -> AGUARDANDO_STD       (o artigo está fora, na marca)
--   AGUARDANDO_JM       0 -> EM_VERIFICACAO_LOJA
--   AGUARDANDO_PR       0 -> EM_VERIFICACAO_LOJA
--   POR_DAR_RESPOSTA    0 -> EM_VERIFICACAO_LOJA
--
-- Os três que ficam a zero desaparecem sem tocar em dados nenhuns. O ELSE
-- cobre-os na mesma, para a migração não depender de a contagem estar certa.
CREATE TYPE "RepairStatus_new" AS ENUM (
  'EM_VERIFICACAO_LOJA',
  'AGUARDANDO_STD',
  'AGUARDANDO_RECOLHA',
  'RESOLVIDO'
);

ALTER TABLE "Repair" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Repair" ALTER COLUMN "status" TYPE "RepairStatus_new" USING (
  CASE "status"::text
    WHEN 'RESOLVIDO'          THEN 'RESOLVIDO'
    WHEN 'AGUARDANDO_STD'     THEN 'AGUARDANDO_STD'
    WHEN 'ART_EM_REPARACAO'   THEN 'AGUARDANDO_STD'
    WHEN 'AGUARDANDO_CLIENTE' THEN 'AGUARDANDO_RECOLHA'
    ELSE 'EM_VERIFICACAO_LOJA'
  END
)::"RepairStatus_new";

DROP TYPE "RepairStatus";
ALTER TYPE "RepairStatus_new" RENAME TO "RepairStatus";

ALTER TABLE "Repair" ALTER COLUMN "status" SET DEFAULT 'EM_VERIFICACAO_LOJA';
