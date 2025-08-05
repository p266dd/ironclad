/*
  Warnings:

  - A unique constraint covering the columns `[businessCode]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_businessCode_key" ON "user"("businessCode");
