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

  if (req.method === 'POST') {
    const { name } = req.body
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }

    // Check if specialty already exists
    const existing = await prisma.specialty.findFirst({
      where: { name: name.trim() }
    })

    if (existing) {
      return res.status(400).json({ error: 'Specialty already exists' })
    }

    try {
      const specialty = await prisma.specialty.create({
        data: { name: name.trim() }
      })
      return res.json(specialty)
    } catch (err) {
      return res.status(400).json({ error: 'Failed to create specialty' })
    }
  }

  if (req.method === 'PATCH') {
    const { specialtyId, name } = req.body
    
    if (!specialtyId || !name || !name.trim()) {
      return res.status(400).json({ error: 'specialtyId and name required' })
    }

    // Check if specialty name already exists (excluding current specialty)
    const existing = await prisma.specialty.findFirst({
      where: { 
        name: name.trim(),
        NOT: { id: specialtyId }
      }
    })

    if (existing) {
      return res.status(400).json({ error: 'Specialty name already exists' })
    }

    try {
      const specialty = await prisma.specialty.update({
        where: { id: specialtyId },
        data: { name: name.trim() }
      })
      return res.json(specialty)
    } catch (err) {
      return res.status(400).json({ error: 'Failed to update specialty' })
    }
  }

  if (req.method === 'DELETE') {
    const { specialtyId } = req.body
    
    if (!specialtyId) {
      return res.status(400).json({ error: 'specialtyId required' })
    }

    try {
      // Check if any doctors have this specialty
      const doctorCount = await prisma.doctorprofile.count({
        where: { specialtyId }
      })

      if (doctorCount > 0) {
        return res.status(400).json({ error: `Cannot delete: ${doctorCount} doctors have this specialty` })
      }

      await prisma.specialty.delete({
        where: { id: specialtyId }
      })
      return res.json({ message: 'Specialty deleted' })
    } catch (err) {
      return res.status(400).json({ error: 'Cannot delete specialty' })
    }
  }

  res.status(405).end()
}
