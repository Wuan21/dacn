const prisma = require('../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../lib/auth')

export default async function handler(req, res){
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  let decoded
  try { decoded = verifyToken(token) } catch { return res.status(401).json({ error: 'Invalid token' }) }

  if (req.method === 'PATCH'){
    try {
      const { id } = req.query
      const { status } = req.body
      
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' })
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
        if (appointment.patientId !== decoded.id) {
          return res.status(403).json({ error: 'You can only cancel your own appointments' })
        }
        if (status !== 'cancelled') {
          return res.status(403).json({ error: 'Patients can only cancel appointments' })
        }
        // Only allow cancelling pending or confirmed appointments
        if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
          return res.status(400).json({ error: 'Cannot cancel this appointment' })
        }
      } else if (decoded.role === 'doctor') {
        // Doctor can only update their own appointments
        if (appointment.doctorId !== decoded.id) {
          return res.status(403).json({ error: 'You can only update your own appointments' })
        }
      } else if (decoded.role !== 'admin') {
        // Only admin, doctor, or patient can update
        return res.status(403).json({ error: 'Forbidden' })
      }
      
      const appt = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status }
      })
      return res.json(appt)
    } catch (error) {
      console.error('Error updating appointment:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  res.status(405).end()
}
