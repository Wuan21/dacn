import prisma from '../../../lib/prisma'
import { verify } from 'jsonwebtoken'

export default async function handler(req, res) {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Chưa đăng nhập' })
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const userId = decoded.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' })
    }

    if (req.method === 'GET') {
      let chats = []

      if (user.role === 'admin') {
        // Admin thấy tất cả các chat support
        chats = await prisma.supportchat.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true
              }
            },
            admin: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                content: true,
                senderId: true,
                receiverId: true,
                isRead: true,
                createdAt: true
              }
            }
          },
          orderBy: { lastMessageAt: 'desc' }
        })
      } else {
        // User chỉ thấy chat của mình
        chats = await prisma.supportchat.findMany({
          where: { userId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true
              }
            },
            admin: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                content: true,
                senderId: true,
                receiverId: true,
                isRead: true,
                createdAt: true
              }
            }
          },
          orderBy: { lastMessageAt: 'desc' }
        })
      }

      return res.json(chats)
    }

    if (req.method === 'POST') {
      // Tạo hoặc lấy chat support của user
      let chat = await prisma.supportchat.findFirst({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profileImage: true
            }
          },
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })

      if (!chat) {
        chat = await prisma.supportchat.create({
          data: {
            userId,
            status: 'open'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true
              }
            },
            admin: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            messages: true
          }
        })
      }

      return res.json(chat)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Support chat API error:', error)
    return res.status(500).json({ error: 'Lỗi server', details: error.message })
  }
}
