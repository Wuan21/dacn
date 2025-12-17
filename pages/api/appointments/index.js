const prisma = require('../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../lib/auth')

export default async function handler(req, res){
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  let decoded
  try { decoded = verifyToken(token) } catch { return res.status(401).json({ error: 'Invalid token' }) }

  if (req.method === 'GET'){
    try {
      // If patient: show my appointments
      // If doctor: show appointments for me (or filter by doctorId query)
      const { doctorId } = req.query
      let where = {}
      if (decoded.role === 'patient') where.patientId = decoded.userId
      else if (decoded.role === 'doctor') where.doctorId = doctorId ? parseInt(doctorId) : decoded.userId

      const appts = await prisma.appointment.findMany({
        where,
        include: { 
          user_appointment_patientIdTouser: { select: { id: true, name: true, email: true } },
          user_appointment_doctorIdTouser: { 
            select: { 
              id: true, 
              name: true,
              doctorprofile: {
                select: {
                  specialty: { select: { name: true } }
                }
              }
            }
          }
        },
        orderBy: { datetime: 'desc' }
      })
      
      const result = appts.map(a => ({
        id: a.id,
        appointmentDate: a.datetime,
        status: a.status,
        patient: a.user_appointment_patientIdTouser,
        patientName: a.user_appointment_patientIdTouser.name,
        patientEmail: a.user_appointment_patientIdTouser.email,
        doctor: a.user_appointment_doctorIdTouser,
        doctorName: a.user_appointment_doctorIdTouser.name,
        specialty: a.user_appointment_doctorIdTouser.doctorprofile?.specialty?.name
      }))
      
      return res.json(result)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return res.status(500).json({ error: 'Lỗi hệ thống. Vui lòng thử lại sau.' })
    }
  }

  if (req.method === 'POST'){
    try {
      // Create appointment (patient books doctor)
      const { doctorId, datetime } = req.body
      
      console.log('Creating appointment:', { doctorId, datetime, userId: decoded.id, role: decoded.role })
      
      if (!doctorId || !datetime) {
        return res.status(400).json({ error: 'Thiếu thông tin' })
      }
      
      // Only patients can book appointments
      if (decoded.role !== 'patient') {
        return res.status(403).json({ error: 'Chỉ bệnh nhân mới có thể đặt lịch' })
      }
      
      const appointmentDate = new Date(datetime)
      const now = new Date()
      
      // Validate: không được đặt lịch trong quá khứ
      if (appointmentDate < now) {
        return res.status(400).json({ error: 'Không thể đặt lịch trong quá khứ' })
      }
      
      // Validate datetime is valid
      if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({ error: 'Thời gian không hợp lệ' })
      }
      
      // Kiểm tra bác sĩ có tồn tại
      const doctor = await prisma.user.findUnique({ 
        where: { id: parseInt(doctorId) }
      })
      
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(404).json({ error: 'Bác sĩ không tồn tại' })
      }
      
      // Kiểm tra trùng lịch cho bác sĩ (cùng thời gian)
      const existingAppt = await prisma.appointment.findFirst({
        where: {
          doctorId: parseInt(doctorId),
          datetime: appointmentDate,
          status: { not: 'cancelled' }
        }
      })
      
      if (existingAppt) {
        return res.status(409).json({ error: 'Khung giờ này đã có người đặt. Vui lòng chọn giờ khác.' })
      }
      
      // Kiểm tra bệnh nhân đã đặt lịch này chưa
      const patientExisting = await prisma.appointment.findFirst({
        where: {
          patientId: decoded.userId,
          doctorId: parseInt(doctorId),
          datetime: appointmentDate,
          status: { not: 'cancelled' }
        }
      })
      
      if (patientExisting) {
        return res.status(409).json({ error: 'Bạn đã đặt lịch này rồi' })
      }
      
      // Tạo lịch hẹn
      console.log('Creating appointment with data:', {
        patientId: decoded.userId,
        doctorId: parseInt(doctorId),
        datetime: appointmentDate,
        status: 'pending'
      })
      
      const appt = await prisma.appointment.create({
        data: {
          patientId: decoded.userId,
          doctorId: parseInt(doctorId),
          datetime: appointmentDate,
          status: 'pending'
        },
        include: {
          user_appointment_doctorIdTouser: {
            select: {
              id: true,
              name: true,
              doctorprofile: {
                select: {
                  specialty: { select: { name: true } }
                }
              }
            }
          }
        }
      })
      
      console.log('Appointment created successfully:', appt.id)
      return res.status(201).json(appt)
    } catch (error) {
      console.error('Error creating appointment:', error)
      console.error('Error details:', error.message, error.stack)
      return res.status(500).json({ 
        error: 'Lỗi hệ thống. Vui lòng thử lại sau.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  res.status(405).end()
}
