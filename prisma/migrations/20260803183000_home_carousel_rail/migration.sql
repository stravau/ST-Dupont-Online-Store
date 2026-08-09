-- Rail no carrossel curado: hoje só "DESTAQUES", mas as Novidades vão querer
-- a mesma máquina, e é mais barato abrir espaço agora do que migrar depois.
ALTER TABLE "HomeCarouselItem" ADD COLUMN "rail" TEXT NOT NULL DEFAULT 'DESTAQUES';

DROP INDEX "HomeCarouselItem_sku_key";
DROP INDEX "HomeCarouselItem_position_idx";

CREATE UNIQUE INDEX "HomeCarouselItem_rail_sku_key" ON "HomeCarouselItem"("rail", "sku");
CREATE INDEX "HomeCarouselItem_rail_position_idx" ON "HomeCarouselItem"("rail", "position");
