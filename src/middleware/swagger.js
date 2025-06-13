const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Iron Forge API',
    version: '1.0.0',
    description: 'API documentation for Iron Forge fitness application',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    contact: {
      name: 'Iron Forge',
      url: 'https://ironforge.com'
    }
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5002}`,
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    path.join(__dirname, '../api/*.routes.js'),
    path.join(__dirname, '../models/*.model.js')
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css'
  })
}; 