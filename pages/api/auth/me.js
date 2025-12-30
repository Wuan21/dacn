// pages/api/auth/me.js - Get current user from NextAuth session
import { getServerSession } from 'next-auth/next'
import { authOptions } from './[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Return user from session
  res.json(session.user)
}

