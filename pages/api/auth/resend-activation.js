const prisma = require('../../../lib/prisma')
const { sendActivationEmail } = require('../../../lib/emailService')
const crypto = require('crypto')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email là bắt buộc' })
  }

  try {
    // Tìm user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản với email này' })
    }

    // Kiểm tra tài khoản đã được kích hoạt chưa
    if (user.isActive) {
      return res.status(400).json({ error: 'Tài khoản đã được kích hoạt' })
    }

    // Tạo mã kích hoạt mới (6 chữ số)
    const activationCode = crypto.randomInt(100000, 999999).toString()
    const activationCodeExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 phút

    // Cập nhật mã kích hoạt mới
    await prisma.user.update({
      where: { email },
      data: {
        activationCode,
        activationCodeExpiry
      }
    })

    // Gửi email kích hoạt
    const emailResult = await sendActivationEmail({
      email: user.email,
      name: user.name,
      activationCode
    })

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Không thể gửi email. Vui lòng thử lại sau' })
    }

    return res.status(200).json({ 
      success: true,
      message: 'Email kích hoạt đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.' 
    })

  } catch (error) {
    console.error('Resend activation error:', error)
    return res.status(500).json({ error: 'Có lỗi xảy ra khi gửi lại email kích hoạt' })
  }
}
