import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getServices = async ({ skip = 0, take = 10 } = {}) => {
    return prisma.service.findMany({
        skip,
        take,
        select: {
            id: true,
            name: true,
            price: true,
            technicianId: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

export const countServices = async () => {
    return prisma.service.count();
};

export const createService = async ({ name, price, technicianId }) => {
    const technician = await prisma.technician.findUnique({ where: { id: technicianId } });
    if (!technician) throw new Error('Technician not found');
    return prisma.service.create({
        data: {
            name,
            price: parseFloat(price),
            technicianId
        },
    });
};

export const getService = async (id) => {
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
    if (!service) throw new Error('Service not found');
    return service;
};

export const updateService = async (id, { name, price }) => {
    const updatedService = await prisma.service.update({
        where: { id: parseInt(id) },
        data: { name, price: parseFloat(price) },
    });
    if (!updatedService) throw new Error('Service not found');
    return updatedService;
};

export const deleteService = async (id) => {
    const deletedService = await prisma.service.delete({ where: { id: parseInt(id) } });
    if (!deletedService) throw new Error('Service not found');
    return deletedService;
}; 