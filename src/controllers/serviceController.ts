import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getServices = async (req, res) => {
    try {
        const services = await prisma.service.findMany();
        res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Error fetching services' });
    }
};

export const createService = async (req, res) => {
    const { name, price, technicianId } = req.body;

    try {
        // Check if the technician exists
        const technician = await prisma.technician.findUnique({ where: { id: technicianId } });
        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        const service = await prisma.service.create({
            data: { 
                name,
                price: parseFloat(price),  // Convert price to float
                technicianId 
            },
        });

        res.status(201).json(service);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Error creating service' });
    }
};

export const getService = async (req, res) => {
    const { id } = req.params;

    try {
        const service = await prisma.service.findUnique({
            where: { id: parseInt(id) },
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Error fetching service' });
    }
};

export const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    try {
        const updatedService = await prisma.service.update({
            where: { id: parseInt(id) },
            data: { name, price: parseFloat(price) },
        });

        if (!updatedService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Error updating service' });
    }
};

export const deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedService = await prisma.service.delete({
            where: { id: parseInt(id) },
        });

        if (!deletedService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json({ message: 'Service deleted' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Error deleting service' });
    }
};
