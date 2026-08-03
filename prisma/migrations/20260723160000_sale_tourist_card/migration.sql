-- Sale gains an explicit "cartão turista" flag (was previously only free text
-- in the note). Existing rows default to false.
ALTER TABLE "Sale" ADD COLUMN "touristCard" BOOLEAN NOT NULL DEFAULT false;
