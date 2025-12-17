const prisma = require('../../../lib/prisma')
const { hashPassword } = require('../../../lib/auth')

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end()
  const { email, name, password, role } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing' })

  try{
    const hashed = await hashPassword(password)
    const user = await prisma.user.create({ data: { email, name, password: hashed, role: role || 'patient' } })
    // If doctor, optionally create doctorProfile later via admin or add specialty
    res.status(201).json({ id: user.id, email: user.email })
  }catch(e){
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
}
