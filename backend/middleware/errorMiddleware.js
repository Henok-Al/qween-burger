/**
 * Global Error Handling Middleware
 * Catches all errors and sends consistent JSON responses
 * 
 * Why this file exists:
 * - Centralizes error handling in one place
 * - Provides consistent error response format
 * - Handles different types of errors (validation, JWT, cast errors)
 * - Differentiates between development and production error details
 */

const ErrorHandler = require('../utils/errorHandler');

/**
 * Error Middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const errorMiddleware = (err, req, res, next) => {
  // Default values from error
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error for debugging
  console.error(`🔥 Error: ${err.message}`);
  console.error(`📍 Stack: ${err.stack}`);

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: ${field}. Please use another value.`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = `Validation Error: ${messages.join(', ')}`;
    err = new ErrorHandler(message, 400);
  }

  // JWT Error - Invalid token
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    err = new ErrorHandler(message, 401);
  }

  // JWT Error - Token expired
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    err = new ErrorHandler(message, 401);
  }

  // Send error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
