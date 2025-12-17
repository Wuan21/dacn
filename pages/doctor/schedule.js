import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function DoctorSchedule(){
  const [appointments, setAppointments] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, today, week
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(()=>{
    checkAuth()
  },[])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.role !== 'doctor') {
          router.push('/')
          return
        }
        setUser(data)
        loadAppointments()
        loadProfile()
      } else {
        router.push('/login')
      }
    } catch (err) {
      router.push('/login')
    }
  }

  async function loadProfile() {
    try {
      const res = await fetch('/api/doctor/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (err) {
      console.error(err)
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

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (res.ok) {
        loadAppointments()
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  function getStatusBadge(status) {
    const styles = {
      pending: { bg: '#fff3cd', color: '#856404', text: 'Chờ xác nhận' },
      confirmed: { bg: '#d1ecf1', color: '#0c5460', text: 'Đã xác nhận' },
      completed: { bg: '#d4edda', color: '#155724', text: 'Hoàn thành' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Đã hủy' }
    }
    const style = styles[status] || styles.pending
    return (
      <span style={{
        padding: '4px 12px',
        background: style.bg,
        color: style.color,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500'
      }}>
        {style.text}
      </span>
    )
  }

  function filterAppointments(appts) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekLater = new Date(today)
    weekLater.setDate(weekLater.getDate() + 7)

    return appts.filter(a => {
      const apptDate = new Date(a.appointmentDate)
      if (filter === 'today') {
        return apptDate.toDateString() === today.toDateString()
      }
      if (filter === 'week') {
        return apptDate >= today && apptDate < weekLater
      }
      return true
    })
  }

  const filteredAppointments = filterAppointments(appointments)
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    today: appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <Link href="/" className="nav-logo">🏥 YourMedicare</Link>
          <div className="nav-links">
            <Link href="/doctor/schedule">Lịch khám</Link>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              paddingLeft: '12px',
              borderLeft: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: profile?.doctorProfile?.profileImage ? 'transparent' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                overflow: 'hidden',
                border: profile?.doctorProfile?.profileImage ? '2px solid #e5e7eb' : 'none',
                flexShrink: 0
              }}>
                {profile?.doctorProfile?.profileImage ? (
                  <img src={profile.doctorProfile.profileImage} alt={profile?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'D'
                )}
              </div>
              <button onClick={async () => {
                await fetch('/api/auth/logout')
                window.location.href = '/'
              }} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '8px 16px', fontSize: '15px', fontWeight: '500' }}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: '#1a1a1a', marginBottom: '8px' }}>
            Lịch khám bệnh
          </h1>
          <p style={{ color: '#666' }}>
            Quản lý lịch hẹn và bệnh nhân
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Tổng lịch hẹn</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>{stats.total}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Chờ xác nhận</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats.pending}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Hôm nay</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.today}</div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '10px 20px',
              background: filter === 'all' ? '#2563eb' : 'white',
              color: filter === 'all' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('today')}
            style={{
              padding: '10px 20px',
              background: filter === 'today' ? '#2563eb' : 'white',
              color: filter === 'today' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setFilter('week')}
            style={{
              padding: '10px 20px',
              background: filter === 'week' ? '#2563eb' : 'white',
              color: filter === 'week' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Tuần này
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#666' }}>Đang tải...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ color: '#666', marginBottom: '8px' }}>Không có lịch hẹn</h3>
            <p style={{ color: '#999' }}>Chưa có lịch hẹn nào trong khoảng thời gian này</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredAppointments.map(a => (
              <div key={a.id} style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '700'
                    }}>
                      {a.patientName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a1a' }}>
                        {a.patientName}
                      </h3>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        📅 {new Date(a.appointmentDate).toLocaleDateString('vi-VN')} • 
                        🕐 {new Date(a.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(a.status)}
                </div>

                {a.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => updateStatus(a.id, 'confirmed')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      ✓ Xác nhận
                    </button>
                    <button
                      onClick={() => updateStatus(a.id, 'cancelled')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      ✗ Hủy
                    </button>
                  </div>
                )}

                {a.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(a.id, 'completed')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    ✓ Hoàn thành khám
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

