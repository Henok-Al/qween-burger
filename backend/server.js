/**
 * Main Server Entry Point
 * Sets up Express server with middleware, routes, and database connection
 * 
 * Why this file exists:
 * - Single entry point for the application
 * - Configures all middleware in one place
 * - Connects to database before starting server
 * - Sets up CORS for frontend communication
 */

// Load environment variables FIRST before any other imports
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const { setIO } = require('./utils/socket');

// Initialize Express app
const app = express();

// ====================
// DATABASE CONNECTION
// ====================
connectDB();

// ====================
// SECURITY MIDDLEWARE
// ====================

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS - allows frontend to communicate with backend
app.use(
  cors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000', 
      'http://localhost:3002', 
      'https://qween-burger.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true, // Allow cookies/authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Compression middleware - reduce response size
app.use(compression());

// Parse JSON request bodies
app.use(express.json({ limit: '10kb' })); // Limit body size

// Parse URL-encoded request bodies (for form data)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// ====================
// ROUTES
// ====================

// Health check route - useful for testing if server is running
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🍔 Qween Burger API is running!',
    timestamp: new Date().toISOString(),
  });
});

// Swagger documentation
const { swaggerDocs, swaggerUI } = require('./config/swagger');
app.use('/api/docs', swaggerDocs, swaggerUI);

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// 404 handler - for routes that don't exist
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ====================
// ERROR HANDLING
// ====================

// Global error middleware - must be last middleware
app.use(errorMiddleware);

// ====================
// START SERVER
// ====================

// Only start server if not in test mode
let server;
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;

  server = app.listen(PORT, () => {
    console.log(`
    🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
    🌐 Listening on port ${PORT}
    🔗 http://localhost:${PORT}
    📚 API Health: http://localhost:${PORT}/api/health
    `);
  });
} else {
  // For testing purposes, we need to create a server instance
  server = app.listen(0);
}

// Initialize Socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000', 
      'http://localhost:3002', 
      'https://qween-burger.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  },
});

// Set the io instance in the socket utility
setIO(io);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room based on user ID
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  // Leave a room
  socket.on('leaveRoom', (userId) => {
    socket.leave(userId);
    console.log(`User ${userId} left room ${userId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Export app for testing purposes
module.exports = app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});
