import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { prepareImageForUpload } from '../../lib/imageOptimizer'

export default function PatientProfile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    profileImage: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      
      if (res.ok) {
        setUser(data)
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          gender: data.gender || '',
          profileImage: data.profileImage || ''
        })
        if (data.profileImage) {
          setImagePreview(data.profileImage)
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      alert('Không thể tải thông tin cá nhân')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        // Compress và validate image (max 1MB, max width 800px)
        const compressedImage = await prepareImageForUpload(file, 1, 800)
        setFormData({ ...formData, profileImage: compressedImage })
        setImagePreview(compressedImage)
      } catch (error) {
        alert(error.message || 'Lỗi xử lý ảnh')
      }
    }
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        alert('Cập nhật thông tin thành công!')
        fetchUserProfile()
        // Trigger navbar reload by dispatching custom event
        window.dispatchEvent(new Event('profileUpdated'))
      } else {
        alert(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Không thể cập nhật thông tin')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    try {
      setChangingPassword(true)
      const res = await fetch('/api/patient/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert('Đổi mật khẩu thành công!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        alert(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Không thể đổi mật khẩu')
    } finally {
      setChangingPassword(false)
    }
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
          <div style={{ color: '#1e3a8a', fontSize: '18px' }}>Đang tải...</div>
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
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              color: '#1e3a8a',
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              Thông tin cá nhân
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Quản lý thông tin tài khoản của bạn
            </p>
          </div>

          {/* Profile Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <button
                onClick={() => setActiveTab('info')}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: activeTab === 'info' ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' : 'white',
                  color: activeTab === 'info' ? 'white' : '#666',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('password')}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: activeTab === 'password' ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' : 'white',
                  color: activeTab === 'password' ? 'white' : '#666',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Đổi mật khẩu
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {activeTab === 'info' ? (
                <form onSubmit={handleUpdateProfile}>
                  {/* Profile Image Upload */}
                  <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #2563eb',
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '48px', color: '#2563eb', fontWeight: '700' }}>
                          {formData.name?.charAt(0).toUpperCase() || 'P'}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="profileImageInput"
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="profileImageInput"
                      style={{
                        display: 'inline-block',
                        padding: '8px 20px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      📷 Thay đổi ảnh đại diện
                    </label>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Họ và tên <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Email <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          background: '#f5f5f5',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Giới tính
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Địa chỉ
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border-color 0.3s ease',
                          resize: 'vertical'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => router.push('/patient/dashboard')}
                      style={{
                        padding: '12px 24px',
                        background: '#f5f5f5',
                        color: '#666',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: '12px 32px',
                        background: saving ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#1e3a8a',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: saving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleChangePassword}>
                  <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Mật khẩu hiện tại <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Mật khẩu mới <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Xác nhận mật khẩu mới <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>

                    <div style={{
                      padding: '16px',
                      background: '#fff8e1',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      fontSize: '14px',
                      color: '#856404'
                    }}>
                      <strong>Lưu ý:</strong> Mật khẩu mới phải có ít nhất 6 ký tự
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })}
                        style={{
                          padding: '12px 24px',
                          background: '#f5f5f5',
                          color: '#666',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={changingPassword}
                        style={{
                          padding: '12px 32px',
                          background: changingPassword ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#1e3a8a',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: changingPassword ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {changingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

