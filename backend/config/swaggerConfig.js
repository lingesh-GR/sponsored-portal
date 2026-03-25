const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sponsored Program Portal API',
            version: '1.0.0',
            description: 'API documentation for the Sponsored Program Portal — empowering students with government schemes, internships, and events.',
            contact: {
                name: 'Admin'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
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
    },
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
