/**
 * Custom Error Handler Class
 * Extends the native Error class to include HTTP status codes
 * 
 * Why this file exists:
 * - Provides consistent error handling across the application
 * - Allows passing HTTP status codes with errors
 * - Makes it easy to differentiate between operational and programming errors
 */

class ErrorHandler extends Error {
  /**
   * Create a custom error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Capture stack trace (excludes constructor call from it)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
