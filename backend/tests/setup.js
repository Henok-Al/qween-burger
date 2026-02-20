const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB for testing
const connectTestDB = async () => {
  try {
    // Always disconnect first to ensure we're not reusing connections
    if (mongoose.connection.readyState !== 0) {
      console.log('⚠️ Disconnecting existing connection');
      await mongoose.disconnect();
      // Wait for disconnection
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Use local MongoDB for testing
    const testDBUrl = 'mongodb://localhost:27017/qween-burger-test';
    
    await mongoose.connect(testDBUrl);
    console.log('✅ Test database connected successfully');
    
    // Clear database
    await clearDatabase();
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    process.exit(1);
  }
};

// Disconnect from MongoDB
const disconnectTestDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Test database disconnected successfully');
  } catch (error) {
    console.error('❌ Test database disconnection failed:', error);
  }
};

// Clear all collections
const clearDatabase = async () => {
  try {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany();
    }
    console.log('✅ Test database cleared');
  } catch (error) {
    console.error('❌ Failed to clear test database:', error);
  }
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearDatabase,
};
