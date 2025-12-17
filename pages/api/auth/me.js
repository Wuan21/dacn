const { getTokenFromReq, verifyToken } = require('../../../lib/auth')
const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  try {
    const decoded = verifyToken(token)
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, profileImage: true }
    })
    
    if (!user) return res.status(404).json({ error: 'User not found' })
    
    res.json(user)
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
