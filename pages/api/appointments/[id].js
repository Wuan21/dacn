const prisma = require('../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../lib/auth')
const { sendCancellationNotification } = require('../../../lib/emailService')

export default async function handler(req, res){
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  let decoded
  try { decoded = verifyToken(token) } catch { return res.status(401).json({ error: 'Invalid token' }) }

  if (req.method === 'PATCH'){
    try {
      const { id } = req.query
      const { status, cancellationReason } = req.body
      
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Validate cancellation reason if status is cancelled
      if (status === 'cancelled' && !cancellationReason?.trim()) {
        return res.status(400).json({ error: 'Cancellation reason is required' })
      }
      
      // Get appointment to check ownership
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) }
      })
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' })
      }
      
      // Check permissions
      if (decoded.role === 'patient') {
        // Patient can only cancel their own appointments
        if (appointment.patientId !== decoded.userId) {
          return res.status(403).json({ error: 'Bạn chỉ có thể hủy lịch hẹn của mình' })
        }
        if (status !== 'cancelled') {
          return res.status(403).json({ error: 'Bệnh nhân chỉ có thể hủy lịch hẹn' })
        }
        // Only allow cancelling pending or confirmed appointments
        if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
          return res.status(400).json({ error: 'Không thể hủy lịch hẹn này' })
        }
        // Không cho phép hủy lịch nếu đã khám (completed)
        if (appointment.status === 'completed') {
          return res.status(400).json({ error: 'Không thể hủy lịch hẹn đã hoàn thành' })
        }
        // Kiểm tra thời gian hủy: phải hủy trước 5 ngày so với ngày khám
        const appointmentTime = new Date(appointment.appointmentTime)
        const now = new Date()
        const daysDiff = (appointmentTime - now) / (1000 * 60 * 60 * 24)
        
        if (daysDiff < 5) {
          return res.status(400).json({ error: 'Chỉ có thể hủy lịch trước 5 ngày so với ngày khám' })
        }
        
        // Yêu cầu lý do hủy
        if (!cancellationReason?.trim()) {
          return res.status(400).json({ error: 'Vui lòng điền lý do hủy lịch' })
        }
      } else if (decoded.role === 'doctor') {
        // Doctor can only update their own appointments
        const doctorProfile = await prisma.doctorprofile.findUnique({
          where: { userId: decoded.userId }
        })
        if (!doctorProfile || appointment.doctorProfileId !== doctorProfile.id) {
          return res.status(403).json({ error: 'You can only update your own appointments' })
        }
      } else if (decoded.role !== 'admin') {
        // Only admin, doctor, or patient can update
        return res.status(403).json({ error: 'Forbidden' })
      }
      
      const updateData = { status }
      if (status === 'cancelled' && cancellationReason) {
        updateData.cancellationReason = cancellationReason.trim()
      }

      const appt = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: updateData,
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
      
      // Gửi email thông báo hủy lịch (chỉ khi status = cancelled và có patient info)
      if (status === 'cancelled' && appt.patient && appt.doctorProfile) {
        try {
          const dateFormatted = new Date(appt.appointmentTime).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          const timeFormatted = new Date(appt.appointmentTime).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })
          
          await sendCancellationNotification({
            patientEmail: appt.patient.email,
            patientName: appt.patient.name,
            doctorName: appt.doctorProfile.user.name,
            specialty: appt.doctorProfile.specialty.name,
            appointmentDate: dateFormatted,
            appointmentTime: timeFormatted,
            cancellationReason: appt.cancellationReason
          })
          console.log('✅ Cancellation email sent to:', appt.patient.email)
        } catch (emailError) {
          console.error('⚠️ Failed to send cancellation email:', emailError.message)
        }
      }
      
      return res.json(appt)
    } catch (error) {
      console.error('Error updating appointment:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  res.status(405).end()
}
