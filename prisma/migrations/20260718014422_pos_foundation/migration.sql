-- CreateEnum
CREATE TYPE "Boutique" AS ENUM ('LIS', 'VNG');

-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('VENDA', 'DEVOLUCAO');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('STOCK_INICIAL', 'ENTRADA', 'SAIDA', 'TRANSFER_IN', 'TRANSFER_OUT', 'VENDA', 'DEVOLUCAO', 'RESERVA', 'DANIFICADO', 'AJUSTE');

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "name" TEXT,
    "eciCode" TEXT,
    "boutique" "Boutique" NOT NULL,
    "monthlyGoalCents" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "boutique" "Boutique" NOT NULL,
    "operatorId" TEXT NOT NULL,
    "type" "SaleType" NOT NULL DEFAULT 'VENDA',
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grossCents" INTEGER NOT NULL DEFAULT 0,
    "netCents" INTEGER NOT NULL DEFAULT 0,
    "eciCommissionCents" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "originalSaleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "variantId" TEXT,
    "sku" TEXT NOT NULL,
    "ean" TEXT,
    "descSnapshot" TEXT NOT NULL,
    "brand" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "discountPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossCents" INTEGER NOT NULL,
    "netCents" INTEGER NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "boutique" "Boutique" NOT NULL,
    "variantId" TEXT,
    "sku" TEXT NOT NULL,
    "ean" TEXT,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "operatorId" TEXT,
    "saleItemId" TEXT,
    "note" TEXT,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Operator_boutique_idx" ON "Operator"("boutique");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_boutique_initials_key" ON "Operator"("boutique", "initials");

-- CreateIndex
CREATE INDEX "Sale_boutique_soldAt_idx" ON "Sale"("boutique", "soldAt");

-- CreateIndex
CREATE INDEX "Sale_operatorId_idx" ON "Sale"("operatorId");

-- CreateIndex
CREATE INDEX "Sale_soldAt_idx" ON "Sale"("soldAt");

-- CreateIndex
CREATE INDEX "Sale_type_idx" ON "Sale"("type");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_variantId_idx" ON "SaleItem"("variantId");

-- CreateIndex
CREATE INDEX "SaleItem_sku_idx" ON "SaleItem"("sku");

-- CreateIndex
CREATE INDEX "StockMovement_boutique_variantId_idx" ON "StockMovement"("boutique", "variantId");

-- CreateIndex
CREATE INDEX "StockMovement_variantId_idx" ON "StockMovement"("variantId");

-- CreateIndex
CREATE INDEX "StockMovement_movedAt_idx" ON "StockMovement"("movedAt");

-- CreateIndex
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_originalSaleId_fkey" FOREIGN KEY ("originalSaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
