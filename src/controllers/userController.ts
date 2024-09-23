import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, createJWT } from '../modules/auth';

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const createUser = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: { username, password: hashedPassword, email },
        });

        const token = createJWT(user);
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ message: 'User not found' });

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
