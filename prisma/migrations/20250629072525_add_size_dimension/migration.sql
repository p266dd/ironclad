/*
  Warnings:

  - The `size` column on the `Size` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Size" ADD COLUMN     "dimension" TEXT DEFAULT '0mm',
DROP COLUMN "size",
ADD COLUMN     "size" INTEGER NOT NULL DEFAULT 0;
