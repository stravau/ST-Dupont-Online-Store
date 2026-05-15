/*
  Warnings:

  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - Added the required column `tagline` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `Category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `collection` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `description` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `ProductVariant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "description",
ADD COLUMN     "tagline" JSONB NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "collection" TEXT NOT NULL,
ADD COLUMN     "image" TEXT,
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
ALTER COLUMN "attributes" SET DEFAULT '{}',
ALTER COLUMN "images" SET DEFAULT ARRAY[]::TEXT[];
