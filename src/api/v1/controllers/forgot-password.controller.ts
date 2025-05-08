import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { hashPassword } from '../middlewares/auth.middleware'; 
import * as forgotPasswordService from '../services/forgot-password.service';
import config from '../../../config';

const prisma = new PrismaClient();

// Nodemailer transporter setup (update to your email config)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Replace with your SMTP server
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USERNAME, 
    pass: process.env.EMAIL_PASSWORD, 
  },
});

// Forgot password function
export const forgotPassword = async (req, res) => {
    try {
        await forgotPasswordService.forgotPassword(req.body.email);
        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Reset password function
export const resetPassword = async (req, res) => {
    try {
        await forgotPasswordService.resetPassword(req.query.token, req.body.newPassword);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
