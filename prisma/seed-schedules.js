// prisma/seed-schedules.js
// Seed lịch làm việc cho tất cả bác sĩ

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Cấu hình ca làm việc
const SHIFTS = {
  morning: {
    name: 'Sáng',
    startTime: '07:30',
    endTime: '11:30',
    slotDuration: 30
  },
  afternoon: {
    name: 'Chiều', 
    startTime: '13:30',
    endTime: '17:30',
    slotDuration: 30
  },
  evening: {
    name: 'Tối',
    startTime: '18:00',
    endTime: '21:00',
    slotDuration: 30
  }
}

// Lịch làm việc mẫu cho mỗi bác sĩ
// Mỗi bác sĩ sẽ có lịch khác nhau để đa dạng
const DOCTOR_SCHEDULES = [
  // Doctor 1: Làm sáng + chiều các ngày thường, tối thứ 3, 5
  {
    pattern: [
      { dayOfWeek: 1, shifts: ['morning', 'afternoon'] }, // Thứ 2
      { dayOfWeek: 2, shifts: ['morning', 'evening'] },   // Thứ 3
      { dayOfWeek: 3, shifts: ['morning', 'afternoon'] }, // Thứ 4
      { dayOfWeek: 4, shifts: ['afternoon', 'evening'] }, // Thứ 5
      { dayOfWeek: 5, shifts: ['morning', 'afternoon'] }, // Thứ 6
      { dayOfWeek: 6, shifts: ['morning'] },              // Thứ 7
    ]
  },
  // Doctor 2: Làm chiều + tối các ngày thường
  {
    pattern: [
      { dayOfWeek: 1, shifts: ['afternoon', 'evening'] },
      { dayOfWeek: 2, shifts: ['afternoon', 'evening'] },
      { dayOfWeek: 3, shifts: ['afternoon'] },
      { dayOfWeek: 4, shifts: ['afternoon', 'evening'] },
      { dayOfWeek: 5, shifts: ['afternoon', 'evening'] },
      { dayOfWeek: 6, shifts: ['morning', 'afternoon'] },
    ]
  },
  // Doctor 3: Làm sáng tất cả các ngày
  {
    pattern: [
      { dayOfWeek: 1, shifts: ['morning'] },
      { dayOfWeek: 2, shifts: ['morning', 'afternoon'] },
      { dayOfWeek: 3, shifts: ['morning'] },
      { dayOfWeek: 4, shifts: ['morning', 'afternoon'] },
      { dayOfWeek: 5, shifts: ['morning'] },
      { dayOfWeek: 6, shifts: ['morning', 'evening'] },
      { dayOfWeek: 0, shifts: ['morning'] }, // Chủ nhật
    ]
  },
  // Doctor 4: Làm chiều + sáng xen kẽ
  {
    pattern: [
      { dayOfWeek: 1, shifts: ['morning', 'afternoon'] },
      { dayOfWeek: 2, shifts: ['morning'] },
      { dayOfWeek: 3, shifts: ['afternoon', 'evening'] },
      { dayOfWeek: 4, shifts: ['morning', 'afternoon'] },
      { dayOfWeek: 5, shifts: ['afternoon'] },
      { dayOfWeek: 6, shifts: ['morning', 'evening'] },
    ]
  },
  // Doctor 5: Làm full các ngày thường
  {
    pattern: [
      { dayOfWeek: 1, shifts: ['morning', 'afternoon', 'evening'] },
      { dayOfWeek: 2, shifts: ['morning', 'afternoon'] },
      { dayOfWeek: 3, shifts: ['morning', 'afternoon', 'evening'] },
      { dayOfWeek: 4, shifts: ['morning', 'afternoon'] },
      { dayOfWeek: 5, shifts: ['afternoon', 'evening'] },
    ]
  },
]

async function seedSchedules() {
  try {
    console.log('🗓️ Bắt đầu seed lịch làm việc cho bác sĩ...\n')

    // Lấy tất cả bác sĩ
    const doctors = await prisma.doctorprofile.findMany({
      include: { user: true }
    })

    if (doctors.length === 0) {
      console.log('❌ Không có bác sĩ nào trong database!')
      return
    }

    console.log(`📋 Tìm thấy ${doctors.length} bác sĩ\n`)

    // Tính weekStart cho tuần hiện tại (28/12/2025 - Chủ nhật)
    const today = new Date()
    const currentDayOfWeek = today.getUTCDay()
    const weekStart = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - currentDayOfWeek, // Trừ để về Chủ nhật
      0, 0, 0, 0
    ))

    // Cũng seed cho tuần tới
    const nextWeekStart = new Date(weekStart)
    nextWeekStart.setUTCDate(weekStart.getUTCDate() + 7)

    console.log(`📅 Tuần hiện tại bắt đầu từ: ${weekStart.toISOString().split('T')[0]}`)
    console.log(`📅 Tuần tới bắt đầu từ: ${nextWeekStart.toISOString().split('T')[0]}\n`)

    // Xóa lịch cũ (nếu có)
    const deleted = await prisma.doctorschedule.deleteMany({
      where: {
        weekStartDate: {
          in: [weekStart, nextWeekStart]
        }
      }
    })
    console.log(`🗑️ Đã xóa ${deleted.count} lịch cũ\n`)

    let totalCreated = 0

    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i]
      const schedulePattern = DOCTOR_SCHEDULES[i % DOCTOR_SCHEDULES.length]

      console.log(`👨‍⚕️ Tạo lịch cho: ${doctor.user.name}`)

      // Tạo lịch cho cả 2 tuần
      for (const week of [weekStart, nextWeekStart]) {
        for (const daySchedule of schedulePattern.pattern) {
          for (const shiftKey of daySchedule.shifts) {
            const shift = SHIFTS[shiftKey]
            
            await prisma.doctorschedule.create({
              data: {
                doctorProfileId: doctor.id,
                weekStartDate: week,
                dayOfWeek: daySchedule.dayOfWeek,
                shift: shiftKey,
                startTime: shift.startTime,
                endTime: shift.endTime,
                slotDuration: shift.slotDuration,
                isAvailable: true
              }
            })
            totalCreated++
          }
        }
      }

      console.log(`   ✅ Đã tạo lịch cho tuần ${weekStart.toISOString().split('T')[0]} và ${nextWeekStart.toISOString().split('T')[0]}`)
    }

    console.log(`\n🎉 Hoàn thành! Đã tạo ${totalCreated} lịch làm việc cho ${doctors.length} bác sĩ`)

    // Thống kê
    const stats = await prisma.doctorschedule.groupBy({
      by: ['doctorProfileId'],
      _count: { id: true }
    })

    console.log('\n📊 Thống kê lịch làm việc:')
    for (const stat of stats) {
      const doc = doctors.find(d => d.id === stat.doctorProfileId)
      console.log(`   - ${doc?.user.name || 'Unknown'}: ${stat._count.id} ca làm việc`)
    }

  } catch (error) {
    console.error('❌ Lỗi:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSchedules()
