/*
  Warnings:

  - You are about to drop the column `latitude` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Location` table. All the data in the column will be lost.
  - Added the required column `coordinates` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "coordinates" geometry(Point, 4326) NOT NULL;
