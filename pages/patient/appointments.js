import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'

export default function MyAppointments(){
  const [appointments, setAppointments] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)
  const router = useRouter()

  useEffect(()=>{
    checkAuth()
    loadAppointments()
  },[])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        router.push('/login')
      }
    } catch (err) {
      router.push('/login')
    }
  }

  async function loadAppointments() {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleCancel(id) {
    setAppointmentToCancel(id)
    setCancelReason('')
    setShowCancelModal(true)
  }

  async function confirmCancel() {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy lịch hẹn')
      return
    }
    
    // Kiểm tra thời gian hủy (client-side check trước khi gọi API)
    const appointment = appointments.find(a => a.id === appointmentToCancel)
    if (appointment) {
      const appointmentTime = new Date(appointment.appointmentDate)
      const now = new Date()
      const hoursDiff = (appointmentTime - now) / (1000 * 60 * 60)
      
      if (hoursDiff < 2) {
        alert('⚠️ Chỉ có thể hủy lịch trước 2 giờ so với giờ khám.\n\nThời gian khám: ' + appointmentTime.toLocaleString('vi-VN') + '\nVui lòng liên hệ trực tiếp với bệnh viện nếu cần hủy gấp.')
        return
      }
      
      if (appointment.status === 'completed') {
        alert('⚠️ Không thể hủy lịch hẹn đã hoàn thành')
        return
      }
    }
    
    try {
      const res = await fetch(`/api/appointments/${appointmentToCancel}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          status: 'cancelled',
          cancellationReason: cancelReason.trim()
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('✅ Đã hủy lịch hẹn thành công!')
        loadAppointments()
        setShowDetailModal(false)
        setShowCancelModal(false)
        setCancelReason('')
        setAppointmentToCancel(null)
      } else {
        alert(data.error || 'Không thể hủy lịch hẹn')
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      alert('Có lỗi xảy ra khi hủy lịch hẹn')
    }
  }

  function handleViewDetail(appointment) {
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
  }

  function handleBookNew() {
    router.push('/doctors')
  }

  function getStatusBadge(status) {
    const styles = {
      pending: { 
        bg: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)', 
        color: '#2d3436', 
        text: '⏳ Chờ xác nhận',
        icon: '⏳'
      },
      confirmed: { 
        bg: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', 
        color: 'white', 
        text: '✓ Đã xác nhận',
        icon: '✓'
      },
      completed: { 
        bg: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)', 
        color: 'white', 
        text: '✓ Hoàn thành',
        icon: '✓'
      },
      cancelled: { 
        bg: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)', 
        color: 'white', 
        text: '✕ Đã hủy',
        icon: '✕'
      }
    }
    const style = styles[status] || styles.pending
    return (
      <span style={{
        padding: '8px 16px',
        background: style.bg,
        color: style.color,
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap'
      }}>
        {style.text}
      </span>
    )
  }

  return (
    <>
      <Navbar />

      <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="container" style={{ paddingTop: '40px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', color: '#1e3a8a', marginBottom: '8px', fontWeight: '700' }}>
              Lịch hẹn của tôi
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Quản lý và theo dõi các lịch khám bệnh
            </p>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#666', fontSize: '16px' }}>Đang tải...</p>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 40px', 
              background: 'white', 
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                margin: '0 auto 24px'
              }}>📅</div>
              <h3 style={{ color: '#1a1a1a', marginBottom: '12px', fontSize: '24px', fontWeight: '600' }}>Chưa có lịch hẹn</h3>
              <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>Đặt lịch khám với bác sĩ ngay hôm nay để được tư vấn sức khỏe</p>
              <Link href="/doctors">
                <button style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.3s ease'
                }}>
                  📅 Đặt lịch ngay
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {appointments.map(a => {
                const appointmentDate = new Date(a.appointmentDate)
                const isUpcoming = appointmentDate > new Date() && a.status !== 'cancelled'
                
                return (
                  <div key={a.id} style={{
                    background: 'white',
                    padding: '28px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: isUpcoming ? '2px solid #667eea' : '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {isUpcoming && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        color: 'white',
                        padding: '6px 20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderBottomLeftRadius: '12px'
                      }}>
                        ⭐ Sắp tới
                      </div>
                    )}
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '20px'
                    }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                          <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            fontWeight: '700',
                            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                          }}>
                            {a.doctorName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#1a1a1a', fontWeight: '600' }}>
                              {a.doctorName}
                            </h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#667eea', fontWeight: '500' }}>
                              👨‍⚕️ Bác sĩ chuyên khoa
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px',
                          padding: '16px',
                          background: '#f9fafb',
                          borderRadius: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>📅</span>
                            <div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Ngày khám</div>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                                {appointmentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>🕐</span>
                            <div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Giờ khám</div>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a' }}>
                                {appointmentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                        {getStatusBadge(a.status)}
                        
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleViewDetail(a)}
                            style={{
                              padding: '10px 20px',
                              background: 'white',
                              color: '#2563eb',
                              border: '2px solid #2563eb',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'all 0.3s ease',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#2563eb'
                              e.currentTarget.style.color = 'white'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'white'
                              e.currentTarget.style.color = '#2563eb'
                            }}
                          >
                            📋 Xem chi tiết
                          </button>
                          
                          {(a.status === 'pending' || a.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancel(a.id)}
                              style={{
                                padding: '10px 20px',
                                background: 'white',
                                color: '#dc3545',
                                border: '2px solid #dc3545',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#dc3545'
                                e.currentTarget.style.color = 'white'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'white'
                                e.currentTarget.style.color = '#dc3545'
                              }}
                            >
                              ✕ Hủy lịch
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              borderRadius: '20px 20px 0 0'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
                Chi tiết lịch hẹn
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '32px' }}>
              {/* Doctor Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px',
                padding: '20px',
                background: '#f9fafb',
                borderRadius: '16px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}>
                  {selectedAppointment.doctorName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#1a1a1a', fontWeight: '600' }}>
                    {selectedAppointment.doctorName}
                  </h3>
                  <p style={{ margin: 0, fontSize: '15px', color: '#667eea', fontWeight: '500' }}>
                    👨‍⚕️ Bác sĩ chuyên khoa
                  </p>
                </div>
              </div>

              {/* Appointment Details */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', color: '#666', marginBottom: '16px', fontWeight: '600' }}>
                  Thông tin lịch hẹn
                </h4>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'white',
                    border: '2px solid #f0f0f0',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>📅</span>
                    <div>
                      <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Ngày khám</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'white',
                    border: '2px solid #f0f0f0',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>🕐</span>
                    <div>
                      <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Giờ khám</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                        {new Date(selectedAppointment.appointmentDate).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'white',
                    border: '2px solid #f0f0f0',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>📋</span>
                    <div>
                      <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Trạng thái</div>
                      <div>{getStatusBadge(selectedAppointment.status)}</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'white',
                    border: '2px solid #f0f0f0',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>🔖</span>
                    <div>
                      <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Mã lịch hẹn</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                        #{selectedAppointment.id.toString().padStart(6, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(selectedAppointment.id)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'white',
                      color: '#dc3545',
                      border: '2px solid #dc3545',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#dc3545'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.color = '#dc3545'
                    }}
                  >
                    ✕ Hủy lịch hẹn
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#1a1a1a' }}>Hủy lịch hẹn</h2>
                <p style={{ margin: '8px 0 0', color: '#666' }}>Vui lòng cho biết lý do hủy lịch hẹn</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Lý do hủy <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy lịch hẹn..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelReason('')
                    setAppointmentToCancel(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}
                >
                  Đóng
                </button>
                <button
                  onClick={confirmCancel}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                  }}
                >
                  ✕ Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

