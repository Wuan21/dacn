import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { prepareImageForUpload } from '../../lib/imageOptimizer'

export default function DoctorProfile(){
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: '',
    bio: '',
    specialtyId: '',
    degree: '',
    experience: '',
    fees: '',
    address1: '',
    address2: '',
    profileImage: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
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
        loadProfile()
        loadSpecialties()
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
        setForm({
          name: data.name || '',
          bio: data.doctorProfile?.bio || '',
          specialtyId: data.doctorProfile?.specialtyId || '',
          degree: data.doctorProfile?.degree || '',
          experience: data.doctorProfile?.experience || '',
          fees: data.doctorProfile?.fees || '',
          address1: data.doctorProfile?.address1 || '',
          address2: data.doctorProfile?.address2 || '',
          profileImage: data.doctorProfile?.profileImage || ''
        })
        if (data.doctorProfile?.profileImage) {
          setImagePreview(data.doctorProfile.profileImage)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadSpecialties() {
    try {
      const res = await fetch('/api/specialties')
      if (res.ok) {
        const data = await res.json()
        setSpecialties(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    
    if (!form.name.trim()) {
      alert('Vui lòng nhập họ tên')
      return
    }

    if (!form.specialtyId) {
      alert('Vui lòng chọn chuyên khoa')
      return
    }

    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          specialtyId: parseInt(form.specialtyId),
          degree: form.degree,
          experience: form.experience,
          fees: form.fees ? parseFloat(form.fees) : null,
          address1: form.address1,
          address2: form.address2,
          profileImage: imagePreview
        })
      })

      if (res.ok) {
        alert('Đã cập nhật hồ sơ thành công!')
        setEditing(false)
        loadProfile()
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('profileUpdated'))
      } else {
        const data = await res.json()
        alert(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Compress image (max 1MB, max width 800px)
        const compressedImage = await prepareImageForUpload(file, 1, 800)
        setImagePreview(compressedImage)
      } catch (error) {
        alert(error.message || 'Lỗi xử lý ảnh')
      }
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
                  <img src={profile.doctorProfile.profileImage} alt={profile?.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profile?.name?.charAt(0).toUpperCase() || 'D'
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
            ⚙️ Hồ sơ cá nhân
          </h1>
          <p style={{ color: '#666' }}>
            Quản lý thông tin cá nhân và chuyên môn
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#666' }}>Đang tải...</p>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #f0f0f0' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: profile?.doctorProfile?.profileImage ? 'transparent' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  fontWeight: '700',
                  flexShrink: 0,
                  overflow: 'hidden',
                  border: profile?.doctorProfile?.profileImage ? '3px solid #e5e7eb' : 'none'
                }}>
                  {profile?.doctorProfile?.profileImage ? (
                    <img src={profile.doctorProfile.profileImage} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profile?.name?.charAt(0).toUpperCase() || 'D'
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: '#1a1a1a', marginBottom: '8px' }}>
                    Dr. {profile?.name}
                  </h2>
                  <div style={{ fontSize: '15px', color: '#666', marginBottom: '6px' }}>
                    📧 {profile?.email}
                  </div>
                  <div style={{ fontSize: '15px', color: '#2563eb', fontWeight: '600' }}>
                    🏥 {profile?.doctorProfile?.specialty?.name || 'Chưa cập nhật chuyên khoa'}
                  </div>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      padding: '10px 24px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    ✏️ Chỉnh sửa
                  </button>
                )}
              </div>

              {editing ? (
                /* Edit Mode */
                <form onSubmit={handleSave}>
                  {/* Upload ảnh đại diện */}
                  <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#666' }}>
                      Tải ảnh đại diện lên
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid #e5e7eb',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ fontSize: '40px', color: '#9ca3af' }}>👤</div>
                        )}
                      </div>
                      <label style={{
                        padding: '10px 20px',
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        📁 Chọn ảnh
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Form 2 cột */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    {/* Họ tên */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        placeholder="Nhập họ tên"
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border 0.2s'
                        }}
                      />
                    </div>

                    {/* Chuyên khoa */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
                        Chuyên khoa
                      </label>
                      <select
                        value={form.specialtyId}
                        onChange={(e) => setForm({...form, specialtyId: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          background: 'white',
                          outline: 'none'
                        }}
                      >
                        <option value="">Chọn chuyên khoa</option>
                        {specialties.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Email (chỉ hiển thị) */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
                        Email Bác sĩ
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: '#f9fafb',
                          color: '#6b7280'
                        }}
                      />
                    </div>

                    {/* Bằng cấp */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
                        Bằng cấp
                      </label>
                      <input
                        type="text"
                        value={form.degree}
                        onChange={(e) => setForm({...form, degree: e.target.value})}
                        placeholder="Bằng cấp"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Kinh nghiệm */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
                        Kinh nghiệm
                      </label>
                      <select
                        value={form.experience}
                        onChange={(e) => setForm({...form, experience: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          background: 'white',
                          outline: 'none'
                        }}
                      >
                        <option value="">Chọn kinh nghiệm</option>
                        <option value="1 năm">1 năm</option>
                        <option value="2 năm">2 năm</option>
                        <option value="3 năm">3 năm</option>
                        <option value="5 năm">5 năm</option>
                        <option value="7 năm">7 năm</option>
                        <option value="10+ năm">10+ năm</option>
                      </select>
                    </div>

                    {/* Phí khám */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
                        Phí khám
                      </label>
                      <input
                        type="number"
                        value={form.fees}
                        onChange={(e) => setForm({...form, fees: e.target.value})}
                        placeholder="Phí khám bệnh"
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={form.address1}
                      onChange={(e) => setForm({...form, address1: e.target.value})}
                      placeholder="Địa chỉ 1"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '12px',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      value={form.address2}
                      onChange={(e) => setForm({...form, address2: e.target.value})}
                      placeholder="Địa chỉ 2"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Giới thiệu */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
                      Giới thiệu về Bác sĩ
                    </label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm({...form, bio: e.target.value})}
                      placeholder="Viết giới thiệu về bác sĩ"
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setForm({
                          name: profile?.name || '',
                          bio: profile?.doctorProfile?.bio || '',
                          specialtyId: profile?.doctorProfile?.specialtyId || '',
                          degree: profile?.doctorProfile?.degree || '',
                          experience: profile?.doctorProfile?.experience || '',
                          fees: profile?.doctorProfile?.fees || '',
                          address1: profile?.doctorProfile?.address1 || '',
                          address2: profile?.doctorProfile?.address2 || ''
                        })
                        setImagePreview(profile?.doctorProfile?.profileImage || null)
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'white',
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      💾 Lưu thay đổi
                    </button>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div>
                  {/* Thông tin chuyên môn */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🏥</span> Thông tin chuyên môn
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>Chuyên khoa</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#2563eb' }}>
                          {profile?.doctorProfile?.specialty?.name || 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>Bằng cấp</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                          {profile?.doctorProfile?.degree || 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>Kinh nghiệm</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                          {profile?.doctorProfile?.experience || 'Chưa cập nhật'}
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>Phí khám</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#16a34a' }}>
                          {profile?.doctorProfile?.fees ? `${profile.doctorProfile.fees.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  {(profile?.doctorProfile?.address1 || profile?.doctorProfile?.address2) && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📍</span> Địa chỉ phòng khám
                      </h3>
                      <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        {profile?.doctorProfile?.address1 && (
                          <div style={{ fontSize: '14px', color: '#333', marginBottom: '6px' }}>
                            {profile.doctorProfile.address1}
                          </div>
                        )}
                        {profile?.doctorProfile?.address2 && (
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {profile.doctorProfile.address2}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Giới thiệu */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📝</span> Giới thiệu về Bác sĩ
                    </h3>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                      {profile?.doctorProfile?.bio || 'Chưa có thông tin giới thiệu'}
                    </div>
                  </div>

                  {/* Thông tin liên hệ */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📧</span> Thông tin liên hệ
                    </h3>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Email:</div>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: '#333' }}>
                        {profile?.email}
                      </div>
                    </div>
                  </div>

                  {/* Lưu ý */}
                  <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>💡</div>
                      <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                        <strong>Lưu ý:</strong> Thông tin hồ sơ của bạn sẽ được hiển thị cho bệnh nhân khi họ đặt lịch khám. 
                        Hãy đảm bảo thông tin luôn chính xác và cập nhật.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!editing && (
              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <Link href="/doctor/appointments" style={{
                  padding: '16px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{ fontSize: '32px' }}>📅</div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Quản lý</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>Lịch hẹn</div>
                  </div>
                </Link>

                <Link href="/doctor/patients" style={{
                  padding: '16px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{ fontSize: '32px' }}>👥</div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Quản lý</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>Bệnh nhân</div>
                  </div>
                </Link>

                <Link href="/doctor" style={{
                  padding: '16px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{ fontSize: '32px' }}>📊</div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Xem</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>Dashboard</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

