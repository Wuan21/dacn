import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function Booking({ doctor }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bookedSlots, setBookedSlots] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState({ title: '', message: '', type: 'success' })
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const router = useRouter()

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split('T')[0])
    fetchServices()
    fetchPackages()
  }, [])

  // Fetch available slots from doctor's work schedule when date changes
  useEffect(() => {
    if (selectedDate && doctor) {
      fetchAvailableSlots()
    }
  }, [selectedDate, doctor])

  async function fetchAvailableSlots() {
    setLoadingSlots(true)
    try {
      // Fetch slots từ API public (không cần authentication)
      // Truyền doctorProfileId thay vì userId
      const res = await fetch(`/api/doctors/${doctor.doctorProfileId}/slots?date=${selectedDate}`)
      
      if (res.ok) {
        const data = await res.json()
        
        // Flatten all slots từ các ca làm việc
        const allSlots = []
        if (data.schedules && data.schedules.length > 0) {
          data.schedules.forEach(schedule => {
            schedule.slots.forEach(slot => {
              allSlots.push({
                time: slot.startTime,
                isBooked: slot.isBooked,
                shift: schedule.shift
              })
            })
          })
        }
        
        setAvailableSlots(allSlots)
        
        // Cập nhật bookedSlots cho checking
        const booked = allSlots.filter(s => s.isBooked).map(s => s.time)
        setBookedSlots(booked)
      } else {
        setAvailableSlots([])
        setBookedSlots([])
      }
    } catch (err) {
      console.error('Failed to fetch available slots:', err)
      setAvailableSlots([])
      setBookedSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  async function fetchServices() {
    try {
      const res = await fetch('/api/services?isActive=true')
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  async function fetchPackages() {
    try {
      const res = await fetch('/api/services/packages?isActive=true')
      if (res.ok) {
        const data = await res.json()
        setPackages(data)
      }
    } catch (err) {
      console.error('Failed to fetch packages:', err)
    }
  }

  function showPopupMessage(title, message, type = 'success') {
    setPopupMessage({ title, message, type })
    setShowPopup(true)
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  function toggleService(serviceId) {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId))
    } else {
      setSelectedServices([...selectedServices, serviceId])
    }
  }

  function getTotalPrice() {
    let total = doctor.fees || 0
    
    // Add package price if selected
    if (selectedPackage) {
      const pkg = packages.find(p => p.id === selectedPackage)
      if (pkg) total += parseFloat(pkg.price)
    }
    
    // Add individual services only if no package selected
    if (!selectedPackage) {
      selectedServices.forEach(serviceId => {
        const service = services.find(s => s.id === serviceId)
        if (service) total += service.price
      })
    }
    
    return total
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
          doctorProfileId: doctor.doctorProfileId,
          datetime: datetime.toISOString(),
          symptoms: symptoms.trim() || null,
          serviceIds: selectedServices
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
          fetchAvailableSlots() // Refresh available slots
        } else if (res.status === 400) {
          showPopupMessage('Lỗi', data.error || 'Thông tin đặt lịch không hợp lệ', 'error')
          if (data.error && data.error.includes('lịch làm việc')) {
            fetchAvailableSlots() // Refresh if schedule issue
          }
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
                  
                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      Đang tải lịch khám...
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div style={{ 
                      padding: '20px', 
                      background: '#fef3c7', 
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      color: '#92400e',
                      textAlign: 'center'
                    }}>
                      Bác sĩ không có lịch làm việc trong ngày này. Vui lòng chọn ngày khác.
                    </div>
                  ) : (
                    <>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '8px',
                        marginTop: '8px'
                      }}>
                        {availableSlots.map(slot => {
                          // Check if this time is in the past for today
                          const isToday = selectedDate === new Date().toISOString().split('T')[0]
                          const currentTime = new Date().toTimeString().slice(0, 5)
                          const isPast = isToday && slot.time < currentTime
                          
                          const isDisabled = isPast || slot.isBooked
                          
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => !isDisabled && setSelectedTime(slot.time)}
                              disabled={isDisabled}
                              style={{
                                padding: '10px',
                                border: selectedTime === slot.time 
                                  ? '2px solid #2563eb' 
                                  : '1px solid #ddd',
                                background: isDisabled 
                                  ? '#e5e7eb'
                                  : selectedTime === slot.time 
                                    ? '#dbeafe' 
                                    : 'white',
                                color: isDisabled
                                  ? '#9ca3af'
                                  : selectedTime === slot.time 
                                    ? '#2563eb' 
                                    : '#333',
                                borderRadius: '8px',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: selectedTime === slot.time ? '600' : '400',
                                transition: 'all 0.2s ease',
                                opacity: isDisabled ? 0.6 : 1,
                                position: 'relative'
                              }}
                            >
                              {slot.time}
                              {slot.isBooked && (
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
                    </>
                  )}
                </div>

                {/* Package Selection */}
                {packages.length > 0 && (
                  <div className="form-group">
                    <label>📦 Gói khám (tùy chọn)</label>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px', marginBottom: '12px' }}>
                      Chọn gói khám để được ưu đãi. Nếu chọn gói khám, bạn không thể chọn thêm dịch vụ đơn lẻ.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                      {packages.map(pkg => (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            setSelectedPackage(selectedPackage === pkg.id ? null : pkg.id)
                            if (selectedPackage !== pkg.id) {
                              setSelectedServices([]) // Clear selected services when selecting a package
                            }
                          }}
                          style={{
                            padding: '16px',
                            border: selectedPackage === pkg.id ? '2px solid #0d9488' : '1px solid #e5e7eb',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: selectedPackage === pkg.id ? '#f0fdfa' : 'white',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                        >
                          {/* Popular Badge */}
                          {pkg.isPopular && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              ⭐ Phổ biến
                            </div>
                          )}
                          
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              flexShrink: 0
                            }}>
                              {pkg.icon || '📦'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontWeight: '600',
                                color: '#1f2937',
                                marginBottom: '4px',
                                fontSize: '15px'
                              }}>
                                {pkg.name}
                              </div>
                              <div style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                marginBottom: '8px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {pkg.description}
                              </div>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '8px',
                                borderTop: '1px solid #e5e7eb'
                              }}>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  color: '#0d9488'
                                }}>
                                  {formatPrice(pkg.price)}
                                </div>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#6b7280',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  ⏱️ {pkg.duration}p
                                </div>
                              </div>
                              <div style={{
                                marginTop: '8px',
                                padding: '6px 8px',
                                background: '#f0fdfa',
                                borderRadius: '6px',
                                fontSize: '11px',
                                color: '#0d9488',
                                fontWeight: '600'
                              }}>
                                ✓ {pkg.items?.length || 0} hạng mục khám
                              </div>
                            </div>
                          </div>
                          
                          {selectedPackage === pkg.id && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              width: '24px',
                              height: '24px',
                              background: '#0d9488',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px'
                            }}>
                              ✓
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>🩺 Triệu chứng</label>
                  <textarea
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    placeholder="Mô tả triệu chứng hoặc lý do khám bệnh (không bắt buộc)"
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {services.length > 0 && !selectedPackage && (
                  <div className="form-group">
                    <label>🏥 Dịch vụ khám (tùy chọn)</label>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px', marginBottom: '12px' }}>
                      Chọn các dịch vụ đơn lẻ nếu không chọn gói khám.
                    </p>
                    <div style={{ marginTop: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                      {services.map(service => (
                        <div
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          style={{
                            padding: '12px',
                            border: selectedServices.includes(service.id) ? '2px solid #2563eb' : '1px solid #ddd',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            background: selectedServices.includes(service.id) ? '#dbeafe' : 'white',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '20px', marginRight: '8px' }}>
                                {service.icon || '🩺'}
                              </span>
                              <strong style={{ fontSize: '15px' }}>{service.name}</strong>
                            </div>
                            {service.description && (
                              <p style={{ 
                                fontSize: '13px', 
                                color: '#666', 
                                margin: '4px 0 0 28px',
                                lineHeight: '1.4'
                              }}>
                                {service.description.length > 60 
                                  ? service.description.substring(0, 60) + '...' 
                                  : service.description}
                              </p>
                            )}
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#2563eb',
                              marginTop: '4px',
                              marginLeft: '28px'
                            }}>
                              ⏱️ {service.duration} phút
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '15px', 
                            fontWeight: '600',
                            color: selectedServices.includes(service.id) ? '#2563eb' : '#333',
                            marginLeft: '12px'
                          }}>
                            {formatPrice(service.price)}
                          </div>
                          {selectedServices.includes(service.id) && (
                            <div style={{ 
                              marginLeft: '8px',
                              color: '#2563eb',
                              fontSize: '20px'
                            }}>
                              ✓
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(doctor.fees > 0 || selectedServices.length > 0) && (
                  <div style={{
                    background: '#f0f9ff',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    border: '2px solid #2563eb'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
                    Chi phí ước tính
                    </div>
                    <div style={{ fontSize: '14px', color: '#333', lineHeight: '2' }}>
                      {doctor.fees > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Phí khám bác sĩ:</span>
                          <strong>{formatPrice(doctor.fees)}</strong>
                        </div>
                      )}
                      {selectedServices.length > 0 && selectedServices.map(serviceId => {
                        const service = services.find(s => s.id === serviceId)
                        return service ? (
                          <div key={serviceId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{service.icon} {service.name}:</span>
                            <strong>{formatPrice(service.price)}</strong>
                          </div>
                        ) : null
                      })}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        marginTop: '8px',
                        borderTop: '2px solid #2563eb',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#2563eb'
                      }}>
                        <span>Tổng cộng:</span>
                        <span>{formatPrice(getTotalPrice())}</span>
                      </div>
                    </div>
                  </div>
                )}

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
    const prisma = require('../lib/prisma')
    
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

    if (!doctor || !doctor.doctorprofile) {
      return { props: { doctor: null } }
    }

    // Format the doctor data - convert Decimal to number for JSON serialization
    const formattedDoctor = {
      id: doctor.id,
      doctorProfileId: doctor.doctorprofile?.id || null,
      name: doctor.name,
      email: doctor.email,
      profileImage: doctor.doctorprofile?.profileImage || null,
      specialty: doctor.doctorprofile?.specialty?.name || 'Chưa xác định',
      bio: doctor.doctorprofile?.bio || null,
      degree: doctor.doctorprofile?.degree || null,
      experience: doctor.doctorprofile?.experience || null,
      fees: doctor.doctorprofile?.fees ? Number(doctor.doctorprofile.fees) : null
    }
    
    return { props: { doctor: formattedDoctor } }
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return { props: { doctor: null } }
  }
}
