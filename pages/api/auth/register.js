const prisma = require('../../../lib/prisma')
const { hashPassword } = require('../../../lib/auth')

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end()
  const { email, name, password, role } = req.body
  
  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' })
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' })
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email không hợp lệ' })
  }

  try{
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'Email đã được đăng ký' })
    }
    
    const hashed = await hashPassword(password)
    const user = await prisma.user.create({ 
      data: { 
        email, 
        name, 
        password: hashed, 
        role: role || 'patient',
        isActive: true 
      } 
    })
    
    res.status(201).json({ id: user.id, email: user.email })
  }catch(e){
    console.error('Register error:', e)
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng ký, vui lòng thử lại' })
  }
}
