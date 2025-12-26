const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookie = require('cookie')

// IMPORTANT: Set JWT_SECRET in .env file for production
// Never use the default value in production!
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ CRITICAL: JWT_SECRET must be set in production! Set JWT_SECRET in .env file')
  throw new Error('JWT_SECRET environment variable is required in production')
}

function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

function setTokenCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production'
  const serialized = cookie.serialize('token', token, {
    httpOnly: true,
    secure: isProduction, // true cho HTTPS trên Render
    sameSite: isProduction ? 'none' : 'lax', // 'none' nếu có cross-site requests
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
  res.setHeader('Set-Cookie', serialized)
}

function getTokenFromReq(req) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) return header.split(' ')[1]
  const cookies = req.headers.cookie
  if (!cookies) return null
  const parsed = cookie.parse(cookies || '')
  return parsed.token
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  setTokenCookie,
  getTokenFromReq
}
