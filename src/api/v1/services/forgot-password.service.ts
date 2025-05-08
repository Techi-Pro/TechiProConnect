import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { hashPassword } from '../middlewares/auth.middleware';
import config from '../../../config';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: config.secrets.emailUser,
    pass: config.secrets.emailPass,
  },
});

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User with this email does not exist');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000);
  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry,
    },
  });
  const baseURL = config.secrets.baseUrl || 'http://localhost:3000';
  const resetLink = `${baseURL}reset-password?token=${resetToken}`;
  const mailOptions = {
    from: config.secrets.emailUser,
    to: email,
    subject: 'Password Reset Request',
    html: `<div style="font-family: Arial, sans-serif;"><h2>Password Reset Request</h2><p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Reset Password</a><p>If you did not request this, please ignore this email.</p></div>`
  };
  await transporter.sendMail(mailOptions);
  return true;
};

export const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gte: new Date(),
      },
    },
  });
  if (!user) throw new Error('Invalid or expired token');
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
  return true;
}; 