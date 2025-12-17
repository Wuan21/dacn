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

  if (decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Create doctor profile
  if (req.method === 'POST') {
    const { userId, specialtyId, bio, yearsOfExperience } = req.body
    
    if (!userId || !specialtyId) {
      return res.status(400).json({ error: 'userId and specialtyId required' })
    }

    try {
      // Check if user exists and is a doctor
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return res.status(400).json({ error: 'User not found' })
      }

      if (user.role !== 'doctor') {
        return res.status(400).json({ error: 'User must have doctor role first' })
      }

      // Check if doctor profile already exists
      const existingProfile = await prisma.doctorProfile.findUnique({
        where: { userId }
      })

      if (existingProfile) {
        return res.status(400).json({ error: 'Doctor profile already exists' })
      }

      // Check if specialty exists
      const specialty = await prisma.specialty.findUnique({
        where: { id: specialtyId }
      })

      if (!specialty) {
        return res.status(400).json({ error: 'Specialty not found' })
      }

      const profile = await prisma.doctorProfile.create({
        data: {
          userId,
          specialtyId,
          bio: bio || '',
          yearsOfExperience: yearsOfExperience || 0
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          specialty: {
            select: { id: true, name: true }
          }
        }
      })

      return res.json(profile)
    } catch (err) {
      console.error(err)
      return res.status(400).json({ error: 'Failed to create doctor profile' })
    }
  }

  // Update doctor profile
  if (req.method === 'PATCH') {
    const { doctorProfileId, specialtyId, bio, yearsOfExperience } = req.body
    
    if (!doctorProfileId) {
      return res.status(400).json({ error: 'doctorProfileId required' })
    }

    try {
      const updateData = {}
      if (specialtyId !== undefined) updateData.specialtyId = specialtyId
      if (bio !== undefined) updateData.bio = bio
      if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience

      const profile = await prisma.doctorProfile.update({
        where: { id: doctorProfileId },
        data: updateData,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          specialty: {
            select: { id: true, name: true }
          }
        }
      })

      return res.json(profile)
    } catch (err) {
      return res.status(400).json({ error: 'Failed to update doctor profile' })
    }
  }

  // Delete doctor profile
  if (req.method === 'DELETE') {
    const { doctorProfileId } = req.body
    
    if (!doctorProfileId) {
      return res.status(400).json({ error: 'doctorProfileId required' })
    }

    try {
      // Check if doctor has any appointments
      const appointmentCount = await prisma.appointment.count({
        where: { 
          doctorProfile: { id: doctorProfileId },
          status: { in: ['pending', 'confirmed'] }
        }
      })

      if (appointmentCount > 0) {
        return res.status(400).json({ 
          error: `Cannot delete: Doctor has ${appointmentCount} pending/confirmed appointments` 
        })
      }

      await prisma.doctorProfile.delete({
        where: { id: doctorProfileId }
      })

      return res.json({ message: 'Doctor profile deleted' })
    } catch (err) {
      return res.status(400).json({ error: 'Cannot delete doctor profile' })
    }
  }

  // Get all doctor profiles
  if (req.method === 'GET') {
    try {
      const doctors = await prisma.doctorProfile.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          specialty: {
            select: { id: true, name: true }
          },
          _count: {
            select: { appointments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return res.json(doctors)
    } catch (err) {
      return res.status(400).json({ error: 'Failed to fetch doctors' })
    }
  }

  res.status(405).end()
}
