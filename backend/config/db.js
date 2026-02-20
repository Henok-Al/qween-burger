/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 * 
 * Why this file exists:
 * - Centralizes database connection logic
 * - Makes it easy to manage connection settings
 * - Provides clear error messages for connection issues
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database
 * Uses the MONGODB_URI from environment variables
 * 
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Use local MongoDB for testing
    const dbUri = process.env.NODE_ENV === 'test' 
      ? 'mongodb://localhost:27017/qween-burger-test' 
      : process.env.MONGODB_URI;
    
    const conn = await mongoose.connect(dbUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown on app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔴 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
