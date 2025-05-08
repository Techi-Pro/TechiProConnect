import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Define the expected result type for the raw query
interface NearestTechnician {
  id: string;
  username: string;
  email: string;
  availabilityStatus: string;
  distance: number;  // Add the distance field from the raw query
}

export const nearestTechnicianHandler = async (req: Request, res: Response): Promise<void> => {
  const { latitude, longitude, serviceType } = req.body;

  if (!latitude || !longitude) {
    res.status(400).json({ message: 'Latitude and longitude are required.' });
    return;
  }

  try {
    // Fetch the closest technicians using raw PostGIS queries
    const technicians = await prisma.$queryRaw<NearestTechnician[]>`
      SELECT "Technician".*, "Location"."coordinates",
        ST_Distance("Location"."coordinates", ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)) as distance
      FROM "Technician"
      INNER JOIN "Location" ON "Technician"."id" = "Location"."technicianId"
      WHERE ST_DWithin(
        "Location"."coordinates", ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), 50000 -- 50 km radius
      )
      AND "Technician"."availabilityStatus" = 'AVAILABLE'
      ORDER BY distance ASC
      LIMIT 1;
    `;

    // Ensure the technicians array has elements before accessing its properties
    if (!technicians || technicians.length === 0) {
      res.status(404).json({ message: 'No technicians found within the search radius.' });
      return;
    }

    const nearestTechnician = technicians[0];
    res.status(200).json({
      message: 'Nearest technician found',
      technician: nearestTechnician,
      distance: nearestTechnician.distance,  // Return distance for transparency
    });
    return;
  } catch (error) {
    console.error('Error finding nearest technician:', error);
    res.status(500).json({ message: 'Failed to find the nearest technician' });
    return;
  }
};
