const prisma = require('../../../lib/prisma')
const { comparePassword, signToken, setTokenCookie } = require('../../../lib/auth')

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ email và mật khẩu' })
  }

  try{
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' })
    }
    
    const ok = await comparePassword(password, user.password)
    if (!ok) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }
    
    const token = signToken({ userId: user.id, role: user.role })
    setTokenCookie(res, token)
    res.status(200).json({ id: user.id, email: user.email, role: user.role, name: user.name })
  }catch(e){
    console.error('Login error:', e)
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng nhập, vui lòng thử lại' })
  }
}
