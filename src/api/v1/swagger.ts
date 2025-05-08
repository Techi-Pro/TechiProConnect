const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TechiProConnect API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for TechiProConnect, detailing all available endpoints, request/response structures, and authentication requirements.',
      contact: {
        name: 'TechiProConnect Support',
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
        url: 'http://localhost:3000/api/v1',
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
            isVerified: {
              type: 'boolean',
              description: 'Whether the user is verified',
            },
            role: {
              type: 'string',
              description: 'Role of the user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was last updated',
            },
          },
        },
        Technician: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the technician',
            },
            username: {
              type: 'string',
              description: 'Username of the technician',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the technician',
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether the technician is verified',
            },
            role: {
              type: 'string',
              description: 'Role of the technician',
            },
            categoryId: {
              type: 'integer',
              description: 'ID of the category the technician belongs to',
            },
            verificationStatus: {
              type: 'string',
              description: 'Verification status of the technician',
            },
            availabilityStatus: {
              type: 'string',
              description: 'Availability status of the technician',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the technician was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the technician was last updated',
            },
          },
        },
        Service: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the service',
            },
            name: {
              type: 'string',
              description: 'Name of the service',
            },
            price: {
              type: 'number',
              description: 'Price of the service',
            },
            technicianId: {
              type: 'string',
              description: 'ID of the technician offering the service',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the service was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the service was last updated',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string',
                    description: 'Error message',
                  },
                  param: {
                    type: 'string',
                    description: 'Parameter causing the error',
                  },
                },
              },
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the message',
            },
            senderId: {
              type: 'string',
              description: 'ID of the sender',
            },
            receiverId: {
              type: 'string',
              description: 'ID of the receiver',
            },
            content: {
              type: 'string',
              description: 'Content of the message',
            },
            sentAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the message was sent',
            },
            appointmentId: {
              type: 'integer',
              description: 'ID of the associated appointment',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the payment',
            },
            appointmentId: {
              type: 'integer',
              description: 'ID of the associated appointment',
            },
            transactionId: {
              type: 'string',
              description: 'Transaction ID of the payment',
            },
            amount: {
              type: 'number',
              description: 'Amount of the payment',
            },
            status: {
              type: 'string',
              description: 'Status of the payment',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the payment was created',
            },
          },
        },
        DeviceToken: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the device token',
            },
            userId: {
              type: 'string',
              description: 'ID of the user associated with the token',
            },
            token: {
              type: 'string',
              description: 'Device token for push notifications',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the token was created',
            },
          },
        },
        NotificationRequest: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Device token for the notification',
            },
            title: {
              type: 'string',
              description: 'Title of the notification',
            },
            body: {
              type: 'string',
              description: 'Body of the notification',
            },
            data: {
              type: 'object',
              description: 'Additional data for the notification',
            },
          },
        },
        PaginatedUserResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
              description: 'List of users',
            },
            total: {
              type: 'integer',
              description: 'Total number of users',
            },
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            pageSize: {
              type: 'integer',
              description: 'Number of items per page',
            },
          },
        },
        PaginatedTechnicianResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Technician',
              },
              description: 'List of technicians',
            },
            total: {
              type: 'integer',
              description: 'Total number of technicians',
            },
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            pageSize: {
              type: 'integer',
              description: 'Number of items per page',
            },
          },
        },
        PaginatedServiceResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Service',
              },
              description: 'List of services',
            },
            total: {
              type: 'integer',
              description: 'Total number of services',
            },
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            pageSize: {
              type: 'integer',
              description: 'Number of items per page',
            },
          },
        },
        PaginatedMessageResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Message',
              },
              description: 'List of messages',
            },
            total: {
              type: 'integer',
              description: 'Total number of messages',
            },
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            pageSize: {
              type: 'integer',
              description: 'Number of items per page',
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
      { name: 'Users', description: 'Operations related to user management' },
      { name: 'Technicians', description: 'Operations related to technician management' },
      { name: 'Services', description: 'Operations related to services' },
      { name: 'Categories', description: 'Operations related to categories' },
      { name: 'Ratings', description: 'Operations related to ratings' },
      { name: 'Payments', description: 'Operations related to payments' },
      { name: 'Locations', description: 'Operations related to locations' },
      { name: 'Appointments', description: 'Operations related to appointments' },
      { name: 'ForgotPassword', description: 'Operations related to password reset' },
      { name: 'Messages', description: 'Operations related to chat messages' },
      { name: 'Notifications', description: 'Operations related to push notifications' },
      { name: 'Auth', description: 'Authentication and authorization endpoints' },
    ],
    paths: {
      '/users': {
        post: {
          summary: 'Create a new user',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'User created' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
        get: {
          summary: 'Get paginated list of users',
          tags: ['Users'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer' },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer' },
              description: 'Page size',
            },
          ],
          responses: {
            '200': {
              description: 'Paginated users',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedUserResponse' },
                },
              },
            },
          },
        },
      },
      '/technicians': {
        post: {
          summary: 'Create a new technician',
          tags: ['Technicians'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    categoryId: { type: 'integer' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Technician created' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
        get: {
          summary: 'Get paginated list of technicians',
          tags: ['Technicians'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer' },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer' },
              description: 'Page size',
            },
          ],
          responses: {
            '200': {
              description: 'Paginated technicians',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedTechnicianResponse' },
                },
              },
            },
          },
        },
      },
      '/services': {
        post: {
          summary: 'Create a new service',
          tags: ['Services'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    price: { type: 'number' },
                    technicianId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Service created' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
        get: {
          summary: 'Get paginated list of services',
          tags: ['Services'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer' },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer' },
              description: 'Page size',
            },
          ],
          responses: {
            '200': {
              description: 'Paginated services',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedServiceResponse' },
                },
              },
            },
          },
        },
      },
      '/categories': {
        post: {
          summary: 'Create a new category',
          tags: ['Categories'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Category created' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
      },
      '/ratings': {
        post: {
          summary: 'Create a new rating',
          tags: ['Ratings'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    score: { type: 'integer' },
                    comment: { type: 'string' },
                    technicianId: { type: 'string' },
                    userId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Rating created' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
      },
      '/payments': {
        post: {
          summary: 'Make a payment',
          tags: ['Payments'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    appointmentId: { type: 'string' },
                    amount: { type: 'number' },
                    phoneNumber: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Payment initiated' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
      },
      '/locations': {
        post: {
          summary: 'Upsert a location',
          tags: ['Locations'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    address: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Location upserted' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
      },
      '/appointments': {
        post: {
          summary: 'Create an appointment',
          tags: ['Appointments'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    clientId: { type: 'string' },
                    technicianId: { type: 'string' },
                    serviceType: { type: 'string' },
                    appointmentDate: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Appointment created' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
      },
      '/forgot-password': {
        post: {
          summary: 'Request password reset',
          tags: ['ForgotPassword'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Password reset email sent' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
      },
      '/reset-password': {
        post: {
          summary: 'Reset password',
          tags: ['ForgotPassword'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    newPassword: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Password reset successfully' },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
          },
        },
      },
      '/messages/appointment/{appointmentId}': {
        get: {
          summary: 'Get paginated chat messages for an appointment',
          tags: ['Messages'],
          parameters: [
            {
              in: 'path',
              name: 'appointmentId',
              required: true,
              schema: { type: 'integer' },
            },
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer' },
              description: 'Page number',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer' },
              description: 'Page size',
            },
          ],
          responses: {
            '200': {
              description: 'Paginated messages',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedMessageResponse' },
                },
              },
            },
            '403': { description: 'Forbidden' },
          },
        },
      },
      '/payments/daraja': {
        post: {
          summary: 'Simulate Daraja payment',
          tags: ['Payments'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    appointmentId: { type: 'integer' },
                    amount: { type: 'number' },
                    phoneNumber: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Payment successful (simulated)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Payment' },
                },
              },
            },
            '400': {
              description: 'Validation error',
            },
          },
        },
      },
      '/notifications/register': {
        post: {
          summary: 'Register device token for push notifications',
          tags: ['Notifications'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Device token registered' },
          },
        },
      },
      '/notifications/send': {
        post: {
          summary: 'Send push notification (ADMIN only)',
          tags: ['Notifications'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Notification sent' },
          },
        },
      },
    },
  },
  apis: [], // Explicit paths defined, no reliance on code annotations
};

module.exports = swaggerJsdoc(options);