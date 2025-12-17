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

  if (req.method === 'GET') {
    // Get all chats for current user
    try {
      const where = decoded.role === 'patient' 
        ? { patientId: decoded.id }
        : decoded.role === 'doctor'
          ? { doctorId: decoded.id }
          : {}

      const chats = await prisma.chat.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          },
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              doctorprofile: {
                select: {
                  profileImage: true,
                  specialty: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      })

      return res.json(chats)
    } catch (error) {
      console.error('Error fetching chats:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Create or get existing chat
    try {
      const { otherUserId } = req.body
      
      if (!otherUserId) {
        return res.status(400).json({ error: 'Missing otherUserId' })
      }

      // Determine patient and doctor IDs
      let patientId, doctorId
      
      if (decoded.role === 'patient') {
        patientId = decoded.id
        doctorId = parseInt(otherUserId)
      } else if (decoded.role === 'doctor') {
        doctorId = decoded.id
        patientId = parseInt(otherUserId)
      } else {
        return res.status(403).json({ error: 'Only patients and doctors can chat' })
      }

      // Check if chat already exists
      let chat = await prisma.chat.findFirst({
        where: {
          patientId,
          doctorId
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          },
          doctor: {
            select: {
              id: true,
              name: true,
              email: true,
              doctorprofile: {
                select: {
                  profileImage: true,
                  specialty: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        }
      })

      if (!chat) {
        // Create new chat
        chat = await prisma.chat.create({
          data: {
            patientId,
            doctorId
          },
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true
              }
            },
            doctor: {
              select: {
                id: true,
                name: true,
                email: true,
                doctorprofile: {
                  select: {
                    profileImage: true,
                    specialty: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        })
      }

      return res.json(chat)
    } catch (error) {
      console.error('Error creating chat:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
