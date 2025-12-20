const prisma = require('../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../lib/auth')

export default async function handler(req, res) {
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  let decoded
  try { 
    decoded = verifyToken(token) 
  } catch { 
    return res.status(401).json({ error: 'Invalid token' }) 
  }

  if (decoded.role !== 'doctor') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'GET') {
    const { patientId, appointmentId } = req.query

    // Find doctor profile first
    const doctorProfile = await prisma.doctorprofile.findUnique({
      where: { userId: decoded.userId }
    })

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' })
    }

    let where = {}
    if (appointmentId) {
      where.appointmentId = parseInt(appointmentId)
    } else if (patientId) {
      where.appointment = {
        patientId: parseInt(patientId),
        doctorProfileId: doctorProfile.id
      }
    } else {
      where.appointment = { doctorProfileId: doctorProfile.id }
    }

    const records = await prisma.medicalrecord.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: { select: { id: true, name: true, email: true } }
          }
        },
        prescription: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.json(records)
  }

  if (req.method === 'POST') {
    const { appointmentId, diagnosis, symptoms, notes, prescriptions } = req.body

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({ error: 'appointmentId and diagnosis are required' })
    }

    try {
      // Find doctor profile
      const doctorProfile = await prisma.doctorprofile.findUnique({
        where: { userId: decoded.userId }
      })

      if (!doctorProfile) {
        return res.status(404).json({ error: 'Doctor profile not found' })
      }

      // Verify appointment belongs to this doctor
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          doctorProfileId: doctorProfile.id
        }
      })

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' })
      }

      // Check if medical record already exists
      const existing = await prisma.medicalrecord.findUnique({
        where: { appointmentId }
      })

      if (existing) {
        return res.status(400).json({ error: 'Medical record already exists for this appointment' })
      }

      // Create medical record with prescriptions
      const record = await prisma.medicalrecord.create({
        data: {
          appointmentId,
          diagnosis,
          symptoms: symptoms || null,
          notes: notes || null,
          prescription: prescriptions && prescriptions.length > 0 ? {
            create: prescriptions.map(p => ({
              medication: p.medication,
              dosage: p.dosage || '',
              duration: p.duration || '',
              instructions: p.instructions || null
            }))
          } : undefined
        },
        include: {
          prescription: true,
          appointment: {
            include: {
              patient: { select: { id: true, name: true, email: true } }
            }
          }
        }
      })

      // Update appointment status to completed
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'completed' }
      })

      return res.json(record)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to create medical record' })
    }
  }

  if (req.method === 'PATCH') {
    const { recordId, diagnosis, symptoms, notes } = req.body

    if (!recordId) {
      return res.status(400).json({ error: 'recordId is required' })
    }

    try {
      // Find doctor profile
      const doctorProfile = await prisma.doctorprofile.findUnique({
        where: { userId: decoded.userId }
      })

      if (!doctorProfile) {
        return res.status(404).json({ error: 'Doctor profile not found' })
      }

      // Verify record belongs to this doctor's appointment
      const record = await prisma.medicalrecord.findFirst({
        where: {
          id: recordId,
          appointment: { doctorProfileId: doctorProfile.id }
        }
      })

      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' })
      }

      const updateData = {}
      if (diagnosis) updateData.diagnosis = diagnosis
      if (symptoms !== undefined) updateData.symptoms = symptoms
      if (notes !== undefined) updateData.notes = notes

      const updated = await prisma.medicalrecord.update({
        where: { id: recordId },
        data: updateData,
        include: {
          prescription: true,
          appointment: {
            include: {
              patient: { select: { id: true, name: true, email: true } }
            }
          }
        }
      })

      return res.json(updated)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to update medical record' })
    }
  }

  res.status(405).end()
}
