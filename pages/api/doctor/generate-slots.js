import prisma from '../../../lib/prisma'
import { getTokenFromReq, verifyToken } from '../../../lib/auth'

// Hàm tính toán slots từ startTime, endTime và slotDuration
function generateTimeSlots(startTime, endTime, slotDuration) {
  const slots = []
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  
  let currentMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  while (currentMinutes + slotDuration <= endMinutes) {
    const slotHour = Math.floor(currentMinutes / 60)
    const slotMinute = currentMinutes % 60
    const slotEndMinutes = currentMinutes + slotDuration
    const slotEndHour = Math.floor(slotEndMinutes / 60)
    const slotEndMinute = slotEndMinutes % 60
    
    const timeSlot = {
      startTime: `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`,
      endTime: `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`
    }
    
    slots.push(timeSlot)
    currentMinutes += slotDuration
  }
  
  return slots
}

export default async function handler(req, res) {
  // Verify authentication
  const token = getTokenFromReq(req)
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  let decoded
  try {
    decoded = verifyToken(token)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (decoded.role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied' })
  }

  // Get user and verify doctor role
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { doctorprofile: true }
  })

  if (!user || user.role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied' })
  }

  if (!user.doctorprofile) {
    return res.status(400).json({ error: 'Doctor profile not found' })
  }

  const doctorProfileId = user.doctorprofile.id

  if (req.method === 'GET') {
    try {
      const { date } = req.query
      
      if (!date) {
        return res.status(400).json({ error: 'Date is required' })
      }

      // Parse date string YYYY-MM-DD in local timezone
      const [year, month, day] = date.split('-').map(Number)
      const queryDate = new Date(year, month - 1, day, 0, 0, 0, 0)
      const dayOfWeek = queryDate.getDay()

      // Get Monday of the week for this date
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStartDate = new Date(queryDate)
      weekStartDate.setDate(queryDate.getDate() - daysSinceMonday)
      weekStartDate.setHours(0, 0, 0, 0)

      // Lấy lịch làm việc của bác sĩ cho ngày này và tuần này
      const schedules = await prisma.doctorschedule.findMany({
        where: {
          doctorProfileId,
          dayOfWeek,
          isAvailable: true,
          weekStartDate: weekStartDate
        },
        orderBy: {
          startTime: 'asc'
        }
      })

      if (schedules.length === 0) {
        return res.status(200).json({ 
          date,
          dayOfWeek,
          slots: [],
          message: 'Không có lịch làm việc cho ngày này'
        })
      }

      // Tạo slots cho tất cả các ca làm việc
      const allSlots = []
      
      for (const schedule of schedules) {
        const slots = generateTimeSlots(
          schedule.startTime,
          schedule.endTime,
          schedule.slotDuration
        )
        
        allSlots.push({
          scheduleId: schedule.id,
          shift: schedule.shift,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          slotDuration: schedule.slotDuration,
          slots: slots
        })
      }

      // Lấy danh sách các slot đã được đặt
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

      const bookedAppointments = await prisma.appointment.findMany({
        where: {
          doctorProfileId,
          appointmentTime: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: {
            in: ['pending', 'confirmed']
          }
        },
        select: {
          appointmentTime: true
        }
      })

      // Đánh dấu các slot đã được đặt
      const bookedTimes = bookedAppointments.map(apt => {
        const time = new Date(apt.appointmentTime)
        return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
      })

      allSlots.forEach(shiftData => {
        shiftData.slots = shiftData.slots.map(slot => ({
          ...slot,
          isBooked: bookedTimes.includes(slot.startTime),
          dateTime: new Date(year, month - 1, day, ...slot.startTime.split(':').map(Number)).toISOString()
        }))
      })

      return res.status(200).json({
        date,
        dayOfWeek,
        schedules: allSlots
      })
    } catch (error) {
      console.error('Error generating slots:', error)
      return res.status(500).json({ error: 'Failed to generate slots' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
