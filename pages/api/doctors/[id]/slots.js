import prisma from '../../../../lib/prisma'

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id, date } = req.query
    
    if (!id || !date) {
      return res.status(400).json({ error: 'Doctor Profile ID and date are required' })
    }

    // id ở đây là doctorProfileId
    const doctorProfileId = parseInt(id)
    
    // Validate doctor profile exists
    const doctorProfile = await prisma.doctorprofile.findUnique({
      where: { id: doctorProfileId }
    })

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' })
    }

    // Parse date string YYYY-MM-DD
    const [year, month, day] = date.split('-').map(Number)
    
    // Create date for the query date
    const queryDate = new Date(year, month - 1, day, 0, 0, 0, 0)
    const dayOfWeek = queryDate.getDay() // 0=Sunday, 1=Monday, etc.
    
    // Calculate weekStartDate (Sunday)
    const weekStart = new Date(queryDate)
    const daysSinceSunday = dayOfWeek
    weekStart.setDate(queryDate.getDate() - daysSinceSunday)
    weekStart.setHours(0, 0, 0, 0)
    const weekStartStr = weekStart.toISOString().split('T')[0]
    
    console.log('📅 Slots API Debug:', {
      requestDate: date,
      dayOfWeek,
      weekStartDate: weekStartStr,
      doctorProfileId: doctorProfileId
    })

    // Đọc lịch làm việc từ trường schedules (JSON)
    let allSchedulesData = {}
    try {
      allSchedulesData = doctorProfile.schedules ? JSON.parse(doctorProfile.schedules) : {}
    } catch (e) {
      console.error('Error parsing schedules JSON:', e)
      allSchedulesData = {}
    }

    // Lấy lịch của tuần này
    const weekSchedules = allSchedulesData[weekStartStr] || []
    
    // Lọc theo ngày trong tuần
    const schedules = weekSchedules.filter(s => s.dayOfWeek === dayOfWeek && s.isAvailable)
    
    console.log(`   Found ${schedules.length} schedules for week ${weekStartStr}, dayOfWeek=${dayOfWeek}`)
    
    if (schedules.length > 0) {
      console.log('   Schedule details:', schedules.map(s => ({
        shift: s.shift,
        time: `${s.startTime}-${s.endTime}`,
        slotDuration: s.slotDuration
      })))
    }

    if (schedules.length === 0) {
      return res.status(200).json({ 
        date,
        dayOfWeek,
        weekStartDate: weekStartStr,
        schedules: [],
        message: 'Bác sĩ không có lịch làm việc trong ngày này'
      })
    }

    // Tạo slots cho tất cả các ca làm việc
    const allSlots = []
    
    for (const schedule of schedules) {
      const slots = generateTimeSlots(
        schedule.startTime,
        schedule.endTime,
        schedule.slotDuration || 30
      )
      
      allSlots.push({
        shift: schedule.shift,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDuration: schedule.slotDuration || 30,
        slots: slots
      })
    }

    // Lấy danh sách các slot đã được đặt
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorProfileId: doctorProfileId,
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
