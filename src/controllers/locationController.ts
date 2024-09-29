import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const upsertLocation = async (req, res) => {
    const { id } = req.params;
    const { latitude, longitude, address } = req.body;

    try {
        // Validate latitude, longitude, and address
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

        // Upsert location with PostGIS support using raw SQL
        await prisma.$executeRaw`
          INSERT INTO "Location" ("technicianId", "latitude", "longitude", "address", "coordinates")
          VALUES (${id}, ${latitude}, ${longitude}, ${address}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
          ON CONFLICT ("technicianId")
          DO UPDATE SET "latitude" = ${latitude}, "longitude" = ${longitude}, "address" = ${address}, "coordinates" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326);
        `;

        res.status(200).json({ message: 'Location upserted successfully' });
    } catch (error) {
        console.error('Error upserting location:', error);
        res.status(500).json({ message: 'Error upserting location' });
    }
};
