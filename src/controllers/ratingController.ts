import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRating = async (req, res) => {
    const { score, comment, technicianId, userId } = req.body;

    try {
        // Validate score (should be between 1 and 5)
        if (score < 1 || score > 5) {
            return res.status(400).json({ message: 'Score must be between 1 and 5' });
        }

        // Check if technician exists
        const technician = await prisma.technician.findUnique({
            where: { id: technicianId },
        });
        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create rating
        const rating = await prisma.rating.create({
            data: { score, comment, technicianId, userId },
        });

        res.status(201).json(rating);
    } catch (error) {
        console.error('Error creating rating:', error);
        res.status(500).json({ message: 'Error creating rating' });
    }
};

export const getRatingsByTechnician = async (req, res) => {
    const { technicianId } = req.params;

    try {
        // Check if technician exists
        const technician = await prisma.technician.findUnique({
            where: { id: technicianId },
        });
        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        // Fetch ratings
        const ratings = await prisma.rating.findMany({
            where: { technicianId },
        });

        res.status(200).json(ratings);
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ message: 'Error fetching ratings' });
    }
};
