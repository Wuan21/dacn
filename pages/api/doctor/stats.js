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
        medicalRecord: true
      }
    })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      today: appointments.filter(a => new Date(a.appointmentDate).toDateString() === today.toDateString()).length,
      thisWeek: appointments.filter(a => new Date(a.appointmentDate) >= weekAgo).length,
      thisMonth: appointments.filter(a => new Date(a.appointmentDate) >= monthAgo).length,
      withRecords: appointments.filter(a => a.medicalRecord).length,
      uniquePatients: new Set(appointments.map(a => a.patientId)).size
    }

    return res.json(stats)
  }

  res.status(405).end()
}
