import prisma from '../../../../lib/prisma'
import { verify } from 'jsonwebtoken'

export default async function handler(req, res) {
  const { chatId } = req.query

  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Chưa đăng nhập' })
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const userId = decoded.userId

    // Kiểm tra quyền truy cập chat
    const chat = await prisma.supportchat.findUnique({
      where: { id: parseInt(chatId) },
      include: { user: true, admin: true }
    })

    if (!chat) {
      return res.status(404).json({ error: 'Chat không tồn tại' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Chỉ user tạo chat hoặc admin mới được truy cập
    if (chat.userId !== userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Không có quyền truy cập' })
    }

    if (req.method === 'GET') {
      // Lấy danh sách tin nhắn
      const messages = await prisma.supportmessage.findMany({
        where: { chatId: parseInt(chatId) },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profileImage: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Đánh dấu tin nhắn là đã đọc
      await prisma.supportmessage.updateMany({
        where: {
          chatId: parseInt(chatId),
          receiverId: userId,
          isRead: false
        },
        data: { isRead: true }
      })

      return res.json(messages)
    }

    if (req.method === 'POST') {
      // Gửi tin nhắn
      const { content } = req.body

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' })
      }

      // Xác định receiverId
      let receiverId = null
      if (user.role === 'admin') {
        receiverId = chat.userId
        // Gán admin cho chat nếu chưa có
        if (!chat.adminId) {
          await prisma.supportchat.update({
            where: { id: parseInt(chatId) },
            data: { adminId: userId }
          })
        }
      } else {
        // Nếu là user, gửi cho admin (nếu có)
        receiverId = chat.adminId
      }

      const message = await prisma.supportmessage.create({
        data: {
          chatId: parseInt(chatId),
          senderId: userId,
          receiverId,
          content: content.trim()
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profileImage: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Update lastMessageAt
      await prisma.supportchat.update({
        where: { id: parseInt(chatId) },
        data: { lastMessageAt: new Date() }
      })

      return res.json(message)
    }

    if (req.method === 'PUT') {
      // Cập nhật trạng thái chat (chỉ admin)
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Không có quyền' })
      }

      const { status } = req.body
      
      const updatedChat = await prisma.supportchat.update({
        where: { id: parseInt(chatId) },
        data: { status }
      })

      return res.json(updatedChat)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Support messages API error:', error)
    return res.status(500).json({ error: 'Lỗi server', details: error.message })
  }
}
