const prisma = require('../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../lib/auth')

export default async function handler(req, res) {
  try {
    // Verify token from cookie or Authorization header
    const token = getTokenFromReq(req)
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    
    // Verify role
    if (decoded.role !== 'patient') {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          dateOfBirth: true,
          gender: true,
          profileImage: true,
          role: true
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json(user)
    }

    if (req.method === 'PATCH') {
      const { name, phone, address, dateOfBirth, gender, profileImage } = req.body

      if (!name) {
        return res.status(400).json({ error: 'Name is required' })
      }

      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          name,
          phone: phone || null,
          address: address || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          profileImage: profileImage || null
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          dateOfBirth: true,
          gender: true,
          profileImage: true,
          role: true
        }
      })

      return res.status(200).json(updatedUser)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error in patient profile:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
