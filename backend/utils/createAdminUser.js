const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: './.env' });

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@qween-burger.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists - updating password...');
      // Update existing admin user with correct password (let the model handle hashing)
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('✅ Admin user password updated successfully');
      console.log('Email: admin@qween-burger.com');
      console.log('Password: admin123');
    } else {
      // Create new admin user (let the model handle password hashing)
      const admin = new User({
        name: 'Admin User',
        email: 'admin@qween-burger.com',
        password: 'admin123', // Don't hash manually - model will handle it
        role: 'admin',
        address: '123 Admin St, Admin City',
        phone: '1234567890',
      });

      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log('Email: admin@qween-burger.com');
      console.log('Password: admin123');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
}

createAdminUser();
