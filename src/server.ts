import express from 'express';
import router from './router';  // All protected routes
import morgan from 'morgan';
import cors from 'cors';
import { protect } from './modules/auth';  // Protect middleware for API routes
import { createUser, loginUser , verifyEmail} from './controllers/userController';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import appointmentRouter from './controllers/appointmentRoutes'
import nearestTechnicianRouter from './controllers/nearestTechnician'
import { errorHandler } from './middleware/errorHandler'; 




const app = express();
const server = http.createServer(app);  // Create HTTP server for Express
const io = new Server(server);  // Initialize Socket.io
const prisma = new PrismaClient();
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route for server
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World' });
});

// Public routes (no authentication required)
app.post('/users', createUser);  // User registration
app.use('/verify-email', verifyEmail); // Email verification
app.post('/login', loginUser);   // User login

// Protected routes (require authentication)
app.use('/api', protect, router);  // All other routes under /api are protected

app.use('/api', nearestTechnicianRouter);

// Use appointment routes for scheduling
app.use('/api', appointmentRouter);  // Add the appointment routes

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(errorHandler);

// WebSocket Middleware for JWT Authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        console.log('No token provided');
        socket.emit('error', { message: 'Authentication error: No token provided' });
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = user;
        next();
    } catch (error) {
        console.error('Invalid token:', error);
        socket.emit('error', { message: 'Authentication error: Invalid token' });
        return next(new Error('Authentication error: Invalid token'));
    }
});


// WebSocket event for real-time tracking and messaging
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Location update event from the technician
    socket.on('location-update', async (data: { technicianId: string; latitude: number; longitude: number; address: string }) => {
        if (!socket.user || socket.user.role !== 'TECHNICIAN') {
            console.log('Unauthorized user tried to send location');
            socket.emit('error', { message: 'Unauthorized access to location update' });
            return;
        }
    
        try {
            await prisma.location.upsert({
                where: { technicianId: data.technicianId },
                update: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: data.address,
                },
                create: {
                    technicianId: data.technicianId,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    address: data.address,
                },
            });
            io.emit('location-update', data);
        } catch (error) {
            console.error('Error updating location:', error);
            socket.emit('error', { message: 'Error updating location' });
        }
    });
    

    // Real-time messaging between clients and technicians
    socket.on('message', (data: { appointmentId: number; message: string }) => {
        try {
            console.log(`Message received for appointment ${data.appointmentId}:`, data.message);
    
            // Broadcast the message to all clients related to the specific appointment
            socket.broadcast.emit(`message-${data.appointmentId}`, {
                sender: socket.user.username,
                message: data.message,
            });
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }); 
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

export default app;