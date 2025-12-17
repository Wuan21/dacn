import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'

export default function PatientDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [recentAppointments, setRecentAppointments] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch appointments
      const appointmentsRes = await fetch('/api/appointments')
      const appointments = await appointmentsRes.json()
      
      // Fetch medical records
      const recordsRes = await fetch('/api/patient/medical-records')
      const records = await recordsRes.json()
      
      // Calculate stats
      const now = new Date()
      const upcomingAppointments = appointments.filter(apt => 
        apt.status === 'confirmed' && new Date(apt.appointmentDate) > now
      )
      
      const stats = {
        totalAppointments: appointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        totalMedicalRecords: records.length
      }
      
      setStats(stats)
      setRecentAppointments(appointments.slice(0, 5))
      setRecentRecords(records.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      alert('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ xác nhận', color: '#ffc107', bg: '#fff8e1' },
      confirmed: { text: 'Đã xác nhận', color: '#28a745', bg: '#e8f5e9' },
      completed: { text: 'Hoàn thành', color: '#17a2b8', bg: '#e0f7fa' },
      cancelled: { text: 'Đã hủy', color: '#dc3545', bg: '#ffebee' }
    }
    const style = statusMap[status] || statusMap.pending
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: style.color,
        background: style.bg
      }}>
        {style.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{
          minHeight: '100vh',
          background: '#f8fafc',
          padding: '40px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ color: '#333', fontSize: '18px' }}>Đang tải...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '40px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              color: '#1e3a8a',
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              Dashboard Bệnh Nhân
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Tổng quan về lịch hẹn và hồ sơ khám bệnh của bạn
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '16px'
              }}>
                📅
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                {stats?.totalAppointments || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Tổng lịch hẹn</div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '16px'
              }}>
                ✅
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                {stats?.upcomingAppointments || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Lịch hẹn sắp tới</div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '16px'
              }}>
                ✔️
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                {stats?.completedAppointments || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Đã hoàn thành</div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '16px'
              }}>
                📋
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                {stats?.totalMedicalRecords || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Hồ sơ khám bệnh</div>
            </div>
          </div>

          {/* Recent Appointments & Medical Records */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px'
          }}>
            {/* Recent Appointments */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
                  Lịch hẹn gần đây
                </h2>
                <button
                  onClick={() => router.push('/patient/appointments')}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Xem tất cả
                </button>
              </div>

              {recentAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                  <div>Chưa có lịch hẹn nào</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentAppointments.map(appointment => (
                    <div key={appointment.id} style={{
                      padding: '16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = '#2563eb'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = '#e0e0e0'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                            {appointment.doctor?.name || 'Bác sĩ'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {appointment.doctor?.specialty?.name || 'Chuyên khoa'}
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        🕒 {formatDate(appointment.appointmentDate)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Medical Records */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
                  Hồ sơ khám gần đây
                </h2>
                <button
                  onClick={() => router.push('/patient/medical-records')}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Xem tất cả
                </button>
              </div>

              {recentRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <div>Chưa có hồ sơ khám bệnh</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentRecords.map(record => (
                    <div key={record.id} style={{
                      padding: '16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = '#2563eb'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = '#e0e0e0'
                    }}>
                      <div style={{ fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                        {record.diagnosis}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                        Bác sĩ: {record.appointment?.doctor?.name || 'N/A'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        🕒 {formatDate(record.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            marginTop: '40px',
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '24px' }}>
              Thao tác nhanh
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '32px' }}>📅</span>
                Đặt lịch hẹn mới
              </button>
              
              <button
                onClick={() => router.push('/patient/appointments')}
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '32px' }}>📋</span>
                Quản lý lịch hẹn
              </button>
              
              <button
                onClick={() => router.push('/patient/medical-records')}
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '32px' }}>📄</span>
                Xem hồ sơ khám
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
