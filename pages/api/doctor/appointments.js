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

  if (req.method === 'PATCH') {
    try {
      const { id, status } = req.body

      if (!id || !status) {
        return res.status(400).json({ error: 'id and status are required' })
      }

      // Find doctor profile
      const doctorProfile = await prisma.doctorprofile.findUnique({
        where: { userId: decoded.userId }
      })

      if (!doctorProfile) {
        return res.status(404).json({ error: 'Doctor profile not found' })
      }

      // Verify appointment belongs to this doctor
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: parseInt(id),
          doctorProfileId: doctorProfile.id
        }
      })

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      // Nếu trạng thái là 'completed' (Đã khám), kiểm tra thời gian
      if (status === 'completed') {
        const appointmentTime = new Date(appointment.appointmentTime)
        const now = new Date()
        
        // Chỉ cho phép xác nhận khi đã đến giờ hẹn (có thể thêm buffer 15 phút)
        const bufferMinutes = 15
        const allowedTime = new Date(appointmentTime.getTime() - bufferMinutes * 60000)
        
        if (now < allowedTime) {
          return res.status(400).json({ 
            error: 'Chỉ có thể xác nhận đã khám khi đã đến giờ hẹn',
            appointmentTime: appointmentTime.toISOString()
          })
        }
      }

      // Update appointment status
      const updated = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status }
      })

      return res.json(updated)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to update appointment' })
    }
  }

  res.status(405).end()
}
