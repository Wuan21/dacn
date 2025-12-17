const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { doctorId, date } = req.query

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'Missing doctorId or date' })
  }

  try {
    // Parse date to get start and end of day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all booked appointments for this doctor on this date
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: parseInt(doctorId),
        datetime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 'cancelled' }
      },
      select: {
        datetime: true
      }
    })

    // Extract time slots (HH:MM format)
    const bookedSlots = appointments.map(appt => {
      const date = new Date(appt.datetime)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    })

    return res.json({ bookedSlots })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to fetch booked slots' })
  }
}
