import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const upsertLocation = async (req, res) => {
    const { id } = req.params;
    const { latitude, longitude, address } = req.body;

    try {
        // Validate latitude and longitude
        if (!latitude || !longitude || !address) {
            return res.status(400).json({ message: 'Latitude, longitude, and address are required' });
        }

        // Validate if technician exists
        const technician = await prisma.technician.findUnique({
            where: { id },
        });

        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        // Upsert location (update if exists, otherwise create)
        const location = await prisma.location.upsert({
            where: { technicianId: id },
            update: { latitude, longitude, address },
            create: { technicianId: id, latitude, longitude, address },
        });

        res.status(200).json(location);
    } catch (error) {
        console.error('Error upserting location:', error);
        res.status(500).json({ message: 'Error upserting location' });
    }
};
