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

  if (req.method === 'POST') {
    const { medicalRecordId, medication, dosage, duration, instructions } = req.body

    if (!medicalRecordId || !medication || !dosage || !duration) {
      return res.status(400).json({ error: 'medicalRecordId, medication, dosage, and duration are required' })
    }

    try {
      // Verify medical record belongs to this doctor
      const record = await prisma.medicalRecord.findFirst({
        where: {
          id: medicalRecordId,
          appointment: { doctorId: decoded.id }
        }
      })

      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' })
      }

      const prescription = await prisma.prescription.create({
        data: {
          medicalRecordId,
          medication,
          dosage,
          duration,
          instructions: instructions || null
        }
      })

      return res.json(prescription)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to create prescription' })
    }
  }

  if (req.method === 'PATCH') {
    const { prescriptionId, medication, dosage, duration, instructions } = req.body

    if (!prescriptionId) {
      return res.status(400).json({ error: 'prescriptionId is required' })
    }

    try {
      // Verify prescription belongs to this doctor's medical record
      const prescription = await prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          medicalRecord: {
            appointment: { doctorId: decoded.id }
          }
        }
      })

      if (!prescription) {
        return res.status(404).json({ error: 'Prescription not found' })
      }

      const updateData = {}
      if (medication) updateData.medication = medication
      if (dosage) updateData.dosage = dosage
      if (duration) updateData.duration = duration
      if (instructions !== undefined) updateData.instructions = instructions

      const updated = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: updateData
      })

      return res.json(updated)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to update prescription' })
    }
  }

  if (req.method === 'DELETE') {
    const { prescriptionId } = req.body

    if (!prescriptionId) {
      return res.status(400).json({ error: 'prescriptionId is required' })
    }

    try {
      // Verify prescription belongs to this doctor's medical record
      const prescription = await prisma.prescription.findFirst({
        where: {
          id: prescriptionId,
          medicalRecord: {
            appointment: { doctorId: decoded.id }
          }
        }
      })

      if (!prescription) {
        return res.status(404).json({ error: 'Prescription not found' })
      }

      await prisma.prescription.delete({
        where: { id: prescriptionId }
      })

      return res.json({ success: true })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to delete prescription' })
    }
  }

  res.status(405).end()
}
