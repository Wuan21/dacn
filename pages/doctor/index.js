import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function DoctorDashboard(){
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
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
        loadStats()
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

  async function loadStats() {
    try {
      const res = await fetch('/api/doctor/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <Link href="/" className="nav-logo">🏥 YourMedicare</Link>
          <div className="nav-links">
            <Link href="/doctor">Dashboard</Link>
            <Link href="/doctor/appointments">Lịch hẹn</Link>
            <Link href="/doctor/patients">Bệnh nhân</Link>
            <Link href="/doctor/profile">Hồ sơ</Link>
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
            👨‍⚕️ Dashboard Bác sĩ
          </h1>
          <p style={{ color: '#666' }}>
            Chào mừng trở lại, Dr. {user?.name}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#666' }}>Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Tổng lịch hẹn</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>{stats?.total || 0}</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Chờ xác nhận</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats?.pending || 0}</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Hôm nay</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats?.today || 0}</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Hoàn thành</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{stats?.completed || 0}</div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📊</span> Thống kê chi tiết
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>📅 Tuần này</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{stats?.thisWeek || 0} lịch hẹn</div>
                </div>

                <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>📆 Tháng này</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>{stats?.thisMonth || 0} lịch hẹn</div>
                </div>

                <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>👥 Bệnh nhân khác nhau</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{stats?.uniquePatients || 0} người</div>
                </div>

                <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>📋 Hồ sơ khám</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>{stats?.withRecords || 0} hồ sơ</div>
                </div>
              </div>
            </div>

            {/* Status Breakdown Chart */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📈</span> Phân bổ trạng thái lịch hẹn
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ padding: '16px', background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#2d3436', marginBottom: '8px', fontWeight: '500' }}>⏳ Chờ xác nhận</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#2d3436' }}>
                    {stats?.pending || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#2d3436', marginTop: '4px', opacity: 0.8 }}>
                    {((stats?.pending || 0) / (stats?.total || 1) * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'white', marginBottom: '8px', fontWeight: '500' }}>✓ Đã xác nhận</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                    {stats?.confirmed || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'white', marginTop: '4px', opacity: 0.9 }}>
                    {((stats?.confirmed || 0) / (stats?.total || 1) * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'white', marginBottom: '8px', fontWeight: '500' }}>✓ Hoàn thành</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                    {stats?.completed || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'white', marginTop: '4px', opacity: 0.9 }}>
                    {((stats?.completed || 0) / (stats?.total || 1) * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'white', marginBottom: '8px', fontWeight: '500' }}>✕ Đã hủy</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                    {stats?.cancelled || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'white', marginTop: '4px', opacity: 0.9 }}>
                    {((stats?.cancelled || 0) / (stats?.total || 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#333', fontSize: '16px' }}>🚀 Thao tác nhanh</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href="/doctor/appointments" style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    📅 Xem lịch hẹn
                  </Link>
                  <Link href="/doctor/patients" style={{
                    padding: '12px 24px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    👥 Quản lý bệnh nhân
                  </Link>
                  <Link href="/doctor/profile" style={{
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    ⚙️ Cập nhật hồ sơ
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}


