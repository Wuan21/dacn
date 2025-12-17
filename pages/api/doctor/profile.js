const prisma = require('../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../lib/auth')

export default async function handler(req, res) {
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  let decoded
  try { 
    decoded = verifyToken(token) 
  } catch { 
    return res.status(401).json({ error: 'Invalid token' }) 
  }

  if (decoded.role !== 'doctor') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        doctorProfile: {
          include: {
            specialty: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      doctorProfile: user.doctorProfile
    })
  }

  if (req.method === 'PATCH') {
    const { name, bio, specialtyId, degree, experience, fees, address1, address2, profileImage } = req.body

    try {
      // Update user name if provided
      if (name) {
        await prisma.user.update({
          where: { id: decoded.id },
          data: { name }
        })
      }

      // Update doctor profile
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { doctorProfile: true }
      })

      if (!user.doctorProfile) {
        return res.status(400).json({ error: 'Doctor profile not found' })
      }

      const updateData = {}
      if (bio !== undefined) updateData.bio = bio
      if (specialtyId) updateData.specialtyId = specialtyId
      if (degree !== undefined) updateData.degree = degree
      if (experience !== undefined) updateData.experience = experience
      if (fees !== undefined) updateData.fees = fees
      if (address1 !== undefined) updateData.address1 = address1
      if (address2 !== undefined) updateData.address2 = address2
      if (profileImage !== undefined) updateData.profileImage = profileImage

      await prisma.doctorProfile.update({
        where: { id: user.doctorProfile.id },
        data: updateData
      })

      return res.json({ success: true })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to update profile' })
    }
  }

  res.status(405).end()
}
