import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import apiRouter from './routes/api'
import whatsappRouter from './routes/whatsapp'
import { initSocket } from './sockets/liveSocket'
import { connectMongoDB } from './config/mongodb'

// Load Environment variables
dotenv.config()

// Connect to MongoDB Atlas
connectMongoDB()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// 1. MIDDLEWARE PIPELINES
app.use(helmet({
  contentSecurityPolicy: false // Allow dynamic scripts mapping during presentations
}))
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 2. ROUTING TREE
app.use('/api/v1', apiRouter)
app.use('/api/v1', whatsappRouter)

// Base Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Healthy',
    platform: 'GlamourOS AI Multi-Branch Engine',
    timestamp: new Date().toISOString()
  })
})

// 3. INITIALIZE REAL-TIME CONNECTIONS
initSocket(server)

// 4. BOOTSTRAP LISTENER
server.listen(PORT, () => {
  console.log(`====================================================`)
  console.log(`🌟 GLAMOUROS SAAS SERVER BOOTED SUCCESSFULLY`)
  console.log(`🚀 REST APIs: http://localhost:${PORT}/api/v1`)
  console.log(`🔌 WebSockets: Enabled on port ${PORT}`)
  console.log(`⌚ Timezone: Asia/Kolkata (Standard Indian Chains)`)
  console.log(`====================================================`)
})
