import express from 'express';
import mainRouter from './routes/main.router';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { errorHandler } from './middlewares/error.middleware';
import forgotPasswordRoutes from './routes/forgot-password.routes';
import rateLimit from 'express-rate-limit';
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const prisma = new PrismaClient();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World' });
});

// Mount all API v1 routes
app.use('/api/v1', mainRouter);
app.use('/api/v1', forgotPasswordRoutes);

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
    socket.on('location-update', async (data) => {
        if (!socket.user || socket.user.role !== 'TECHNICIAN') {
            console.log('Unauthorized user tried to send location');
            socket.emit('error', { message: 'Unauthorized access to location update' });
            return;
        }
        try {
            await prisma.$executeRaw`
                INSERT INTO "Location" ("technicianId", "latitude", "longitude", "address", "coordinates")
                VALUES (${data.technicianId}, ${data.latitude}, ${data.longitude}, ${data.address}, ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326))
                ON CONFLICT ("technicianId")
                DO UPDATE SET "latitude" = ${data.latitude}, "longitude" = ${data.longitude}, "address" = ${data.address}, "coordinates" = ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326);
            `;
            io.emit('location-update', data);
        } catch (error) {
            console.error('Error updating location:', error);
            socket.emit('error', { message: 'Error updating location' });
        }
    });
    socket.on('message', async (data) => {
        try {
            // Save message to DB
            const message = await prisma.message.create({
                data: {
                    senderId: socket.user.id,
                    receiverId: data.receiverId,
                    content: data.message,
                    appointmentId: data.appointmentId || null,
                },
            });
            // Broadcast to the appointment room or receiver
            socket.broadcast.emit(`message-${data.appointmentId}`, {
                sender: socket.user.username,
                message: data.message,
                sentAt: message.sentAt,
            });
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('error', { message: 'Error saving message' });
        }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

export default app;