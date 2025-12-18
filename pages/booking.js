import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function Booking({ doctor }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookedSlots, setBookedSlots] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState({ title: '', message: '', type: 'success' })
  const router = useRouter()

  // Generate available time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split('T')[0])
  }, [])

  // Fetch booked slots when date changes
  useEffect(() => {
    if (selectedDate && doctor) {
      fetchBookedSlots()
    }
  }, [selectedDate, doctor])

  async function fetchBookedSlots() {
    try {
      const res = await fetch(`/api/appointments/booked-slots?doctorId=${doctor.id}&date=${selectedDate}`)
      if (res.ok) {
        const data = await res.json()
        setBookedSlots(data.bookedSlots || [])
      }
    } catch (err) {
      console.error('Failed to fetch booked slots:', err)
    }
  }

  function showPopupMessage(title, message, type = 'success') {
    setPopupMessage({ title, message, type })
    setShowPopup(true)
  }

  async function handleBooking(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!selectedDate || !selectedTime) {
      showPopupMessage('⚠️ Thiếu thông tin', 'Vui lòng chọn ngày và giờ khám', 'error')
      setLoading(false)
      return
    }

    // Check if slot is already booked
    if (bookedSlots.includes(selectedTime)) {
      showPopupMessage('⚠️ Khung giờ đã được đặt', 'Khung giờ này đã có người đặt. Vui lòng chọn giờ khác.', 'error')
      setLoading(false)
      return
    }

    // Validate date is not in the past
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}:00`)
    const now = new Date()
    
    if (selectedDateTime < now) {
      showPopupMessage('⚠️ Lỗi thời gian', 'Không thể đặt lịch trong quá khứ', 'error')
      setLoading(false)
      return
    }

    try {
      const datetime = new Date(`${selectedDate}T${selectedTime}:00`)
      
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          doctorId: doctor.id,
          datetime: datetime.toISOString()
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        showPopupMessage('Thành công!', 'Đặt lịch khám thành công. Đang chuyển đến trang lịch hẹn...', 'success')
        setTimeout(() => {
          router.push('/patient/appointments')
        }, 2000)
      } else {
        if (res.status === 401) {
          showPopupMessage('Chưa đăng nhập', 'Vui lòng đăng nhập để đặt lịch', 'error')
          setTimeout(() => router.push('/login'), 2000)
        } else if (res.status === 409) {
          showPopupMessage('Khung giờ đã được đặt', data.error || 'Khung giờ này đã có người đặt. Vui lòng chọn giờ khác.', 'error')
          fetchBookedSlots() // Refresh booked slots
        } else {
          showPopupMessage('Lỗi', data.error || 'Đặt lịch thất bại. Vui lòng thử lại.', 'error')
        }
      }
    } catch (err) {
      showPopupMessage('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!doctor) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h3>Không tìm thấy bác sĩ</h3>
          <Link href="/doctors" style={{ marginTop: '16px', display: 'inline-block' }}>
            ← Quay lại danh sách bác sĩ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />

      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '600px' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ color: '#4CAF50', marginBottom: '8px' }}>Đặt lịch thành công!</h2>
              <p style={{ color: '#666' }}>Đang chuyển đến trang lịch hẹn...</p>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <h2>📅 Đặt lịch khám</h2>
                <p>Chọn thời gian phù hợp để đặt lịch</p>
              </div>

              <div style={{ 
                background: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%',
                  background: doctor.profileImage ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: '700',
                  margin: '0 auto 12px',
                  overflow: 'hidden'
                }}>
                  {doctor.profileImage ? (
                    <img 
                      src={doctor.profileImage} 
                      alt={doctor.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    doctor.name.charAt(0).toUpperCase()
                  )}
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{doctor.name}</h3>
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: 'white',
                  color: '#667eea',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  🏥 {doctor.specialty}
                </div>
                {doctor.bio && (
                  <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>
                    {doctor.bio}
                  </p>
                )}
              </div>

              {selectedDate && selectedTime && (
                <div style={{
                  background: '#f0f0ff',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid #667eea'
                }}>
                  <div style={{ fontSize: '14px', color: '#667eea', fontWeight: '600', marginBottom: '8px' }}>
                    📋 Thông tin đặt lịch
                  </div>
                  <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.8' }}>
                    <div>👨‍⚕️ Bác sĩ: <strong>{doctor.name}</strong></div>
                    <div>🏥 Chuyên khoa: <strong>{doctor.specialty}</strong></div>
                    <div>📅 Ngày khám: <strong>{new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
                    <div>🕐 Giờ khám: <strong>{selectedTime}</strong></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleBooking}>
                <div className="form-group">
                  <label>📆 Chọn ngày khám</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>🕐 Chọn giờ khám</label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    {timeSlots.map(time => {
                      // Check if this time is in the past for today
                      const isToday = selectedDate === new Date().toISOString().split('T')[0]
                      const currentTime = new Date().toTimeString().slice(0, 5)
                      const isPast = isToday && time < currentTime
                      
                      // Check if this slot is already booked
                      const isBooked = bookedSlots.includes(time)
                      const isDisabled = isPast || isBooked
                      
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => !isDisabled && setSelectedTime(time)}
                          disabled={isDisabled}
                          style={{
                            padding: '10px',
                            border: selectedTime === time 
                              ? '2px solid #2563eb' 
                              : '1px solid #ddd',
                            background: isDisabled 
                              ? '#e5e7eb'
                              : selectedTime === time 
                                ? '#dbeafe' 
                                : 'white',
                            color: isDisabled
                              ? '#9ca3af'
                              : selectedTime === time 
                                ? '#2563eb' 
                                : '#333',
                            borderRadius: '8px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: selectedTime === time ? '600' : '400',
                            transition: 'all 0.2s ease',
                            opacity: isDisabled ? 0.6 : 1,
                            position: 'relative'
                          }}
                        >
                          {time}
                          {isBooked && (
                            <div style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '6px',
                              height: '6px',
                              background: '#dc2626',
                              borderRadius: '50%'
                            }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', marginTop: '12px', marginBottom: 0, lineHeight: '1.6' }}>
                    💡 Khung giờ xám là giờ đã có người đặt, bạn vui lòng đặt khung giờ khác
                  </p>
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
                </button>
              </form>

              <div className="form-footer" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                <Link href={`/doctors?specialty=${encodeURIComponent(doctor.specialty)}`}>
                  ← Quay lại danh sách bác sĩ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowPopup(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'popupSlideIn 0.3s ease-out',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '16px',
              animation: 'popupBounce 0.5s ease-out'
            }}>
              {popupMessage.type === 'success' ? '✅' : popupMessage.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '24px',
              color: popupMessage.type === 'success' ? '#16a34a' : popupMessage.type === 'error' ? '#dc2626' : '#2563eb',
              fontWeight: '700'
            }}>
              {popupMessage.title}
            </h3>
            
            <p style={{ 
              margin: '0 0 24px 0', 
              fontSize: '15px', 
              color: '#666',
              lineHeight: '1.6'
            }}>
              {popupMessage.message}
            </p>
            
            <button
              onClick={() => setShowPopup(false)}
              style={{
                padding: '12px 32px',
                background: popupMessage.type === 'success' 
                  ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' 
                  : popupMessage.type === 'error'
                    ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'transform 0.2s ease',
                width: '100%'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes popupBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </>
  )
}

export async function getServerSideProps({ query }) {
  const { doctorId } = query

  if (!doctorId) {
    return { props: { doctor: null } }
  }

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    const doctor = await prisma.user.findUnique({
      where: { 
        id: parseInt(doctorId),
        role: 'doctor'
      },
      include: {
        doctorprofile: {
          include: {
            specialty: true
          }
        }
      }
    })

    await prisma.$disconnect()

    if (!doctor || !doctor.doctorprofile) {
      return { props: { doctor: null } }
    }

    // Format the doctor data
    const formattedDoctor = {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      profileImage: doctor.doctorprofile?.profileImage || null,
      specialty: doctor.doctorprofile?.specialty?.name || 'Chưa xác định',
      bio: doctor.doctorprofile?.bio || null,
      degree: doctor.doctorprofile?.degree || null,
      experience: doctor.doctorprofile?.experience || null,
      fees: doctor.doctorprofile?.fees || null
    }
    
    return { props: { doctor: formattedDoctor } }
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return { props: { doctor: null } }
  }
}
