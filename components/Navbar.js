import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [doctorProfile, setDoctorProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    
    // Listen for profile update events
    const handleProfileUpdate = () => {
      checkAuth()
    }
    
    window.addEventListener('profileUpdated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        
        // Load profiles immediately without separate calls
        if (data.role === 'doctor') {
          await loadDoctorProfile()
        } else if (data.role === 'patient') {
          await loadPatientProfile()
        }
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error(err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadDoctorProfile() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/doctor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setDoctorProfile(data)
      }
    } catch (err) {
      console.error('Error loading doctor profile:', err)
    }
  }

  async function loadPatientProfile() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/patient/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch (err) {
      console.error('Error loading patient profile:', err)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout')
    setUser(null)
    setShowDropdown(false)
    router.push('/')
  }

  function getRoleLabel(role) {
    const labels = {
      patient: 'Bệnh nhân',
      doctor: 'Bác sĩ',
      admin: 'Quản trị viên'
    }
    return labels[role] || role
  }

  function getRoleDashboard(role) {
    const dashboards = {
      patient: '/patient/dashboard',
      doctor: '/doctor',
      admin: '/admin'
    }
    return dashboards[role] || '/'
  }

  return (
    <nav className="navbar" style={{ 
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="nav-content" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '24px',
          fontWeight: '700',
          color: '#1e3a8a',
          textDecoration: 'none'
        }}>
          YourMedicare
        </Link>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          <Link href="/specialties" style={{
            padding: '10px 20px',
            color: '#1f2937',
            fontWeight: '500',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            fontSize: '15px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f3f4f6'
            e.currentTarget.style.color = '#2563eb'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#1f2937'
          }}>
            Chuyên khoa
          </Link>

          <Link href="/doctors" style={{
            padding: '10px 20px',
            color: '#1f2937',
            fontWeight: '500',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            fontSize: '15px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f3f4f6'
            e.currentTarget.style.color = '#2563eb'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#1f2937'
          }}>
            Bác sĩ
          </Link>
          
          {loading ? (
            <div style={{ width: '100px', height: '40px' }}></div>
          ) : user ? (
            <>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.background = '#e5e7eb'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = '#f3f4f6'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {(() => {
                    // Determine which profile image to show
                    let profileImageSrc = null
                    
                    if (user.role === 'doctor' && doctorProfile?.doctorProfile?.profileImage) {
                      profileImageSrc = doctorProfile.doctorProfile.profileImage
                    } else if (user.role === 'patient' && user.profileImage) {
                      profileImageSrc = user.profileImage
                    }
                    
                    return profileImageSrc ? (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid white',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}>
                        <img 
                          src={profileImageSrc} 
                          alt={user.name}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'white',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '700'
                      }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )
                  })()}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', lineHeight: '1.2' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.3s ease', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <path d="M2 4L6 8L10 4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    minWidth: '220px',
                    overflow: 'hidden',
                    animation: 'slideDown 0.2s ease'
                  }}>
                    <Link 
                      href={getRoleDashboard(user.role)}
                      onClick={() => setShowDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        color: '#333',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#f9fafb'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'white'
                      }}
                    >
                      <span style={{ fontSize: '18px' }}></span>
                      Dashboard
                    </Link>

                    {user.role === 'patient' && (
                      <>
                        <Link 
                          href="/patient/appointments"
                          onClick={() => setShowDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}></span>
                          Lịch hẹn
                        </Link>
                        <Link 
                          href="/patient/medical-records"
                          onClick={() => setShowDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}></span>
                          Hồ sơ khám
                        </Link>
                        <Link 
                          href="/patient/profile"
                          onClick={() => setShowDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}></span>
                          Thông tin cá nhân
                        </Link>
                      </>
                    )}

                    {user.role === 'doctor' && (
                      <>
                        <Link 
                          href="/doctor/appointments"
                          onClick={() => setShowDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}></span>
                          Lịch hẹn
                        </Link>
                        <Link 
                          href="/doctor/patients"
                          onClick={() => setShowDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}></span>
                          Bệnh nhân
                        </Link>
                        <Link 
                          href="/doctor/profile"
                          onClick={() => setShowDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}></span>
                          Hồ sơ cá nhân
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <>
                        <Link 
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}></span>
                          Quản trị
                        </Link>
                        <Link 
                          href="/admin/support"
                          onClick={() => setShowDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            color: '#333',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>💬</span>
                          Hỗ trợ CSKH
                        </Link>
                      </>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      style={{ 
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: 'white',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#fff5f5'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'white'
                      }}
                    >
                      <span style={{ fontSize: '18px' }}></span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>

              <style jsx>{`
                @keyframes slideDown {
                  from {
                    opacity: 0;
                    transform: translateY(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/register" style={{
                padding: '10px 20px',
                color: '#2563eb',
                fontWeight: '600',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                fontSize: '15px',
                border: '2px solid #2563eb'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2563eb'
                e.currentTarget.style.color = 'white'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#2563eb'
              }}>
                Đăng ký
              </Link>

              <Link href="/login" style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                fontSize: '15px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}>
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
