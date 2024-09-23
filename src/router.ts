import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body } from 'express-validator';
import { handleInputErrors } from './modules/middleware';
import { createTechnician, deleteTechnician, getTechnician, getTechnicians, updateTechnician } from './controllers/technicianController';
import { createService, deleteService, getService, getServices, updateService } from './controllers/serviceController';
import { createCategory, getCategories } from './controllers/categoryController';
import { createRating, getRatingsByTechnician } from './controllers/ratingController';
import { upsertLocation } from './controllers/locationController';
import haversine from 'haversine';
import { upload } from './middleware/upload';
import { makePayment, handlePaymentCallback } from './controllers/paymentController';

const router = Router();
const prisma = new PrismaClient();
/**
 * Technicians
 */


/**
 * @swagger
 * /technicians:
 *   get:
 *     summary: Retrieve a list of technicians
 *     tags: [Technicians]
 *     responses:
 *       200:
 *         description: A list of technicians
 */
router.get('/technicians', getTechnicians);


/**
 * @swagger
 * /technicians/{id}:
 *   get:
 *     summary: Get a technician by ID
 *     tags: [Technicians]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The technician ID
 *     responses:
 *       200:
 *         description: Technician data
 *       404:
 *         description: Technician not found
 */
router.get('/technicians/:id', 
  handleInputErrors, 
  getTechnician
);


/**
 * @swagger
 * /technicians:
 *   post:
 *     summary: Create a new technician
 *     tags: [Technicians]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               categoryId:
 *                 type: integer
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Technician created
 */

router.post('/technicians', 
  body('username').isString().withMessage('Username must be a string'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('categoryId').isInt().withMessage('Category ID must be an integer'),
  handleInputErrors,
  upload.single('document'),
  createTechnician
);


/**
 * @swagger
 * /technicians/{id}:
 *   put:
 *     summary: Update a technician
 *     tags: [Technicians]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Technician ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Technician updated
 */

router.put('/technicians/:id', 
  body('username').optional().isString().withMessage('Username must be a string'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('categoryId').optional().isInt().withMessage('Category ID must be an integer'),
  handleInputErrors,
  upload.single('document'),
  updateTechnician
   
);


/**
 * @swagger
 * /technicians/{id}:
 *   delete:
 *     summary: Delete a technician
 *     tags: [Technicians]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Technician ID
 *     responses:
 *       200:
 *         description: Technician deleted
 */

router.delete('/technicians/:id', 
  handleInputErrors,
  deleteTechnician
    
);

/**
 * Services
 */


/**
 * @swagger
 * /services:
 *   get:
 *     summary: Retrieve a list of services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: A list of services
 */
router.get('/services', 
  getServices
);


/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get a service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service data
 */

router.get('/services/:id', 
  handleInputErrors, 
  getService
    
);

router.post('/services', 
  body('name').isString().withMessage('Name must be a string'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('technicianId').isUUID().withMessage('Technician ID must be a valid UUID'),
  handleInputErrors, 
  createService
    
);

router.put('/services/:id', 
  body('name').optional().isString().withMessage('Name must be a string'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  handleInputErrors, 
  updateService
    
);

router.delete('/services/:id', 
  handleInputErrors, 
  deleteService
    
);

/**
 * Categories
 */
router.get('/categories', 
  getCategories

);

router.post('/categories', 
  body('name').isString().withMessage('Name must be a string'),
  handleInputErrors,
  createCategory
    
);

/**
 * Ratings
 */
router.get('/ratings/technician/:technicianId', 
  handleInputErrors,
  getRatingsByTechnician
    
);

router.post('/ratings', 
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be an integer between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
  body('technicianId').isUUID().withMessage('Technician ID must be a valid UUID'),
  body('userId').isUUID().withMessage('User ID must be a valid UUID'),
  handleInputErrors,
  createRating 
    
);

/**
 * Locations
 */
router.post('/technicians/:id/location', 
  body('latitude').isFloat().withMessage('Latitude must be a number'),
  body('longitude').isFloat().withMessage('Longitude must be a number'),
  body('address').optional().isString().withMessage('Address must be a string'),
  handleInputErrors,
  upsertLocation

);


/**
 * Service Requests
 */
router.post('/service-requests', async (req, res) => {
  try {
    const { clientId, serviceType, latitude, longitude } = req.body;

    const newServiceRequest = await prisma.serviceRequest.create({
      data: {
        clientId,
        serviceType,
        latitude,
        longitude,
        status: 'PENDING',  // By default, request starts as pending
      },
    });

    res.status(201).json(newServiceRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create service request' });
  }
});

router.post('/service-requests/:id/match', async (req, res) => {
  try {
    const { id } = req.params;
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: parseInt(id) },
      include: { client: true },
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

// Find all technicians that match the service type (you can adjust this based on your requirements)
const availableTechnicians = await prisma.technician.findMany({
  where: {
    services: { some: { name: serviceRequest.serviceType } }, // Assuming Technician offers services
  },
  include: {
    location: true, // Include the location relation
  },
});

// Match with the closest technician using Haversine formula
let closestTechnician = null;
let minDistance = Infinity;

availableTechnicians.forEach((technician) => {
  if (technician.location) {
    const technicianLocation = {
      latitude: technician.location.latitude,
      longitude: technician.location.longitude,
    };

    const clientLocation = {
      latitude: serviceRequest.latitude,
      longitude: serviceRequest.longitude,
    };

    const distance = haversine(clientLocation, technicianLocation);
    if (distance < minDistance) {
      minDistance = distance;
      closestTechnician = technician;
    }
  }
});

  if (!closestTechnician) {
      return res.status(404).json({ message: 'No technicians available for this service' });
    }

    // Assign the closest technician to the service request
  const updatedRequest = await prisma.serviceRequest.update({
      where: { id: parseInt(id) },
      data: {
        technicianId: closestTechnician.id,
        status: 'ACCEPTED', // Update status to accepted
      },
    });

    res.status(200).json({ message: 'Technician assigned', request: updatedRequest, technician: closestTechnician });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to match technician' });
  }
});

router.post('/appointments', async (req, res) => {
  const { clientId, technicianId, serviceType, appointmentDate } = req.body;

  try {
    // Fetch rate card for the service type
    const rateCard = await prisma.rateCard.findUnique({
      where: { serviceType },
    });

    if (!rateCard) {
      return res.status(404).json({ message: 'Rate card not found for this service' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        technicianId,
        serviceType,
        appointmentDate: new Date(appointmentDate),
      },
    });

    res.status(201).json({ 
      message: 'Appointment created successfully', 
      appointment,
      rate: { min: rateCard.minPrice, max: rateCard.maxPrice },  // Return rate for transparency
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
});


// Initiate payment
router.post('/payments/initiate', makePayment);

// Handle Daraja callback
router.post('/payments/callback', handlePaymentCallback);



export default router;
