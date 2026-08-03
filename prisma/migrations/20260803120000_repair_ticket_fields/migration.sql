-- Ficha de assistência: os campos do papel que o cliente leva ao deixar a peça.

ALTER TABLE "Repair" ADD COLUMN "ticketNumber" INTEGER;
ALTER TABLE "Repair" ADD COLUMN "serialNumber" TEXT;
ALTER TABLE "Repair" ADD COLUMN "usageMarks" TEXT;
ALTER TABLE "Repair" ADD COLUMN "underWarranty" BOOLEAN;

-- Backfill da numeração dos processos que já existem. Por loja, na ordem em
-- que entraram (1ª visita crescente). Sem data vai para o fim; desempate por
-- createdAt e depois id, para o resultado ser determinístico em vez de
-- depender da ordem física das linhas.
WITH ordered AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY boutique
           ORDER BY "firstVisitAt" ASC NULLS LAST, "createdAt" ASC, id ASC
         ) AS n
  FROM "Repair"
)
UPDATE "Repair" r
   SET "ticketNumber" = o.n
  FROM ordered o
 WHERE r.id = o.id;

-- Único por loja. Em Postgres os NULL não colidem entre si, portanto linhas
-- futuras sem número (não deveria haver) não quebram o índice.
CREATE UNIQUE INDEX "Repair_boutique_ticketNumber_key" ON "Repair"("boutique", "ticketNumber");
