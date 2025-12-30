const prisma = require('../../../lib/prisma')
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.json(users)
  }

  if (req.method === 'PATCH') {
    const { userId, role, isActive } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' })
    }

    const updateData = {}
    
    if (role !== undefined) {
      if (!['patient', 'doctor', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' })
      }
      updateData.role = role
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided' })
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, email: true, name: true, role: true, isActive: true }
      })
      return res.json(user)
    } catch (err) {
      return res.status(400).json({ error: 'User not found' })
    }
  }

  if (req.method === 'DELETE') {
    const { userId } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' })
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' })
    }

    try {
      await prisma.user.delete({
        where: { id: userId }
      })
      return res.json({ message: 'User deleted' })
    } catch (err) {
      return res.status(400).json({ error: 'Cannot delete user' })
    }
  }

  res.status(405).end()
}
