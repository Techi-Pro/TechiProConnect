-- CreateEnum
CREATE TYPE "FirebaseKycStatus" AS ENUM ('PENDING', 'PROCESSING', 'FIREBASE_VERIFIED', 'FIREBASE_REJECTED', 'FIREBASE_ERROR', 'ADMIN_REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "KycAuditAction" AS ENUM ('FIREBASE_KYC_SUBMITTED', 'FIREBASE_KYC_VERIFIED', 'FIREBASE_KYC_REJECTED', 'ADMIN_APPROVED', 'ADMIN_REJECTED', 'ADMIN_REQUESTED_MORE_INFO', 'DOCUMENTS_RESUBMITTED');

-- AlterTable
ALTER TABLE "Technician" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "adminReviewedAt" TIMESTAMP(3),
ADD COLUMN     "biometricData" JSONB,
ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ADD COLUMN     "documentUrls" JSONB,
ADD COLUMN     "firebaseKycData" JSONB,
ADD COLUMN     "firebaseKycStatus" "FirebaseKycStatus" DEFAULT 'PENDING',
ADD COLUMN     "kycProcessedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "KycAuditLog" (
    "id" SERIAL NOT NULL,
    "technicianId" TEXT NOT NULL,
    "action" "KycAuditAction" NOT NULL,
    "performedBy" TEXT NOT NULL,
    "previousStatus" "VerificationStatus",
    "newStatus" "VerificationStatus",
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycAuditLog" ADD CONSTRAINT "KycAuditLog_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
