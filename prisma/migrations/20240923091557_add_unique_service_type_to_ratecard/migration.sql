/*
  Warnings:

  - A unique constraint covering the columns `[serviceType]` on the table `RateCard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RateCard_serviceType_key" ON "RateCard"("serviceType");
