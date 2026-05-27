import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/User'
import { isMongoConnected } from '../config/mongodb'
import { emitLiveEvent } from '../sockets/liveSocket'

const JWT_SECRET = process.env.JWT_SECRET || 'glamouros_super_secret_jwt_key_2026'

// High-Fidelity In-Memory Fallback Store in case MongoDB Atlas is offline or loading
interface MockUser {
  id: string
  name: string
  email: string
  phone: string
  passwordHash: string
  role: 'customer' | 'admin'
  created_at: Date
}

const mockUsers: MockUser[] = [
  {
    id: 'usr_mock_admin_1',
    name: 'Suhail Rao (Admin)',
    email: 'admin@glamouros.com',
    phone: '9888877777',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    created_at: new Date()
  },
  {
    id: 'usr_mock_customer_1',
    name: 'Virat Kohli (Platinum)',
    email: 'virat@kohli.com',
    phone: '9876543210',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'customer',
    created_at: new Date()
  }
]

// Generate JWT token helper
const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// 1. CUSTOMER REGISTRATION
export const register = async (req: Request, res: Response) => {
  const { name, email, phone, password, confirmPassword } = req.body

  // Validation
  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ success: false, error: 'All fields are required.' })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' })
  }

  try {
    const formattedEmail = email.trim().toLowerCase()
    const formattedPhone = phone.trim().replace(/\s+/g, '')

    // Check if Mongoose is connected
    if (isMongoConnected) {
      // Check existing user
      const existingUser = await User.findOne({
        $or: [{ email: formattedEmail }, { phone: formattedPhone }]
      })

      if (existingUser) {
        const errorField = existingUser.email === formattedEmail ? 'Email' : 'Phone number'
        return res.status(400).json({ success: false, error: `${errorField} is already registered.` })
      }

      // Create new user in MongoDB
      const newUser = new User({
        name,
        email: formattedEmail,
        phone: formattedPhone,
        password,
        role: 'customer'
      })

      await newUser.save()
      const userJSON = newUser.toJSON()
      const token = generateToken(userJSON)

      // Set httpOnly Cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      })

      // Broadcast event to sockets
      emitLiveEvent('auth:success', {
        name: userJSON.name,
        phone: userJSON.phone,
        role: userJSON.role,
        timestamp: new Date().toLocaleTimeString()
      })

      return res.status(201).json({
        success: true,
        message: 'Successfully registered to GlamourOS Database.',
        token,
        user: userJSON
      })
    } else {
      // Sandbox fallback mode
      const duplicate = mockUsers.find(
        u => u.email === formattedEmail || u.phone === formattedPhone
      )
      if (duplicate) {
        return res.status(400).json({ success: false, error: 'Email or Phone is already registered.' })
      }

      const mockId = 'usr_' + Math.random().toString(36).substring(2, 9)
      const newUser: MockUser = {
        id: mockId,
        name,
        email: formattedEmail,
        phone: formattedPhone,
        passwordHash: await bcrypt.hash(password, 10),
        role: 'customer',
        created_at: new Date()
      }

      mockUsers.push(newUser)

      const safeUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        created_at: newUser.created_at
      }

      const token = generateToken(safeUser)

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      })

      emitLiveEvent('auth:success', {
        name: safeUser.name,
        phone: safeUser.phone,
        role: safeUser.role,
        timestamp: new Date().toLocaleTimeString()
      })

      return res.status(201).json({
        success: true,
        message: 'Successfully registered (Sandbox Fallback Mode).',
        token,
        user: safeUser
      })
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Registration failed: ' + err.message })
  }
}

// 2. CUSTOMER LOGIN (Email OR Phone + Password)
export const login = async (req: Request, res: Response) => {
  const { emailOrPhone, password } = req.body

  if (!emailOrPhone || !password) {
    return res.status(400).json({ success: false, error: 'Email/Phone and Password are required.' })
  }

  try {
    const searchVal = emailOrPhone.trim().toLowerCase()

    if (isMongoConnected) {
      // Query by email or phone
      const user = await User.findOne({
        $or: [{ email: searchVal }, { phone: searchVal }]
      })

      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid login credentials. User not found.' })
      }

      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid login credentials. Incorrect password.' })
      }

      const userJSON = user.toJSON()
      const token = generateToken(userJSON)

      // Cookie injection
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      })

      emitLiveEvent('auth:success', {
        name: userJSON.name,
        phone: userJSON.phone,
        role: userJSON.role,
        timestamp: new Date().toLocaleTimeString()
      })

      return res.status(200).json({
        success: true,
        message: `Authenticated successfully as ${userJSON.role}.`,
        token,
        user: userJSON
      })
    } else {
      // Sandbox fallback search
      const user = mockUsers.find(
        u => u.email === searchVal || u.phone === searchVal
      )

      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials (Sandbox Mode).' })
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash)
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Incorrect password (Sandbox Mode).' })
      }

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      }

      const token = generateToken(safeUser)

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      })

      emitLiveEvent('auth:success', {
        name: safeUser.name,
        phone: safeUser.phone,
        role: safeUser.role,
        timestamp: new Date().toLocaleTimeString()
      })

      return res.status(200).json({
        success: true,
        message: 'Authenticated successfully (Sandbox Fallback Mode).',
        token,
        user: safeUser
      })
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Login engine error: ' + err.message })
  }
}

// 3. ADMIN LOGIN (Email + Password only)
export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and Password are required.' })
  }

  try {
    const searchEmail = email.trim().toLowerCase()

    if (isMongoConnected) {
      const user = await User.findOne({ email: searchEmail })

      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Admin user not found.' })
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access Denied: Admins only.' })
      }

      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials. Password mismatch.' })
      }

      const userJSON = user.toJSON()
      const token = generateToken(userJSON)

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      })

      emitLiveEvent('auth:success', {
        name: userJSON.name,
        phone: userJSON.phone,
        role: 'admin',
        timestamp: new Date().toLocaleTimeString()
      })

      return res.status(200).json({
        success: true,
        message: 'Welcome Back, Admin.',
        token,
        user: userJSON
      })
    } else {
      // Sandbox fallback search
      const user = mockUsers.find(
        u => u.email === searchEmail
      )

      if (!user) {
        return res.status(401).json({ success: false, error: 'Admin email not found (Sandbox).' })
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access Denied: Customer cannot login here.' })
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash)
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Password incorrect (Sandbox).' })
      }

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      }

      const token = generateToken(safeUser)

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      })

      emitLiveEvent('auth:success', {
        name: safeUser.name,
        phone: safeUser.phone,
        role: safeUser.role,
        timestamp: new Date().toLocaleTimeString()
      })

      return res.status(200).json({
        success: true,
        message: 'Admin Authenticated successfully (Sandbox Fallback Mode).',
        token,
        user: safeUser
      })
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Admin Authentication Error: ' + err.message })
  }
}

// 4. GET CURRENT USER PROFILE (/api/auth/me)
export const me = async (req: any, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Session details missing.' })
  }

  try {
    if (isMongoConnected) {
      const user = await User.findById(req.user.id)
      if (!user) {
        return res.status(404).json({ success: false, error: 'User does not exist in Active Database.' })
      }
      return res.status(200).json({ success: true, user: user.toJSON() })
    } else {
      const user = mockUsers.find(u => u.id === req.user.id)
      if (!user) {
        // Fallback if not found: create mock safe object from token info
        return res.status(200).json({
          success: true,
          user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,
            created_at: new Date()
          }
        })
      }
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          created_at: user.created_at
        }
      })
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Profile retrieve failed: ' + err.message })
  }
}

// 5. USER LOGOUT (/api/auth/logout)
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token')
  return res.status(200).json({
    success: true,
    message: 'User session successfully terminated and tokens expunged.'
  })
}

// STUB REMOVED: requestOtp and verifyOtp functions are now fully decommissioned.
