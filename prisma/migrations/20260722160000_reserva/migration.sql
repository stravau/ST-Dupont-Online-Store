-- Reserva — client holds, mirrors the Excel "Reservas" sheet.

CREATE TYPE "ReservaStatus" AS ENUM ('ATIVA', 'CONCLUIDA', 'CANCELADA', 'EXPIRADA');

CREATE TABLE "Reserva" (
  "id"            TEXT NOT NULL,
  "boutique"      "Boutique" NOT NULL DEFAULT 'LIS',
  "reservedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expectedAt"    TIMESTAMP(3),
  "variantId"     TEXT,
  "sku"           TEXT NOT NULL,
  "ean"           TEXT,
  "descSnapshot"  TEXT NOT NULL,
  "brand"         TEXT,
  "quantity"      INTEGER NOT NULL DEFAULT 1,
  "pvpCents"      INTEGER,
  "customerName"  TEXT NOT NULL,
  "customerPhone" TEXT,
  "customerEmail" TEXT,
  "operator"      TEXT NOT NULL,
  "status"        "ReservaStatus" NOT NULL DEFAULT 'ATIVA',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Reserva"
  ADD CONSTRAINT "Reserva_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Reserva_boutique_reservedAt_idx" ON "Reserva"("boutique", "reservedAt");
CREATE INDEX "Reserva_status_idx" ON "Reserva"("status");
CREATE INDEX "Reserva_customerPhone_idx" ON "Reserva"("customerPhone");
CREATE INDEX "Reserva_variantId_idx" ON "Reserva"("variantId");
