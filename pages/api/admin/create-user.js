const prisma = require('../../../lib/prisma')
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
const bcrypt = require('bcryptjs')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { email, password, name, role, specialtyId } = req.body

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' })
  }

  if (role === 'doctor' && !specialtyId) {
    return res.status(400).json({ error: 'Bác sĩ phải có chuyên khoa' })
  }

  if (!['patient', 'doctor', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isActive: true
      }
    })

    // If doctor, create doctor profile
    if (role === 'doctor') {
      await prisma.doctorprofile.create({
        data: {
          userId: user.id,
          specialtyId: parseInt(specialtyId),
          bio: ''
        }
      })
    }

    return res.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Không thể tạo tài khoản' })
  }
}
