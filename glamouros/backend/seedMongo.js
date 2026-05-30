const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Define User Schema inline for standalone execution
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const seedUsers = async () => {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in backend/.env configuration file.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('💚 Connected successfully to MongoDB Atlas.');

    // 1. Seed Admin User
    const adminEmail = 'admin@glamouros.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log('👤 Creating demo Admin account...');
      const newAdmin = new User({
        name: 'Suhail Rao (Admin)',
        email: adminEmail,
        phone: '9888877777',
        password: 'admin123',
        role: 'admin'
      });
      await newAdmin.save();
      console.log('✅ Demo Admin user created (email: admin@glamouros.com, pass: admin123)');
    } else {
      console.log('ℹ️ Demo Admin user already exists.');
    }

    // 2. Seed Customer User (Virat)
    const customerViratEmail = 'virat@kohli.com';
    const viratExists = await User.findOne({ email: customerViratEmail });
    if (!viratExists) {
      console.log('👤 Creating demo Customer account (Virat)...');
      const newVirat = new User({
        name: 'Virat Kohli (Platinum)',
        email: customerViratEmail,
        phone: '9876543210',
        password: 'password123',
        role: 'customer'
      });
      await newVirat.save();
      console.log('✅ Demo Customer Virat created (phone: 9876543210, pass: password123)');
    } else {
      console.log('ℹ️ Demo Customer Virat already exists.');
    }

    // 3. Seed Customer User (Deepika)
    const customerDeepikaEmail = 'deepika@padukone.com';
    const deepikaExists = await User.findOne({ email: customerDeepikaEmail });
    if (!deepikaExists) {
      console.log('👤 Creating demo Customer account (Deepika)...');
      const newDeepika = new User({
        name: 'Deepika Padukone (Gold)',
        email: customerDeepikaEmail,
        phone: '9123456789',
        password: 'password123',
        role: 'customer'
      });
      await newDeepika.save();
      console.log('✅ Demo Customer Deepika created (phone: 9123456789, pass: password123)');
    } else {
      console.log('ℹ️ Demo Customer Deepika already exists.');
    }

    console.log('🎉 MongoDB Atlas Seeding process completed successfully.');
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err.message);
    process.exit(1);
  }
};

seedUsers();
