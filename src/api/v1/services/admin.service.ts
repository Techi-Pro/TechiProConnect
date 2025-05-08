import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPendingTechnicians = async () => {
  return prisma.technician.findMany({
    where: { verificationStatus: 'PENDING' },
    select: {
      id: true,
      username: true,
      documents: true,
      verificationStatus: true,
    },
  });
};

export const approveTechnician = async (id) => {
  return prisma.technician.update({
    where: { id },
    data: { verificationStatus: 'VERIFIED' },
  });
};

export const rejectTechnician = async (id) => {
  return prisma.technician.update({
    where: { id },
    data: { verificationStatus: 'REJECTED' },
  });
}; 