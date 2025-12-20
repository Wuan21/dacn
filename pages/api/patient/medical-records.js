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

  if (decoded.role !== 'patient') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'GET') {
    const { appointmentId } = req.query

    let where = {
      appointment: { patientId: decoded.userId }
    }

    if (appointmentId) {
      where.appointmentId = parseInt(appointmentId)
    }

    const records = await prisma.medicalrecord.findMany({
      where,
      include: {
        appointment: {
          include: {
            doctorProfile: { 
              include: {
                user: { select: { id: true, name: true, email: true } },
                specialty: { select: { name: true } }
              }
            }
          }
        },
        prescription: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.json(records)
  }

  res.status(405).end()
}
