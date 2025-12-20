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
    // Find doctor profile first
    const doctorProfile = await prisma.doctorprofile.findUnique({
      where: { userId: decoded.userId }
    })

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' })
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorProfileId: doctorProfile.id },
      include: {
        patient: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            phone: true,
            address: true,
            dateOfBirth: true,
            gender: true
          } 
        },
        medicalrecord: {
          include: {
            prescription: true
          }
        }
      },
      orderBy: { appointmentTime: 'desc' }
    })

    // Format response
    const formatted = appointments.map(apt => ({
      id: apt.id,
      datetime: apt.appointmentTime,
      status: apt.status,
      createdAt: apt.createdAt,
      patient: apt.patient,
      medicalRecord: apt.medicalrecord
    }))

    return res.json(formatted)
  }

  res.status(405).end()
}
