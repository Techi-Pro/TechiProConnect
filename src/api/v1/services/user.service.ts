import { PrismaClient } from '@prisma/client';
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
    const baseURL = (config.secrets.baseUrl || 'http://localhost:3000').replace(/\/+$/, ''); // Remove trailing slashes
    const verificationLink = `${baseURL}/api/v1/verify-email?token=${verificationToken}`;
    const mailOptions = {
        from: config.secrets.emailUser,
        to: user.email,
        subject: 'Verify Your Email',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #333; text-align: center;">Welcome to TechEasyServe!</h2><p style="font-size: 16px; color: #555;">Hi ${user.username},<br><br>Thank you for registering with us! Please verify your email address to complete your registration and start accessing our platform.</p><div style="text-align: center; margin: 30px 0;"><a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a></div><p style="font-size: 14px; color: #777;">If you did not sign up for this account, please ignore this email.</p><hr style="border: 0; border-top: 1px solid #e0e0e0;"/><p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} TechEasyServe. All rights reserved.</p></div>`
    };
    return transporter.sendMail(mailOptions);
};

export const getUsers = async () => {
    return prisma.user.findMany();
};

export const createUser = async ({ username, password, email }) => {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Username already taken');
    if (existingEmail) throw new Error('Email already taken');
    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await prisma.user.create({
        data: { username, password: hashedPassword, email, verificationToken },
    });
    await sendVerificationEmail(user, verificationToken);
    return user;
};

export const verifyEmail = async (token) => {
    const user = await prisma.user.updateMany({
        where: { verificationToken: token, isVerified: false },
        data: { isVerified: true, verificationToken: null },
    });
    return user.count > 0;
};

export const loginUser = async ({ username, password }) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error('User not found');
    if (!user.isVerified) throw new Error('Please verify your email to log in');
    const valid = await comparePassword(password, user.password);
    if (!valid) throw new Error('Invalid password');
    const token = createJWT(user);
    return { token };
};

export const getUser = async (id) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');
    return user;
};

export const updateUser = async (id, data) => {
    if (data.password) {
        data.password = await hashPassword(data.password);
    }
    const user = await prisma.user.update({ where: { id }, data });
    return user;
};

export const deleteUser = async (id) => {
    const user = await prisma.user.delete({ where: { id } });
    return user;
};