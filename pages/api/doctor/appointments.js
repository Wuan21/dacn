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
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: decoded.id },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        medicalRecord: {
          include: {
            prescriptions: true
          }
        }
      },
      orderBy: { datetime: 'desc' }
    })

    return res.json(appointments)
  }

  res.status(405).end()
}
