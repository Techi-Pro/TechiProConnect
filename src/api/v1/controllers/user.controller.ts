import { PrismaClient } from '@prisma/client';
import * as userService from '../services/user.service';

// Define interface for update data
interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
}

const prisma = new PrismaClient();

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Create a new user
export const createUser = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const user = await userService.createUser({ username, password, email });
        res.status(201).json({ message: 'User created. Please check your email to verify your account.' });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.message === 'Username already taken') {
            return res.status(400).json({ message: 'Username already taken' });
        }
        if (error.message === 'Email already taken') {
            return res.status(400).json({ message: 'Email already taken' });
        }
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Verify email
export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const verified = await userService.verifyEmail(token);
        if (!verified) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
};

// Log in a user
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const { token } = await userService.loginUser({ username, password });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        if (error.message === 'Please verify your email to log in') {
            return res.status(403).json({ message: 'Please verify your email to log in' });
        }
        if (error.message === 'Invalid password') {
            return res.status(401).json({ message: 'Invalid password' });
        }
        res.status(500).json({ message: 'Error logging in user' });
    }
};

// Get a single user
export const getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userService.getUser(id);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Error fetching user' });
    }
};

// Update a user
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, email } = req.body;

    try {
        const data: UpdateUserData = { username, email };
        if (password) {
            data.password = password; // Service layer will hash it
        }
        const updatedUser = await userService.updateUser(id, data);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await userService.deleteUser(id);
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Error deleting user' });
    }
};