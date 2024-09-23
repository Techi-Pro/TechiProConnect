const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TechEasyServe API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for TechEasyServe, detailing all available endpoints, request/response structures, and authentication requirements.',
      contact: {
        name: 'TechEasyServe Support',
        email: 'support@techeasyserve.com',
        url: 'https://techeasyserve.com',
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://techiproconnect.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication using the Bearer scheme.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the user',
            },
            username: {
              type: 'string',
              description: 'Username of the user',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was created',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'User',
        description: 'Operations related to user management',
      },
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
    ],
  },
  apis: ['./src/router.ts', './controllers/userController.ts'], // Updated path to your API routes file
};

module.exports = swaggerJsdoc(options);
