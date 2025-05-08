import { Prisma, PrismaClient, VerificationStatus } from '@prisma/client';
import { hashPassword, comparePassword, createJWT } from '../middlewares/auth.middleware';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import config from '../../../config';
import * as technicianService from '../services/technician.service';

const prisma = new PrismaClient();

// Setup nodemailer transporter (configure your email service provider)
const transporter = nodemailer.createTransport({
  service: 'Gmail',  // You can replace Gmail with another email service
  auth: {
    user: config.secrets.emailUser,
    pass: config.secrets.emailPass,
  },
});

// Function to send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  const baseURL = config.secrets.baseUrl || 'http://localhost:3000';
  const verificationLink = `${baseURL}/api/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: config.secrets.emailUser,
    to: user.email,
    subject: 'Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to TechEasyServe!</h2>
        <p>Please verify your email by clicking the following link:</p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
      </div>`,
  };

  return transporter.sendMail(mailOptions);
};

export const getTechnicians = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const [technicians, total] = await Promise.all([
      prisma.technician.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          isVerified: true,
          role: true,
          categoryId: true,
          verificationStatus: true,
          availabilityStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.technician.count(),
    ]);
    res.status(200).json({ items: technicians, total, page, pageSize: limit });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching technicians', error });
  }
};

export const createTechnician = async (req, res) => {
  const { username, password, email, categoryId } = req.body;
  const file = req.file;  // Document uploaded via multer

  if (!file) {
    return res.status(400).json({ message: 'Document upload is required' });
  }

  try {
    // Check if username or email is already taken
    const existingUser = await prisma.technician.findUnique({ where: { username } });
    const existingEmail = await prisma.technician.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    const hashedPassword = await hashPassword(password);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const technician = await prisma.technician.create({
      data: {
        username,
        email,
        password: hashedPassword,
        categoryId: parseInt(categoryId),
        documents: file.path,  // Save the document's file path
        verificationStatus: VerificationStatus.PENDING,  // Set verification status to pending
        verificationToken,  // Save the verification token
      },
    });

    // Send a verification email to the technician
    await sendVerificationEmail(technician, verificationToken);

    res.status(201).json({ message: 'Technician registered successfully. Please verify your email', technician });
  } catch (error) {
    console.error('Error registering technician:', error);
    res.status(500).json({ message: 'Error registering technician', error: error.message });
  }
};

export const verifyTechnicianEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Find technician by verification token
    const technician = await prisma.technician.updateMany({
      where: {
        verificationToken: token,
        verificationStatus: VerificationStatus.PENDING,
      },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        verificationToken: null,  // Clear the token after verification
      },
    });

    if (technician.count === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

export const loginTechnician = async (req, res) => {
  const { username, password } = req.body;

  try {
    const technician = await prisma.technician.findUnique({ where: { username } });

    if (!technician) return res.status(404).json({ message: 'Technician not found' });

    if (technician.verificationStatus !== VerificationStatus.VERIFIED) {
      return res.status(403).json({ message: 'Please verify your email to log in' });
    }

    const valid = await comparePassword(password, technician.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = createJWT(technician);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in technician:', error);
    res.status(500).json({ message: 'Error logging in technician' });
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
  const file = req.file; // Handle new document upload if provided

  try {
    // Build the data object using Prisma's TechnicianUpdateInput
    const data: Prisma.TechnicianUncheckedUpdateInput = {
      username,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
    };

    // If password is provided, hash it and add it to the data object
    if (password) {
      data.password = await hashPassword(password);
    }

    // If a file (document) is provided, update the documents and reset verification status
    if (file) {
      data.documents = file.path; // Update the document file path
      data.verificationStatus = VerificationStatus.PENDING; // Reset verification status when document is updated
    }

    // Update the technician in the database
    const updatedTechnician = await prisma.technician.update({
      where: { id },
      data,
    });

    res.json(updatedTechnician);
  } catch (error) {
    console.error('Error updating technician:', error);
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
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Technician not found' });
    }
    res.status(500).json({ message: 'Error deleting technician', error });
  }
};

export const getNearbyTechnicians = async (req, res) => {
  const { latitude, longitude, radiusKm } = req.query;
  try {
    if (!latitude || !longitude || !radiusKm) {
      return res.status(400).json({ message: 'latitude, longitude, and radiusKm are required' });
    }
    const technicians = await technicianService.findNearbyTechnicians({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radiusKm: parseFloat(radiusKm),
    });
    res.status(200).json(technicians);
  } catch (error) {
    console.error('Error finding nearby technicians:', error);
    res.status(500).json({ message: error.message });
  }
};
