import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../modules/auth';  // Assuming hashPassword is already implemented

const prisma = new PrismaClient();

export const getTechnicians = async (req, res) => {
    try {
        const technicians = await prisma.technician.findMany({
            include: { category: true, services: true, ratings: true, location: true },
        });
        res.json(technicians);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching technicians', error });
    }
};

export const createTechnician = async (req, res) => {
    const { username, password, categoryId } = req.body;
    const file = req.file;  // Document uploaded via multer

    if (!file) {
        return res.status(400).json({ message: 'Document upload is required' });
    }

    try {
        const hashedPassword = await hashPassword(password);

        const technician = await prisma.technician.create({
            data: {
                username,
                password: hashedPassword,
                categoryId: parseInt(categoryId),
                documents: file.path,  // Save the document's file path
                verificationStatus: 'PENDING',  // Set verification status to pending
            },
        });

        res.status(201).json({ message: 'Technician registered successfully', technician });
    } catch (error) {
        res.status(500).json({ message: 'Error registering technician', error });
    }
};

export const getTechnician = async (req, res) => {
    const { id } = req.params;
    try {
        const technician = await prisma.technician.findUnique({
            where: { id },
            include: { category: true, services: true, ratings: true, location: true },
        });

        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        res.json(technician);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching technician', error });
    }
};

export const updateTechnician = async (req, res) => {
    const { id } = req.params;
    const { username, password, categoryId } = req.body;
    const file = req.file;  // Handle new document upload if provided

    try {
        const data: any = {
            username,
            categoryId: parseInt(categoryId),
        };

        if (password) {
            data.password = await hashPassword(password);
        }

        if (file) {
            data.documents = file.path;  // Update the document file path
            data.verificationStatus = 'PENDING';  // Reset verification status when document is updated
        }

        const updatedTechnician = await prisma.technician.update({
            where: { id },
            data,
        });

        res.json(updatedTechnician);
    } catch (error) {
        res.status(500).json({ message: 'Error updating technician', error });
    }
};

export const deleteTechnician = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.technician.delete({
            where: { id },
        });
        res.json({ message: 'Technician deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting technician', error });
    }
};
