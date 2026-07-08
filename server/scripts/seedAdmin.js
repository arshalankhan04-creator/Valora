const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/valora';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required in .env.');
      await mongoose.connection.close();
      process.exit(1);
    }

    const emailLower = adminEmail.toLowerCase();
    let user = await User.findOne({ email: emailLower });

    if (user) {
      console.log(`User with email "${adminEmail}" already exists. Updating role to "admin"...`);
      user.role = 'admin';
      user.password = adminPassword; // Pre-save hook will auto-hash this since it changes
      await user.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log(`Creating new admin user with email "${adminEmail}"...`);
      user = new User({
        name: 'System Admin',
        email: emailLower,
        password: adminPassword,
        role: 'admin'
      });
      await user.save();
      console.log('Admin user created successfully.');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
};

seedAdmin();
