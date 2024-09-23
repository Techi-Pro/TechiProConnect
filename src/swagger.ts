const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TechEasyServe API',
      version: '1.0.0',
      description: 'API documentation for TechEasyServe',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Your API base URL
      },
    ],
  },
  apis: ['./controllers/*.js'], // Path to the API routes (adjust the path if necessary)
};

const specs = swaggerJsdoc(options);
module.exports = specs;
