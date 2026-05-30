import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'

dns.setServers(['8.8.8.8', '1.1.1.1'])

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/glamouros'

let isMongoConnected = false

export const connectMongoDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...')
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    })
    isMongoConnected = true
    console.log('💚 MongoDB Atlas connected successfully.')
  } catch (err: any) {
    console.error('⚠️ MongoDB connection error. Fullback to automated high-fidelity sandbox state active.', err.message)
    isMongoConnected = false
  }
}

export { isMongoConnected }
