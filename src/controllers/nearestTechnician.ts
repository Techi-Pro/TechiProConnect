import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import haversine from 'haversine';  // Haversine package for distance calculation

const router = Router();
const prisma = new PrismaClient();

// Define the maximum search radius (in kilometers)
const MAX_RADIUS = 50;

router.post('/technicians/nearest', async (req, res) => {
  const { latitude, longitude, serviceType } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  try {
    // Find all technicians who offer the requested service type
    const availableTechnicians = await prisma.technician.findMany({
      where: {
        services: { some: { name: serviceType } },
        location: { isNot: null }, // Ensure the technician has a location
      },
      include: { location: true }
    });

    if (!availableTechnicians.length) {
      return res.status(404).json({ message: 'No technicians found for this service.' });
    }

    const clientLocation = { latitude, longitude };

    // Find the nearest technician using the Haversine formula
    let nearestTechnician = null;
    let minDistance = Infinity;

    availableTechnicians.forEach(technician => {
      const technicianLocation = {
        latitude: technician.location.latitude,
        longitude: technician.location.longitude,
      };

      const distance = haversine(clientLocation, technicianLocation, { unit: 'km' });

      if (distance < minDistance && distance <= MAX_RADIUS) {
        minDistance = distance;
        nearestTechnician = technician;
      }
    });

    if (!nearestTechnician) {
      return res.status(404).json({ message: 'No technicians found within the search radius.' });
    }

    res.status(200).json({
      technician: nearestTechnician,
      distance: minDistance,  // Return distance for transparency
    });
  } catch (error) {
    console.error('Error finding nearest technician:', error);
    res.status(500).json({ error: 'Failed to find the nearest technician' });
  }
});

export default router;
