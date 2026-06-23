-- Add optional per-colourway description override on ProductVariant.
-- Null = inherit the parent Product.description (the default for every
-- existing row); set when a specific finish/colourway has its own copy.
ALTER TABLE "ProductVariant" ADD COLUMN "description" JSONB;
