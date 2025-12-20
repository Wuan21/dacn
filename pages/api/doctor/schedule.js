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

  const doctorProfileId = user.doctorprofile.id

  if (req.method === 'GET') {
    try {
      const { weekStart } = req.query
      
      let whereClause = { doctorProfileId }
      
      if (weekStart) {
        whereClause.weekStartDate = new Date(weekStart)
      }

      const schedules = await prisma.doctorschedule.findMany({
        where: whereClause,
        orderBy: [
          { dayOfWeek: 'asc' },
          { shift: 'asc' }
        ]
      })

      return res.status(200).json(schedules)
    } catch (error) {
      console.error('Error fetching schedules:', error)
      return res.status(500).json({ error: 'Failed to fetch schedules' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { schedules, weekStartDate } = req.body

      if (!schedules || !Array.isArray(schedules)) {
        return res.status(400).json({ error: 'Invalid schedules data' })
      }

      // Delete existing schedules for this week
      if (weekStartDate) {
        await prisma.doctorschedule.deleteMany({
          where: {
            doctorProfileId,
            weekStartDate: new Date(weekStartDate)
          }
        })
      }

      // Create new schedules
      const createdSchedules = await Promise.all(
        schedules.map(schedule => 
          prisma.doctorschedule.create({
            data: {
              doctorProfileId,
              dayOfWeek: schedule.dayOfWeek,
              shift: schedule.shift,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              isAvailable: schedule.isAvailable ?? true,
              weekStartDate: weekStartDate ? new Date(weekStartDate) : null
            }
          })
        )
      )

      return res.status(201).json({ 
        message: 'Schedules saved successfully',
        schedules: createdSchedules 
      })
    } catch (error) {
      console.error('Error saving schedules:', error)
      return res.status(500).json({ error: 'Failed to save schedules' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, isAvailable } = req.body

      const schedule = await prisma.doctorschedule.update({
        where: { id: parseInt(id) },
        data: { isAvailable }
      })

      return res.status(200).json(schedule)
    } catch (error) {
      console.error('Error updating schedule:', error)
      return res.status(500).json({ error: 'Failed to update schedule' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      await prisma.doctorschedule.delete({
        where: { id: parseInt(id) }
      })

      return res.status(200).json({ message: 'Schedule deleted' })
    } catch (error) {
      console.error('Error deleting schedule:', error)
      return res.status(500).json({ error: 'Failed to delete schedule' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
