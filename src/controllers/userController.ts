import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, createJWT } from '../modules/auth';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Setup nodemailer transporter (configure your email service provider)
const transporter = nodemailer.createTransport({
    service: 'Gmail',  // You can replace Gmail with another email service
    auth: {
      user: process.env.EMAIL_USERNAME,  // Your email
      pass: process.env.EMAIL_PASSWORD,  // Your email password
    },
  });

  // Function to send verification email
const sendVerificationEmail = async (user, verificationToken) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';  
    
    const verificationLink = `${baseURL}verify-email?token=${verificationToken}`;
  
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Verify Your Email',
      html: `<p>Please verify your email by clicking the following link: <a href="${verificationLink}">Verify Email</a></p>`
    };
  
    return transporter.sendMail(mailOptions);
  };

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */


// Your user routes implementation here


export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: password123
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

export const createUser = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if the username or email already exists
        const existingUser = await prisma.user.findUnique({ where: { username } });
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already taken' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Generate a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create the user in the database with the verification token
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email,
                verificationToken,  // Store the token for verification
            },
        });

        // Send the verification email
        await sendVerificationEmail(user, verificationToken);

        // Respond with a success message (don't send the JWT yet)
        res.status(201).json({ message: 'User created. Please check your email to verify your account.' });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Find user by verification token
    const user = await prisma.user.updateMany({
      where: {
        verificationToken: token,
        isVerified: false
      },
      data: {
        isVerified: true,
        verificationToken: null,  // Clear the token after verification
      },
    });

    if (user.count === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export const loginUser = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { username } });
  
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email to log in' });
      }
  
      const valid = await comparePassword(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Invalid password' });
  
      const token = createJWT(user);
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Error logging in user' });
    }
  };
  
export const getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, email } = req.body;

    try {
        const data: any = { username, email };
        if (password) {
            data.password = await hashPassword(password);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
        });

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await prisma.user.delete({ where: { id } });
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};
