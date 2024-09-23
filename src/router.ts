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

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               technicianId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Service created
 */


router.post('/services', 
  body('name').isString().withMessage('Name must be a string'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('technicianId').isUUID().withMessage('Technician ID must be a valid UUID'),
  handleInputErrors, 
  createService
    
);


/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Service updated
 */

router.put('/services/:id', 
  body('name').optional().isString().withMessage('Name must be a string'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  handleInputErrors, 
  updateService
    
);


/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service by ID
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
 *         description: Service deleted
 */

router.delete('/services/:id', 
  handleInputErrors, 
  deleteService
    
);

/**
 * Categories
 */


/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retrieve a list of categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of categories
 */
router.get('/categories', 
  getCategories

);


/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */

router.post('/categories', 
  body('name').isString().withMessage('Name must be a string'),
  handleInputErrors,
  createCategory
    
);

/**
 * Ratings
 */


/**
 * @swagger
 * /ratings/technician/{technicianId}:
 *   get:
 *     summary: Retrieve ratings for a specific technician
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Technician ID
 *     responses:
 *       200:
 *         description: List of ratings for the technician
 */
router.get('/ratings/technician/:technicianId', 
  handleInputErrors,
  getRatingsByTechnician
    
);


/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create a new rating
 *     tags: [Ratings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               technicianId:
 *                 type: string
 *                 format: uuid
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Rating created
 */

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

/**
 * @swagger
 * /technicians/{id}/location:
 *   post:
 *     summary: Upsert technician's location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Technician ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated
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


/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Create a new service request
 *     tags: [Service Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *               serviceType:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Service request created
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


/**
 * @swagger
 * /service-requests/{id}/match:
 *   post:
 *     summary: Match service request to closest technician
 *     tags: [Service Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Service request ID
 *     responses:
 *       200:
 *         description: Technician assigned to the service request
 *       404:
 *         description: No technicians available for this service
 */

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

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create an appointment between client and technician
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *               technicianId:
 *                 type: string
 *                 format: uuid
 *               serviceType:
 *                 type: string
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 appointment:
 *                   type: object
 *                 rate:
 *                   type: object
 *                   properties:
 *                     min:
 *                       type: number
 *                     max:
 *                       type: number
 *       404:
 *         description: Rate card not found for the service
 *       500:
 *         description: Error creating appointment
 */

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

/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     summary: Initiate a payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *       500:
 *         description: Failed to initiate payment
 */

// Initiate payment
router.post('/payments/initiate', makePayment);


/**
 * @swagger
 * /payments/callback:
 *   post:
 *     summary: Handle Daraja payment callback
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               callbackData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment callback handled successfully
 *       500:
 *         description: Failed to handle payment callback
 */
// Handle Daraja callback
router.post('/payments/callback', handlePaymentCallback);



export default router;
