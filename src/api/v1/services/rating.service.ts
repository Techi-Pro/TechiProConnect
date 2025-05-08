import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRating = async ({ score, comment, technicianId, userId }) => {
    if (score < 1 || score > 5) throw new Error('Score must be between 1 and 5');
    const technician = await prisma.technician.findUnique({ where: { id: technicianId } });
    if (!technician) throw new Error('Technician not found');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return prisma.rating.create({ data: { score, comment, technicianId, userId } });
};

export const getRatingsByTechnician = async (technicianId) => {
    const technician = await prisma.technician.findUnique({ where: { id: technicianId } });
    if (!technician) throw new Error('Technician not found');
    return prisma.rating.findMany({ where: { technicianId } });
}; 