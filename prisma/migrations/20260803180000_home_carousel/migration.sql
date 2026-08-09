-- Curadoria do carrossel da homepage. Vazio = comportamento automático.
CREATE TABLE "HomeCarouselItem" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HomeCarouselItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HomeCarouselItem_sku_key" ON "HomeCarouselItem"("sku");
CREATE INDEX "HomeCarouselItem_position_idx" ON "HomeCarouselItem"("position");
