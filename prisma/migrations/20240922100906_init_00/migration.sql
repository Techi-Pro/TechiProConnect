-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'TECHNICIAN', 'ADMIN');

-- AlterTable
ALTER TABLE "Technician" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'TECHNICIAN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
