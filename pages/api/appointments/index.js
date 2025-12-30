const prisma = require('../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../lib/auth')
const { sendAppointmentConfirmation } = require('../../../lib/emailService')

export default async function handler(req, res){
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  let decoded
  try { decoded = verifyToken(token) } catch { return res.status(401).json({ error: 'Invalid token' }) }

  if (req.method === 'GET'){
    try {
      // If patient: show my appointments
      // If doctor: show appointments for me
      let where = {}
      
      if (decoded.role === 'patient') {
        where.patientId = decoded.userId
      } else if (decoded.role === 'doctor') {
        // Find doctor profile
        const doctorProfile = await prisma.doctorprofile.findUnique({
          where: { userId: decoded.userId }
        })
        if (doctorProfile) {
          where.doctorProfileId = doctorProfile.id
        }
      }

      const appts = await prisma.appointment.findMany({
        where,
        include: { 
          patient: { select: { id: true, name: true, email: true } },
          doctorProfile: { 
            include: {
              user: { select: { id: true, name: true } },
              specialty: { select: { name: true } }
            }
          }
        },
        orderBy: { appointmentTime: 'desc' }
      })
      
      const result = appts.map(a => ({
        id: a.id,
        appointmentDate: a.appointmentTime,
        status: a.status,
        patient: a.patient,
        patientName: a.patient.name,
        patientEmail: a.patient.email,
        doctor: a.doctorProfile?.user,
        doctorName: a.doctorProfile?.user?.name,
        specialty: a.doctorProfile?.specialty?.name
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
      const { doctorProfileId, datetime } = req.body
      
      console.log('Creating appointment:', { doctorProfileId, datetime, userId: decoded.userId, role: decoded.role })
      
      if (!doctorProfileId || !datetime) {
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
      
      // Validate doctor profile exists
      const doctorProfile = await prisma.doctorprofile.findUnique({
        where: { id: parseInt(doctorProfileId) },
        include: { user: true }
      })
      
      if (!doctorProfile) {
        return res.status(404).json({ error: 'Bác sĩ không tồn tại' })
      }
      
      // Kiểm tra bác sĩ có lịch làm việc trong ngày đó không
      const dayOfWeek = appointmentDate.getDay()
      const year = appointmentDate.getFullYear()
      const month = appointmentDate.getMonth()
      const day = appointmentDate.getDate()
      
      // Tính ngày chủ nhật (tuần bắt đầu từ chủ nhật = 0)
      const sundayDate = new Date(year, month, day)
      sundayDate.setDate(sundayDate.getDate() - dayOfWeek)
      sundayDate.setHours(0, 0, 0, 0)
      const weekStartStr = sundayDate.toISOString().split('T')[0]
      
      console.log('📅 Appointment booking - Date calculation:', {
        appointmentDate: appointmentDate.toISOString(),
        dayOfWeek,
        weekStartDate: weekStartStr
      })
      
      const timeStr = `${String(appointmentDate.getHours()).padStart(2, '0')}:${String(appointmentDate.getMinutes()).padStart(2, '0')}`
      
      // Kiểm tra xem slot có trong lịch làm việc của bác sĩ không
      // Đọc lịch từ trường schedules (JSON)
      
      let allSchedulesData = {}
      try {
        allSchedulesData = doctorProfile.schedules ? JSON.parse(doctorProfile.schedules) : {}
      } catch (e) {
        console.error('Error parsing doctor schedules:', e)
        allSchedulesData = {}
      }
      
      const weekSchedules = allSchedulesData[weekStartStr] || []
      const doctorSchedules = weekSchedules.filter(s => s.dayOfWeek === dayOfWeek && s.isAvailable)
      
      if (doctorSchedules.length === 0) {
        return res.status(400).json({ error: 'Bác sĩ không có lịch làm việc trong ngày này' })
      }
      
      // Kiểm tra thời gian có nằm trong các khung giờ làm việc không
      let isValidSlot = false
      for (const schedule of doctorSchedules) {
        const scheduleStart = schedule.startTime
        const scheduleEnd = schedule.endTime
        
        if (timeStr >= scheduleStart && timeStr < scheduleEnd) {
          // Kiểm tra xem thời gian có đúng với slot duration không
          const [startHour, startMinute] = scheduleStart.split(':').map(Number)
          const startMinutes = startHour * 60 + startMinute
          const [slotHour, slotMinute] = timeStr.split(':').map(Number)
          const slotMinutes = slotHour * 60 + slotMinute
          const diff = slotMinutes - startMinutes
          
          const slotDuration = schedule.slotDuration || 30
          if (diff >= 0 && diff % slotDuration === 0) {
            isValidSlot = true
            break
          }
        }
      }
      
      if (!isValidSlot) {
        return res.status(400).json({ error: 'Khung giờ không hợp lệ. Vui lòng chọn khung giờ trong lịch làm việc của bác sĩ.' })
      }
      
      // Kiểm tra trùng lịch cho bác sĩ (cùng thời gian) - mỗi khung giờ chỉ 1 bệnh nhân
      const existingAppt = await prisma.appointment.findFirst({
        where: {
          doctorProfileId: parseInt(doctorProfileId),
          appointmentTime: appointmentDate,
          status: { in: ['pending', 'confirmed'] }
        }
      })
      
      if (existingAppt) {
        return res.status(409).json({ error: 'Khung giờ này đã có người đặt. Vui lòng chọn giờ khác.' })
      }
      
      // Kiểm tra bệnh nhân có đang có lịch hẹn khác trong cùng ngày không (không quan tâm bác sĩ hay khoa nào)
      const startOfDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), 0, 0, 0, 0)
      const endOfDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate(), 23, 59, 59, 999)
      
      const patientExisting = await prisma.appointment.findFirst({
        where: {
          patientId: decoded.userId,
          appointmentTime: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: { in: ['pending', 'confirmed'] }
        }
      })
      
      if (patientExisting) {
        return res.status(409).json({ error: 'Bạn đã có lịch hẹn trong ngày này. Mỗi ngày chỉ được đặt một lịch khám.' })
      }
      
      // Tạo lịch hẹn
      const appt = await prisma.appointment.create({
        data: {
          patientId: decoded.userId,
          doctorProfileId: parseInt(doctorProfileId),
          appointmentTime: appointmentDate,
          status: 'pending'
        },
        include: {
          patient: { select: { id: true, name: true, email: true } },
          doctorProfile: {
            include: {
              user: { select: { id: true, name: true } },
              specialty: { select: { name: true } }
            }
          }
        }
      })
      
      console.log('Appointment created successfully:', appt.id)
      
      // Gửi email xác nhận (không chặn response nếu email fail)
      try {
        const dateFormatted = new Date(appointmentDate).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        const timeFormatted = new Date(appointmentDate).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
        
        await sendAppointmentConfirmation({
          patientEmail: appt.patient.email,
          patientName: appt.patient.name,
          doctorName: appt.doctorProfile.user.name,
          specialty: appt.doctorProfile.specialty.name,
          appointmentDate: dateFormatted,
          appointmentTime: timeFormatted
        })
        console.log('✅ Confirmation email sent to:', appt.patient.email)
      } catch (emailError) {
        // Log lỗi nhưng không fail request
        console.error('⚠️ Failed to send confirmation email:', emailError.message)
      }
      
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
