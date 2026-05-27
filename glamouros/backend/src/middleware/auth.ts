import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'glamouros_super_secret_jwt_key_2026'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    phone: string
    role: 'customer' | 'admin' | string
    name: string
  }
}

// Manual cookie parser helper for httpOnly token resolution
const parseCookies = (cookieHeader: string | undefined): Record<string, string> => {
  const list: Record<string, string> = {}
  if (!cookieHeader) return list
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=')
    const key = parts.shift()?.trim()
    if (key) {
      list[key] = decodeURIComponent(parts.join('='))
    }
  })
  return list
}

// Verify standard JWT token (Checking both Bearer header and httpOnly cookie)
export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  let token = authHeader && authHeader.split(' ')[1]

  // If no bearer token, try to read the token from cookies
  if (!token && req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie)
    token = cookies['token']
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access Denied: No Authentication Token Provided' })
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user']
    req.user = verified
    next()
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or Expired Security Token' })
  }
}

// Role restriction builder middleware
export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication Required' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Unauthorized access: Role [${req.user.role}] does not possess required access permissions.`
      })
    }
    next()
  }
}
