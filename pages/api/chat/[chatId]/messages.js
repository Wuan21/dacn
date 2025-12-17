const prisma = require('../../../../lib/prisma')
const { getTokenFromReq, verifyToken } = require('../../../../lib/auth')

export default async function handler(req, res) {
  const token = getTokenFromReq(req)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  let decoded
  try {
    decoded = verifyToken(token)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { chatId } = req.query

  if (req.method === 'GET') {
    // Get all messages for a chat
    try {
      const chat = await prisma.chat.findUnique({
        where: { id: parseInt(chatId) }
      })

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' })
      }

      // Verify user has access to this chat
      if (chat.patientId !== decoded.id && chat.doctorId !== decoded.id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      const messages = await prisma.message.findMany({
        where: { chatId: parseInt(chatId) },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      })

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          chatId: parseInt(chatId),
          receiverId: decoded.id,
          isRead: false
        },
        data: { isRead: true }
      })

      return res.json(messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Send a message
    try {
      const { content } = req.body

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Message content is required' })
      }

      const chat = await prisma.chat.findUnique({
        where: { id: parseInt(chatId) }
      })

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' })
      }

      // Verify user has access to this chat
      if (chat.patientId !== decoded.id && chat.doctorId !== decoded.id) {
        return res.status(403).json({ error: 'Access denied' })
      }

      // Determine receiver
      const receiverId = decoded.id === chat.patientId ? chat.doctorId : chat.patientId

      const message = await prisma.message.create({
        data: {
          chatId: parseInt(chatId),
          senderId: decoded.id,
          receiverId,
          content: content.trim()
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        }
      })

      // Update chat's lastMessageAt
      await prisma.chat.update({
        where: { id: parseInt(chatId) },
        data: { lastMessageAt: new Date() }
      })

      return res.status(201).json(message)
    } catch (error) {
      console.error('Error sending message:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
