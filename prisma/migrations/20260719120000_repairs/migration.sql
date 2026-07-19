-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('ABERTO', 'EM_ANALISE', 'EM_ESPANHA', 'ORCAMENTO_ENVIADO', 'A_AGUARDAR_CLIENTE', 'RESOLVIDO');

-- CreateTable
CREATE TABLE "Repair" (
    "id" TEXT NOT NULL,
    "boutique" "Boutique" NOT NULL DEFAULT 'LIS',
    "firstVisitAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "staff" TEXT NOT NULL,
    "status" "RepairStatus" NOT NULL DEFAULT 'ABERTO',
    "customerName" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "updates" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "lastContactStaff" TEXT,
    "lastContactVia" TEXT,
    "lastContactNote" TEXT,
    "otherObs" TEXT,
    "phone" TEXT,
    "otherContacts" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Repair_boutique_firstVisitAt_idx" ON "Repair"("boutique", "firstVisitAt");

-- CreateIndex
CREATE INDEX "Repair_status_idx" ON "Repair"("status");

-- CreateIndex
CREATE INDEX "Repair_firstVisitAt_idx" ON "Repair"("firstVisitAt");
