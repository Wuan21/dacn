const prisma = require('../../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../../lib/auth')

export default async function handler(req, res) {
  try {
    // Verify admin authentication
    const token = getTokenFromReq(req)
    
    if (!token) {
      return res.status(401).json({ error: 'Không có quyền truy cập' })
    }

    const decoded = verifyToken(token)
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền này' })
    }

    const { id } = req.query

    if (req.method === 'GET') {
      // Get appointment details
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              dateOfBirth: true,
            }
          },
          doctorProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              },
              specialty: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          medicalrecord: {
            select: {
              id: true,
              diagnosis: true,
              symptoms: true,
              notes: true,
              createdAt: true,
            }
          }
        }
      })

      if (!appointment) {
        return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' })
      }

      // Transform the response to flatten structure
      const response = {
        ...appointment,
        doctor: {
          id: appointment.doctorProfile?.user?.id,
          name: appointment.doctorProfile?.user?.name,
          email: appointment.doctorProfile?.user?.email,
          specialty: appointment.doctorProfile?.specialty || null,
        },
        doctorProfile: undefined, // Remove nested structure
      }

      return res.status(200).json(response)
    } 
    else if (req.method === 'DELETE') {
      // Delete appointment
      // First check if appointment exists
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) }
      })

      if (!appointment) {
        return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' })
      }

      // Delete related medical records first (if any)
      await prisma.medicalrecord.deleteMany({
        where: { appointmentId: parseInt(id) }
      })

      // Delete the appointment
      await prisma.appointment.delete({
        where: { id: parseInt(id) }
      })

      return res.status(200).json({ message: 'Đã xóa lịch hẹn thành công' })
    } 
    else {
      res.setHeader('Allow', ['GET', 'DELETE'])
      return res.status(405).json({ error: `Method ${req.method} không được hỗ trợ` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Có lỗi xảy ra', 
      details: error.message 
    })
  }
}
