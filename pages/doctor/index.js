import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const DAYS_OF_WEEK = [
  { id: 0, name: 'Chủ nhật', short: 'CN' },
  { id: 1, name: 'Thứ 2', short: 'T2' },
  { id: 2, name: 'Thứ 3', short: 'T3' },
  { id: 3, name: 'Thứ 4', short: 'T4' },
  { id: 4, name: 'Thứ 5', short: 'T5' },
  { id: 5, name: 'Thứ 6', short: 'T6' },
  { id: 6, name: 'Thứ 7', short: 'T7' }
]

const SHIFT_ICONS = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌙'
}

export default function DoctorDashboard(){
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [weekSchedule, setWeekSchedule] = useState([])
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
        loadWeekSchedule()
      } else {
        router.push('/login')
      }
    } catch (err) {
      router.push('/login')
    }
  }

  async function loadWeekSchedule() {
    try {
      // Get current week start (Monday)
      const today = new Date()
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(today)
      monday.setDate(today.getDate() + diff)
      monday.setHours(0, 0, 0, 0)
      const weekStartStr = monday.toISOString().split('T')[0]

      const res = await fetch(`/api/doctor/schedule?weekStart=${weekStartStr}`)
      if (res.ok) {
        const data = await res.json()
        setWeekSchedule(data)
      }
    } catch (err) {
      console.error('Error loading schedule:', err)
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
            <Link href="/doctor">Home</Link>
            <Link href="/doctor/appointments">Lịch hẹn</Link>
            <Link href="/doctor/work-schedule">Lịch làm việc</Link>
            <Link href="/doctor/patients">Lịch sử khám bệnh</Link>
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

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', color: '#1a1a1a', marginBottom: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
            👨‍⚕️ Dashboard Bác sĩ
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Chào mừng trở lại, <strong>Dr. {user?.name}</strong>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                padding: '24px', 
                borderRadius: '16px', 
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Tổng lịch hẹn</div>
                  <div style={{ fontSize: '32px' }}>📅</div>
                </div>
                <div style={{ fontSize: '40px', fontWeight: '700' }}>{stats?.total || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Tất cả các lịch hẹn</div>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                padding: '24px', 
                borderRadius: '16px', 
                boxShadow: '0 8px 16px rgba(240, 147, 251, 0.3)',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Chờ xác nhận</div>
                  <div style={{ fontSize: '32px' }}>⏳</div>
                </div>
                <div style={{ fontSize: '40px', fontWeight: '700' }}>{stats?.pending || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Cần xử lý ngay</div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                padding: '24px', 
                borderRadius: '16px', 
                boxShadow: '0 8px 16px rgba(79, 172, 254, 0.3)',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Hôm nay</div>
                  <div style={{ fontSize: '32px' }}>📆</div>
                </div>
                <div style={{ fontSize: '40px', fontWeight: '700' }}>{stats?.today || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Lịch hẹn trong ngày</div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
                padding: '24px', 
                borderRadius: '16px', 
                boxShadow: '0 8px 16px rgba(67, 233, 123, 0.3)',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Hoàn thành</div>
                  <div style={{ fontSize: '32px' }}>✅</div>
                </div>
                <div style={{ fontSize: '40px', fontWeight: '700' }}>{stats?.completed || 0}</div>
                <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '8px' }}>Đã khám xong</div>
              </div>
            </div>

            {/* Weekly Schedule Section */}
            <div style={{ 
              background: 'white', 
              padding: '28px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ 
                  margin: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1a1a1a'
                }}>
                  <span style={{ fontSize: '28px' }}>📋</span> Lịch làm việc tuần này
                </h3>
                <Link href="/doctor/work-schedule" style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.2s ease'
                }}>
                  ⚙️ Quản lý lịch
                </Link>
              </div>

              {weekSchedule.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '12px'
                }}>
                  {DAYS_OF_WEEK.map(day => {
                    const daySchedules = weekSchedule.filter(s => s.dayOfWeek === day.id)
                    const today = new Date().getDay()
                    const isToday = day.id === today

                    return (
                      <div key={day.id} style={{ 
                        background: isToday ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc',
                        padding: '16px',
                        borderRadius: '12px',
                        border: isToday ? 'none' : '2px solid #e5e7eb',
                        minHeight: '160px'
                      }}>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: '700',
                          color: isToday ? 'white' : '#64748b',
                          marginBottom: '4px',
                          textAlign: 'center'
                        }}>
                          {day.short}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: isToday ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                          marginBottom: '12px',
                          textAlign: 'center'
                        }}>
                          {day.name}
                        </div>

                        {daySchedules.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {daySchedules.map((schedule, idx) => (
                              <div key={idx} style={{ 
                                background: isToday ? 'rgba(255,255,255,0.2)' : 'white',
                                padding: '8px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                border: isToday ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e5e7eb'
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  color: isToday ? 'white' : '#334155',
                                  fontWeight: '600',
                                  marginBottom: '4px'
                                }}>
                                  <span>{SHIFT_ICONS[schedule.shift]}</span>
                                  <span style={{ fontSize: '10px' }}>
                                    {schedule.shift === 'morning' ? 'Sáng' : 
                                     schedule.shift === 'afternoon' ? 'Chiều' : 'Tối'}
                                  </span>
                                </div>
                                <div style={{ 
                                  fontSize: '10px', 
                                  color: isToday ? 'rgba(255,255,255,0.9)' : '#64748b'
                                }}>
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '12px 4px',
                            fontSize: '11px',
                            color: isToday ? 'rgba(255,255,255,0.7)' : '#94a3b8'
                          }}>
                            Không có lịch
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '2px dashed #e5e7eb'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                  <p style={{ color: '#64748b', marginBottom: '16px' }}>Chưa có lịch làm việc cho tuần này</p>
                  <Link href="/doctor/work-schedule" style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'inline-block'
                  }}>
                    Thiết lập lịch làm việc
                  </Link>
                </div>
              )}
            </div>

            {/* Detailed Stats */}
            <div style={{ 
              background: 'white', 
              padding: '28px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              marginBottom: '32px' 
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px', fontWeight: '700' }}>
                <span style={{ fontSize: '28px' }}>📊</span> Thống kê chi tiết
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', 
                  borderRadius: '12px', 
                  border: '2px solid #7dd3fc'
                }}>
                  <div style={{ fontSize: '13px', color: '#0c4a6e', marginBottom: '8px', fontWeight: '600' }}>📅 Tuần này</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#0369a1' }}>{stats?.thisWeek || 0}</div>
                  <div style={{ fontSize: '11px', color: '#075985', marginTop: '4px' }}>lịch hẹn</div>
                </div>

                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)', 
                  borderRadius: '12px', 
                  border: '2px solid #a78bfa'
                }}>
                  <div style={{ fontSize: '13px', color: '#4c1d95', marginBottom: '8px', fontWeight: '600' }}>📆 Tháng này</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#6d28d9' }}>{stats?.thisMonth || 0}</div>
                  <div style={{ fontSize: '11px', color: '#5b21b6', marginTop: '4px' }}>lịch hẹn</div>
                </div>

                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 
                  borderRadius: '12px', 
                  border: '2px solid #6ee7b7'
                }}>
                  <div style={{ fontSize: '13px', color: '#064e3b', marginBottom: '8px', fontWeight: '600' }}>👥 Bệnh nhân</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#047857' }}>{stats?.uniquePatients || 0}</div>
                  <div style={{ fontSize: '11px', color: '#065f46', marginTop: '4px' }}>người khác nhau</div>
                </div>

                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', 
                  borderRadius: '12px', 
                  border: '2px solid #f9a8d4'
                }}>
                  <div style={{ fontSize: '13px', color: '#831843', marginBottom: '8px', fontWeight: '600' }}>📋 Hồ sơ</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#9f1239' }}>{stats?.withRecords || 0}</div>
                  <div style={{ fontSize: '11px', color: '#881337', marginTop: '4px' }}>hồ sơ khám</div>
                </div>
              </div>
            </div>

            {/* Status Breakdown Chart */}
            <div style={{ 
              background: 'white', 
              padding: '28px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)' 
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px', fontWeight: '700' }}>
                <span style={{ fontSize: '28px' }}>📈</span> Phân bổ trạng thái lịch hẹn
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(252, 211, 77, 0.3)'
                }}>
                  <div style={{ fontSize: '14px', color: '#78350f', marginBottom: '8px', fontWeight: '600' }}>⏳ Chờ xác nhận</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#92400e' }}>
                    {stats?.pending || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e', marginTop: '6px', opacity: 0.8 }}>
                    {((stats?.pending || 0) / (stats?.total || 1) * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{ fontSize: '14px', color: '#1e3a8a', marginBottom: '8px', fontWeight: '600' }}>✓ Đã xác nhận</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#1e40af' }}>
                    {stats?.confirmed || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#1e40af', marginTop: '6px', opacity: 0.9 }}>
                    {((stats?.confirmed || 0) / (stats?.total || 1) * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ fontSize: '14px', color: '#064e3b', marginBottom: '8px', fontWeight: '600' }}>✓ Hoàn thành</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#065f46' }}>
                    {stats?.completed || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#065f46', marginTop: '6px', opacity: 0.9 }}>
                    {((stats?.completed || 0) / (stats?.total || 1) * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}>
                  <div style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '8px', fontWeight: '600' }}>✕ Đã hủy</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#991b1b' }}>
                    {stats?.cancelled || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '6px', opacity: 0.9 }}>
                    {((stats?.cancelled || 0) / (stats?.total || 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#1a1a1a', fontSize: '18px', fontWeight: '700' }}>🚀 Thao tác nhanh</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href="/doctor/appointments" style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📅</span> Xem lịch hẹn
                  </Link>
                  <Link href="/doctor/work-schedule" style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📋</span> Quản lý lịch làm việc
                  </Link>
                  <Link href="/doctor/patients" style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>👥</span> Bệnh nhân
                  </Link>
                  <Link href="/doctor/profile" style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>⚙️</span> Cập nhật hồ sơ
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

