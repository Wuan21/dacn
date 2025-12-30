const prisma = require('../../../lib/prisma')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: 'Email và mã kích hoạt là bắt buộc' })
  }

  try {
    // Tìm user với email và activation code
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    }

    // Kiểm tra tài khoản đã được kích hoạt chưa
    if (user.isActive) {
      return res.status(400).json({ error: 'Tài khoản đã được kích hoạt trước đó' })
    }

    // Kiểm tra mã kích hoạt
    if (user.activationCode !== code) {
      return res.status(400).json({ error: 'Mã kích hoạt không đúng' })
    }

    // Kiểm tra thời hạn mã kích hoạt (5 phút)
    if (user.activationCodeExpiry && new Date() > new Date(user.activationCodeExpiry)) {
      return res.status(400).json({ 
        error: 'Mã kích hoạt đã hết hạn (5 phút). Vui lòng yêu cầu gửi lại mã mới',
        expired: true 
      })
    }

    // Kích hoạt tài khoản
    await prisma.user.update({
      where: { email },
      data: {
        isActive: true,
        activationCode: null,
        activationCodeExpiry: null
      }
    })

    return res.status(200).json({ 
      success: true,
      message: 'Tài khoản đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ!' 
    })

  } catch (error) {
    console.error('Activation error:', error)
    return res.status(500).json({ error: 'Có lỗi xảy ra khi kích hoạt tài khoản' })
  }
}
