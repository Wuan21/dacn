const prisma = require('../../../lib/prisma')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { sendActivationEmail } = require('../../../lib/emailService')

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end()
  const { email, name, phone, dateOfBirth, password } = req.body
  
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

  // Validate phone format if provided
  if (phone) {
    const phoneRegex = /^[0-9]{10,11}$/
    const cleanPhone = phone.replace(/\s/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: 'Số điện thoại không hợp lệ' })
    }
  }

  try{
    console.log('[REGISTER] Starting registration for:', email)
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      console.log('[REGISTER] Email already exists:', email)
      return res.status(409).json({ error: 'Email đã được đăng ký' })
    }
    
    console.log('[REGISTER] Hashing password...')
    // Hash password using bcryptjs (same as NextAuth)
    const hashed = await bcrypt.hash(password, 10)
    
    console.log('[REGISTER] Generating activation code...')
    // Tạo mã kích hoạt (6 chữ số)
    const activationCode = crypto.randomInt(100000, 999999).toString()
    const activationCodeExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 phút
    
    console.log('[REGISTER] Creating user in database...')
    // Tạo user mới với role mặc định là patient và isActive = false
    const user = await prisma.user.create({ 
      data: { 
        email, 
        name, 
        phone: phone ? phone.replace(/\s/g, '') : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        password: hashed, 
        role: 'patient', 
        isActive: false, 
        activationCode,
        activationCodeExpiry
      } 
    })
    
    console.log('[REGISTER] User created successfully, ID:', user.id)
    console.log('[REGISTER] Sending activation email...')
    
    // Gửi email kích hoạt
    const emailResult = await sendActivationEmail({
      email: user.email,
      name: user.name,
      activationCode
    })

    if (!emailResult.success) {
      console.error('[REGISTER] Failed to send activation email:', emailResult.error)
      // Vẫn trả về success vì user đã được tạo, nhưng cảnh báo về email
      return res.status(201).json({ 
        id: user.id, 
        email: user.email,
        warning: 'Tài khoản đã được tạo nhưng không thể gửi email kích hoạt. Vui lòng liên hệ hỗ trợ.'
      })
    }
    
    console.log('[REGISTER] Email sent successfully!')
    res.status(201).json({ 
      id: user.id, 
      email: user.email,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.'
    })
  }catch(e){
    console.error('[REGISTER] ERROR:', e)
    console.error('[REGISTER] Error details:', {
      message: e.message,
      stack: e.stack,
      name: e.name
    })
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng ký, vui lòng thử lại' })
  }
}
