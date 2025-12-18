const { getTokenFromReq, verifyToken } = require('../../../lib/auth')
const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  try {
    const decoded = verifyToken(token)
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, profileImage: true, isActive: true }
    })
    
    if (!user) return res.status(404).json({ error: 'User not found' })
    if (!user.isActive) return res.status(403).json({ error: 'Account locked' })
    
    res.json(user)
  } catch (err) {
    console.error('Auth me error:', err)
    res.status(401).json({ error: 'Invalid token' })
  }
}
