-- Anulação de vendas mal registadas. Soft-delete: a linha fica, com a data e
-- o motivo, para se poder auditar o que aconteceu e quem o desfez. Toda a
-- contabilidade passa a filtrar por "voidedAt IS NULL".

ALTER TABLE "Sale" ADD COLUMN "voidedAt" TIMESTAMP(3);
ALTER TABLE "Sale" ADD COLUMN "voidedReason" TEXT;

-- Índice parcial não dá jeito aqui porque a maioria das queries pede
-- voidedAt IS NULL sobre um intervalo de datas; o índice simples serve para
-- a listagem de anuladas e não estorva as restantes.
CREATE INDEX "Sale_voidedAt_idx" ON "Sale"("voidedAt");
