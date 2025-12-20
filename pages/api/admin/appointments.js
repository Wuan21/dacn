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

  if (req.method === 'GET') {
    const appointments = await prisma.appointment.findMany({
      include: { 
        patient: { select: { id: true, name: true, email: true } },
        doctorProfile: { 
          include: { 
            user: { select: { id: true, name: true, email: true } },
            specialty: { select: { name: true } }
          } 
        }
      },
      orderBy: { appointmentTime: 'desc' }
    })
    
    const result = appointments.map(a => ({
      id: a.id,
      appointmentDate: a.appointmentTime,
      status: a.status,
      patientId: a.patient.id,
      patientName: a.patient.name,
      patientEmail: a.patient.email,
      doctorId: a.doctorProfile?.user?.id,
      doctorName: a.doctorProfile?.user?.name,
      doctorEmail: a.doctorProfile?.user?.email,
      specialtyName: a.doctorProfile?.specialty?.name || 'N/A',
      createdAt: a.createdAt
    }))
    
    return res.json(result)
  }

  if (req.method === 'PATCH') {
    const { appointmentId, status } = req.body
    
    if (!appointmentId) {
      return res.status(400).json({ error: 'appointmentId is required' })
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    try {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status }
      })
      return res.json(appointment)
    } catch (err) {
      return res.status(400).json({ error: 'Appointment not found' })
    }
  }

  if (req.method === 'DELETE') {
    const { appointmentId } = req.body
    
    if (!appointmentId) {
      return res.status(400).json({ error: 'appointmentId is required' })
    }

    try {
      await prisma.appointment.delete({
        where: { id: appointmentId }
      })
      return res.json({ success: true })
    } catch (err) {
      return res.status(400).json({ error: 'Appointment not found' })
    }
  }

  res.status(405).end()
}
