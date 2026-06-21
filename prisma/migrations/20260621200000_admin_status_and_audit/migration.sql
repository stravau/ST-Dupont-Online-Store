-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('DISPONIVEL', 'INDISPONIVEL', 'DESCONTINUADO');

-- AlterTable: add status column to ProductVariant
ALTER TABLE "ProductVariant" ADD COLUMN "status" "VariantStatus" NOT NULL DEFAULT 'DISPONIVEL';
CREATE INDEX "ProductVariant_status_idx" ON "ProductVariant"("status");

-- CreateTable: AdminAction audit log
CREATE TABLE "AdminAction" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT,
    "entityType" TEXT NOT NULL,
    "action"     TEXT NOT NULL,
    "entityId"   TEXT,
    "before"     JSONB,
    "after"      JSONB,
    "note"       TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminAction_userId_idx"            ON "AdminAction"("userId");
CREATE INDEX "AdminAction_createdAt_idx"         ON "AdminAction"("createdAt");
CREATE INDEX "AdminAction_entityType_entityId_idx" ON "AdminAction"("entityType", "entityId");

ALTER TABLE "AdminAction"
  ADD CONSTRAINT "AdminAction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
