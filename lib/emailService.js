// lib/emailService.js
const nodemailer = require('nodemailer')

// Cấu hình email transporter
// Sử dụng Gmail - bạn cần enable "Less secure app access" hoặc dùng App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASSWORD // Mật khẩu ứng dụng (App Password)
  }
})

/**
 * Gửi email xác nhận đặt lịch cho bệnh nhân
 */
async function sendAppointmentConfirmation({ 
  patientEmail, 
  patientName, 
  doctorName, 
  specialty,
  appointmentDate,
  appointmentTime 
}) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: 'Xác nhận đặt lịch khám - YourMedicare',
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận đặt lịch khám</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa; padding: 20px 0;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; line-height: 80px; font-size: 40px;">
                      🏥
                    </div>
                    <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px;">YourMedicare</h1>
                    <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.95); font-weight: 400;">Hệ thống đặt lịch khám bệnh</p>
                  </td>
                </tr>
                
                <!-- Success Badge -->
                <tr>
                  <td style="padding: 0 30px;">
                    <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); margin: -30px auto 0; padding: 12px 24px; border-radius: 50px; text-align: center; max-width: 250px; box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);">
                      <span style="color: #ffffff; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">✓ ĐẶT LỊCH THÀNH CÔNG</span>
                    </div>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px 30px 30px;">
                    <h2 style="color: #1a1a1a; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Xin chào ${patientName},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 30px;">
                      Cảm ơn bạn đã đặt lịch khám tại <strong style="color: #667eea;">YourMedicare</strong>. 
                      Lịch hẹn của bạn đã được <strong style="color: #43e97b;">xác nhận thành công</strong>.
                    </p>
                    
                    <!-- Appointment Details Card -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f6f8fb 0%, #f1f4f9 100%); border-radius: 12px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="color: #667eea; margin: 0 0 20px; font-size: 18px; font-weight: 600;">
                            <span style="margin-right: 8px;"></span>Thông tin lịch hẹn
                          </h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #718096; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;"></span><strong>Bác sĩ</strong>
                                    </td>
                                    <td style="color: #1a1a1a; font-size: 15px; font-weight: 600; text-align: right;">
                                      ${doctorName}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #718096; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;"></span><strong>Chuyên khoa</strong>
                                    </td>
                                    <td style="color: #1a1a1a; font-size: 15px; font-weight: 600; text-align: right;">
                                      ${specialty}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #718096; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;">📅</span><strong>Ngày khám</strong>
                                    </td>
                                    <td style="color: #1a1a1a; font-size: 15px; font-weight: 600; text-align: right;">
                                      ${appointmentDate}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #718096; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;">🕐</span><strong>Giờ khám</strong>
                                    </td>
                                    <td style="color: #667eea; font-size: 18px; font-weight: 700; text-align: right;">
                                      ${appointmentTime}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Important Notes -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; overflow: hidden;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="color: #92400e; margin: 0 0 12px; font-size: 16px; font-weight: 600;">
                            <span style="margin-right: 6px;"></span>Lưu ý quan trọng
                          </h4>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="color: #92400e; font-size: 14px; line-height: 1.8; padding: 4px 0;">
                                <span style="margin-right: 8px;">•</span>Vui lòng có mặt trước <strong>15 phút</strong> so với giờ hẹn
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #92400e; font-size: 14px; line-height: 1.8; padding: 4px 0;">
                                <span style="margin-right: 8px;">•</span>Mang theo giấy tờ tùy thân và thẻ BHYT (nếu có)
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #92400e; font-size: 14px; line-height: 1.8; padding: 4px 0;">
                                <span style="margin-right: 8px;">•</span>Nếu cần hủy lịch, vui lòng thông báo trước <strong>24 giờ</strong>
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #92400e; font-size: 14px; line-height: 1.8; padding: 4px 0;">
                                <span style="margin-right: 8px;">•</span>Để hủy lịch, truy cập "Lịch hẹn của tôi" và chọn lý do hủy
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/patient/appointments" 
                             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
                             Xem lịch hẹn của tôi
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Help Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                      <tr>
                        <td align="center">
                          <p style="color: #718096; font-size: 14px; margin: 0 0 12px;">Cần hỗ trợ? Liên hệ với chúng tôi</p>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="padding: 0 12px;">
                                <span style="color: #667eea; font-size: 14px;"> 1900-xxxx</span>
                              </td>
                              <td style="padding: 0 12px; border-left: 1px solid #e2e8f0;">
                                <span style="color: #667eea; font-size: 14px;">✉️ support@yourmedicare.vn</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px; line-height: 1.6;">
                      Email này được gửi tự động từ hệ thống <strong style="color: #667eea;">YourMedicare</strong>
                    </p>
                    <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
                      © 2025 YourMedicare. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(' Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(' Error sending email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Gửi email thông báo hủy lịch
 */
async function sendCancellationNotification({ 
  patientEmail, 
  patientName, 
  doctorName, 
  specialty,
  appointmentDate,
  appointmentTime,
  cancellationReason 
}) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: 'Xác nhận hủy lịch khám - YourMedicare',
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận hủy lịch khám</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa; padding: 20px 0;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);">
                
                <!-- Header with Red Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
                    <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; line-height: 80px; font-size: 40px;">
                      🏥
                    </div>
                    <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px;">YourMedicare</h1>
                    <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.95); font-weight: 400;">Thông báo hủy lịch khám</p>
                  </td>
                </tr>
                
                <!-- Cancellation Badge -->
                <tr>
                  <td style="padding: 0 30px;">
                    <div style="background: linear-gradient(135deg, #f5576c 0%, #e74c3c 100%); margin: -30px auto 0; padding: 12px 24px; border-radius: 50px; text-align: center; max-width: 250px; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);">
                      <span style="color: #ffffff; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">✗ LỊCH HẸN ĐÃ HỦY</span>
                    </div>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px 30px 30px;">
                    <h2 style="color: #1a1a1a; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Xin chào ${patientName},</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 30px;">
                      Lịch hẹn của bạn tại <strong style="color: #667eea;">YourMedicare</strong> đã được 
                      <strong style="color: #f5576c;">hủy thành công</strong>.
                    </p>
                    
                    <!-- Cancelled Appointment Details Card -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fff5f5 0%, #fee 100%); border-radius: 12px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(245, 87, 108, 0.08);">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="color: #f5576c; margin: 0 0 20px; font-size: 18px; font-weight: 600;">
                            <span style="margin-right: 8px;">📋</span>Thông tin lịch hẹn đã hủy
                          </h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #991b1b; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;"></span><strong>Bác sĩ</strong>
                                    </td>
                                    <td style="color: #1a1a1a; font-size: 15px; font-weight: 600; text-align: right;">
                                      ${doctorName}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #991b1b; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;"></span><strong>Chuyên khoa</strong>
                                    </td>
                                    <td style="color: #1a1a1a; font-size: 15px; font-weight: 600; text-align: right;">
                                      ${specialty}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #991b1b; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;"></span><strong>Ngày khám</strong>
                                    </td>
                                    <td style="color: #1a1a1a; font-size: 15px; font-weight: 600; text-align: right;">
                                      ${appointmentDate}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #991b1b; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;"></span><strong>Giờ khám</strong>
                                    </td>
                                    <td style="color: #f5576c; font-size: 18px; font-weight: 700; text-align: right; text-decoration: line-through; opacity: 0.6;">
                                      ${appointmentTime}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="color: #991b1b; font-size: 14px; padding-right: 12px; vertical-align: top; width: 140px;">
                                      <span style="margin-right: 6px;"></span><strong>Lý do hủy</strong>
                                    </td>
                                    <td style="color: #1a1a1a; font-size: 14px; font-style: italic; text-align: right;">
                                      ${cancellationReason}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Message -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; overflow: hidden;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #1e40af; font-size: 15px; line-height: 1.7; margin: 0;">
                            <span style="margin-right: 6px;"></span>
                            Nếu bạn muốn đặt lịch khám mới, chúng tôi luôn sẵn sàng phục vụ bạn 24/7.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking" 
                             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
                            📅 Đặt lịch khám mới
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Help Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                      <tr>
                        <td align="center">
                          <p style="color: #718096; font-size: 14px; margin: 0 0 12px;">Cần hỗ trợ? Liên hệ với chúng tôi</p>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="padding: 0 12px;">
                                <span style="color: #667eea; font-size: 14px;"> 1900-xxxx</span>
                              </td>
                              <td style="padding: 0 12px; border-left: 1px solid #e2e8f0;">
                                <span style="color: #667eea; font-size: 14px;">✉️ support@yourmedicare.vn</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px; line-height: 1.6;">
                      Email này được gửi tự động từ hệ thống <strong style="color: #667eea;">YourMedicare</strong>
                    </p>
                    <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
                      © 2025 YourMedicare. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Cancellation email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Gửi email kích hoạt tài khoản
 */
async function sendActivationEmail({ 
  email, 
  name, 
  activationCode 
}) {
  const activationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/activate?code=${activationCode}&email=${encodeURIComponent(email)}`
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Kích hoạt tài khoản YourMedicare',
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kích hoạt tài khoản</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #2563eb; padding: 48px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 700;">🏥 YourMedicare</h1>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: #dbeafe;">Kích hoạt tài khoản</p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Xin chào ${name}!</h2>
                    
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
                      Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất, vui lòng sử dụng mã kích hoạt bên dưới:
                    </p>
                    
                    <!-- Activation Code -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                      <tr>
                        <td align="center" style="padding: 32px; background-color: #eff6ff; border-radius: 8px;">
                          <p style="color: #64748b; font-size: 14px; margin: 0 0 12px; font-weight: 500;">MÃ KÍCH HOẠT</p>
                          <div style="font-size: 36px; font-weight: 700; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${activationCode}
                          </div>
                          <p style="color: #94a3b8; font-size: 13px; margin: 12px 0 0 0;">Có hiệu lực trong 5 phút</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                      <tr>
                        <td align="center">
                          <a href="${activationUrl}" 
                             style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Kích hoạt ngay
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative Link -->
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; padding: 20px; background-color: #f8fafc; border-radius: 6px; border-left: 3px solid #2563eb;">
                      <strong>Hoặc nhấn vào link:</strong><br>
                      <a href="${activationUrl}" style="color: #2563eb; word-break: break-all; text-decoration: underline;">${activationUrl}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                      © 2025 YourMedicare. Hệ thống đặt lịch khám bệnh.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Activation email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error sending activation email:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendAppointmentConfirmation,
  sendCancellationNotification,
  sendActivationEmail
}
