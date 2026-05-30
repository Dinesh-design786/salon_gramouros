import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI

const seedUsers = async () => {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables.')
    process.exit(1)
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas for seeding...')
    await mongoose.connect(MONGODB_URI)
    console.log('💚 Connected to MongoDB.')

    // 1. Seed Admin User
    const adminEmail = 'admin@glamouros.com'
    const adminExists = await User.findOne({ email: adminEmail })
    if (!adminExists) {
      console.log('👤 Creating demo Admin account...')
      const newAdmin = new User({
        name: 'Suhail Rao (Admin)',
        email: adminEmail,
        phone: '9888877777',
        password: 'admin123',
        role: 'admin'
      })
      await newAdmin.save()
      console.log('✅ Demo Admin user created (email: admin@glamouros.com, pass: admin123)')
    } else {
      console.log('ℹ️ Demo Admin user already exists.')
    }

    // 2. Seed Customer User (Virat)
    const customerViratEmail = 'virat@kohli.com'
    const viratExists = await User.findOne({ email: customerViratEmail })
    if (!viratExists) {
      console.log('👤 Creating demo Customer account (Virat)...')
      const newVirat = new User({
        name: 'Virat Kohli (Platinum)',
        email: customerViratEmail,
        phone: '9876543210',
        password: 'password123',
        role: 'customer'
      })
      await newVirat.save()
      console.log('✅ Demo Customer Virat created (phone: 9876543210, pass: password123)')
    } else {
      console.log('ℹ️ Demo Customer Virat already exists.')
    }

    // 3. Seed Customer User (Deepika)
    const customerDeepikaEmail = 'deepika@padukone.com'
    const deepikaExists = await User.findOne({ email: customerDeepikaEmail })
    if (!deepikaExists) {
      console.log('👤 Creating demo Customer account (Deepika)...')
      const newDeepika = new User({
        name: 'Deepika Padukone (Gold)',
        email: customerDeepikaEmail,
        phone: '9123456789',
        password: 'password123',
        role: 'customer'
      })
      await newDeepika.save()
      console.log('✅ Demo Customer Deepika created (phone: 9123456789, pass: password123)')
    } else {
      console.log('ℹ️ Demo Customer Deepika already exists.')
    }

    console.log('🎉 MongoDB Atlas Seeding process completed successfully.')
    mongoose.connection.close()
    process.exit(0)
  } catch (err: any) {
    console.error('❌ Seeding failed with error:', err.message)
    process.exit(1)
  }
}

seedUsers()
