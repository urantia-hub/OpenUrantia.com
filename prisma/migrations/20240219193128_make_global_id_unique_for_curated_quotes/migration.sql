/*
  Warnings:

  - A unique constraint covering the columns `[globalId]` on the table `curated_quotes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "curated_quotes_globalId_key" ON "curated_quotes"("globalId");
