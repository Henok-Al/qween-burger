const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Qween Burger API Documentation',
    version: '1.0.0',
    description: 'API documentation for Qween Burger restaurant management system',
    contact: {
      name: 'Qween Burger Team',
      email: 'contact@qweenburger.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoint',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            description: 'User name',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            default: 'user',
            description: 'User role',
          },
          isVerified: {
            type: 'boolean',
            default: false,
            description: 'Email verification status',
          },
        },
      },
      Product: {
        type: 'object',
        required: ['name', 'price', 'category', 'image'],
        properties: {
          name: {
            type: 'string',
            description: 'Product name',
          },
          description: {
            type: 'string',
            description: 'Product description',
          },
          price: {
            type: 'number',
            description: 'Product price',
          },
          category: {
            type: 'string',
            description: 'Product category',
          },
          image: {
            type: 'string',
            description: 'Product image URL',
          },
          isAvailable: {
            type: 'boolean',
            default: true,
            description: 'Product availability status',
          },
          rating: {
            type: 'number',
            default: 0,
            description: 'Product rating (0-5)',
          },
          reviews: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Review',
            },
            description: 'Product reviews',
          },
        },
      },
      Category: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description: 'Category name',
          },
          description: {
            type: 'string',
            description: 'Category description',
          },
          isActive: {
            type: 'boolean',
            default: true,
            description: 'Category active status',
          },
        },
      },
      Order: {
        type: 'object',
        required: ['userId', 'items', 'totalAmount', 'deliveryAddress'],
        properties: {
          userId: {
            type: 'string',
            description: 'User ID',
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/OrderItem',
            },
            description: 'Order items',
          },
          totalAmount: {
            type: 'number',
            description: 'Total order amount',
          },
          deliveryAddress: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
            description: 'Delivery address',
          },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
            description: 'Order status',
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
            description: 'Payment status',
          },
          paymentMethod: {
            type: 'string',
            description: 'Payment method',
          },
        },
      },
      OrderItem: {
        type: 'object',
        required: ['productId', 'name', 'price', 'quantity'],
        properties: {
          productId: {
            type: 'string',
            description: 'Product ID',
          },
          name: {
            type: 'string',
            description: 'Product name',
          },
          price: {
            type: 'number',
            description: 'Product price',
          },
          quantity: {
            type: 'number',
            description: 'Product quantity',
          },
          image: {
            type: 'string',
            description: 'Product image URL',
          },
        },
      },
      Review: {
        type: 'object',
        required: ['userId', 'rating', 'comment'],
        properties: {
          userId: {
            type: 'string',
            description: 'User ID',
          },
          userName: {
            type: 'string',
            description: 'User name',
          },
          rating: {
            type: 'number',
            minimum: 1,
            maximum: 5,
            description: 'Review rating (1-5)',
          },
          comment: {
            type: 'string',
            description: 'Review comment',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Review creation date',
          },
        },
      },
    },
  },
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: [
    './routes/authRoutes.js',
    './routes/productRoutes.js',
    './routes/orderRoutes.js',
    './routes/adminRoutes.js',
    './routes/paymentRoutes.js',
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Create Swagger UI middleware
const swaggerDocs = swaggerUi.serve, swaggerUI = swaggerUi.setup(swaggerSpec);

module.exports = { swaggerDocs, swaggerUI };
