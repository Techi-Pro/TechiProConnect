import { PrismaClient, VerificationStatus } from '@prisma/client';
import { hashPassword, comparePassword, createJWT } from '../middlewares/auth.middleware';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import config from '../../../config';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.secrets.emailUser,
    pass: config.secrets.emailPass,
  },
});

export const sendVerificationEmail = async (user, verificationToken) => {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve();
  }
  const baseURL = config.secrets.baseUrl || 'http://localhost:3000';
  const verificationLink = `${baseURL}/api/verify-email?token=${verificationToken}`;
  const mailOptions = {
    from: config.secrets.emailUser,
    to: user.email,
    subject: 'Verify Your Email',
    html: `<div style="font-family: Arial, sans-serif;"><h2>Welcome to TechEasyServe!</h2><p>Please verify your email by clicking the following link:</p><a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a></div>`
  };
  return transporter.sendMail(mailOptions);
};

export const getTechnicians = async () => {
  return prisma.technician.findMany({
    include: { category: true, services: true, ratings: true, location: true },
  });
};

export const createTechnician = async ({ username, password, email, categoryId, file }) => {
  if (!file) throw new Error('Document upload is required');
  const existingUser = await prisma.technician.findUnique({ where: { username } });
  const existingEmail = await prisma.technician.findUnique({ where: { email } });
  if (existingUser) throw new Error('Username already taken');
  if (existingEmail) throw new Error('Email already taken');
  const hashedPassword = await hashPassword(password);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const technician = await prisma.technician.create({
    data: {
      username,
      email,
      password: hashedPassword,
      categoryId: parseInt(categoryId),
      documents: file.path,
      verificationStatus: VerificationStatus.PENDING,
      verificationToken,
    },
  });
  await sendVerificationEmail(technician, verificationToken);
  return technician;
};

export const verifyTechnicianEmail = async (token) => {
  const technician = await prisma.technician.updateMany({
    where: {
      verificationToken: token,
      verificationStatus: VerificationStatus.PENDING,
    },
    data: {
      verificationStatus: VerificationStatus.VERIFIED,
      verificationToken: null,
    },
  });
  return technician.count;
};

export const loginTechnician = async ({ username, password }) => {
  const technician = await prisma.technician.findUnique({ where: { username } });
  if (!technician) throw new Error('Technician not found');
  if (technician.verificationStatus !== VerificationStatus.VERIFIED) throw new Error('Please verify your email to log in');
  const valid = await comparePassword(password, technician.password);
  if (!valid) throw new Error('Invalid password');
  const token = createJWT(technician);
  return { token };
};

export const getTechnician = async (id) => {
  return prisma.technician.findUnique({
    where: { id },
    include: { category: true, services: true, ratings: true, location: true },
  });
};

export const updateTechnician = async (id, data, file) => {
  const updateData = {
    ...data,
    categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
  };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }
  if (file) {
    updateData.documents = file.path;
    updateData.verificationStatus = VerificationStatus.PENDING;
  }
  return prisma.technician.update({ where: { id }, data: updateData });
};

export const deleteTechnician = async (id) => {
  return prisma.technician.delete({ where: { id } });
};

export const findNearbyTechnicians = async ({ latitude, longitude, radiusKm }) => {
  // Returns technicians within radiusKm kilometers, available and verified
  return prisma.$queryRaw`
    SELECT t.*, l.latitude, l.longitude
    FROM "Technician" t
    JOIN "Location" l ON t.id = l."technicianId"
    WHERE t."availabilityStatus" = 'AVAILABLE'
      AND t."verificationStatus" = 'VERIFIED'
      AND ST_DWithin(
        l."coordinates",
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
        ${radiusKm * 1000}
      )
  `;
}; 