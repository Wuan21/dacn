import prisma from '../../../lib/prisma'
import { getTokenFromReq, verifyToken } from '../../../lib/auth'

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

  const doctorProfile = user.doctorprofile

  if (req.method === 'GET') {
    try {
      const { weekStart } = req.query
      
      if (!weekStart) {
        return res.status(400).json({ error: 'weekStart is required' })
      }

      // Parse schedules from JSON field
      let allSchedules = {}
      try {
        allSchedules = doctorProfile.schedules ? JSON.parse(doctorProfile.schedules) : {}
      } catch (e) {
        console.error('Error parsing schedules:', e)
        allSchedules = {}
      }

      // Get schedules for this week
      const weekSchedules = allSchedules[weekStart] || []
      
      console.log('GET - weekStart:', weekStart)
      console.log('GET - Found schedules:', weekSchedules.length)

      return res.status(200).json(weekSchedules)
    } catch (error) {
      console.error('Error fetching schedules:', error)
      return res.status(500).json({ error: 'Failed to fetch schedules' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { schedules, weekStartDate } = req.body

      console.log('POST - Received schedules:', schedules?.length)
      console.log('POST - Received weekStartDate:', weekStartDate)

      if (!schedules || !Array.isArray(schedules)) {
        return res.status(400).json({ error: 'Invalid schedules data' })
      }

      if (!weekStartDate) {
        return res.status(400).json({ error: 'weekStartDate is required' })
      }

      // Parse existing schedules
      let allSchedules = {}
      try {
        allSchedules = doctorProfile.schedules ? JSON.parse(doctorProfile.schedules) : {}
      } catch (e) {
        console.error('Error parsing existing schedules:', e)
        allSchedules = {}
      }

      // Update schedules for this week
      allSchedules[weekStartDate] = schedules

      // Save back to database
      await prisma.doctorprofile.update({
        where: { id: doctorProfile.id },
        data: {
          schedules: JSON.stringify(allSchedules)
        }
      })

      console.log('POST - Saved schedules for week:', weekStartDate)

      return res.status(201).json({ 
        message: 'Schedules saved successfully',
        count: schedules.length,
        schedules: schedules
      })
    } catch (error) {
      console.error('POST - Error saving schedules:', error)
      console.error('POST - Error stack:', error.stack)
      return res.status(500).json({ 
        error: 'Lỗi khi lưu lịch làm việc',
        details: error.message
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
