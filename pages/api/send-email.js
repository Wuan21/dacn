// pages/api/send-email.js
import { sendAppointmentConfirmation, sendCancellationNotification } from '../../lib/emailService'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { type, data } = req.body

    let result

    switch (type) {
      case 'appointmentConfirmation':
        result = await sendAppointmentConfirmation(data)
        break
      
      case 'cancellationNotification':
        result = await sendCancellationNotification(data)
        break
      
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email type' 
        })
    }

    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.messageId 
      })
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send email',
        error: result.error 
      })
    }
  } catch (error) {
    console.error('Error in send-email API:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    })
  }
}
