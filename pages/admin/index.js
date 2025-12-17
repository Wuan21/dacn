import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Admin(){
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, users, specialties, appointments
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState(null)
  const [specialtyForm, setSpecialtyForm] = useState({ name: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showUserModal, setShowUserModal] = useState(false)
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'patient',
    specialtyId: ''
  })
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false)
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState(null)
  const router = useRouter()

  useEffect(()=>{
    checkAuth()
  },[])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.role !== 'admin') {
          router.push('/')
          return
        }
        setUser(data)
        loadData()
      } else {
        router.push('/login')
      }
    } catch (err) {
      router.push('/login')
    }
  }

  async function loadData() {
    try {
      const [usersRes, specialtiesRes, appointmentsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/specialties'),
        fetch('/api/admin/appointments')
      ])
      
      if (usersRes.ok) setUsers(await usersRes.json())
      if (specialtiesRes.ok) setSpecialties(await specialtiesRes.json())
      if (appointmentsRes.ok) setAppointments(await appointmentsRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalUsers: users.length,
    doctors: users.filter(u => u.role === 'doctor').length,
    patients: users.filter(u => u.role === 'patient').length,
    appointments: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length
  }

  async function handleChangeRole(userId, newRole) {
    if (!confirm(`Bạn có chắc muốn đổi role người dùng này thành ${newRole}?`)) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (res.ok) {
        alert('Đã cập nhật role thành công!')
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Không thể cập nhật role')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  async function handleToggleActive(userId, isActive) {
    const action = isActive ? 'kích hoạt' : 'khóa'
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive })
      })

      if (res.ok) {
        alert(`Đã ${action} tài khoản thành công!`)
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || `Không thể ${action} tài khoản`)
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  async function handleDeleteUser(userId) {
    if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!')) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (res.ok) {
        alert('Đã xóa người dùng thành công!')
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Không thể xóa người dùng')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  function openSpecialtyModal(specialty = null) {
    if (specialty) {
      setEditingSpecialty(specialty)
      setSpecialtyForm({ name: specialty.name })
    } else {
      setEditingSpecialty(null)
      setSpecialtyForm({ name: '' })
    }
    setShowSpecialtyModal(true)
  }

  async function handleSaveSpecialty(e) {
    e.preventDefault()
    
    if (!specialtyForm.name.trim()) {
      alert('Vui lòng nhập tên chuyên khoa')
      return
    }

    try {
      const url = '/api/admin/specialties'
      const method = editingSpecialty ? 'PATCH' : 'POST'
      const body = editingSpecialty 
        ? { specialtyId: editingSpecialty.id, name: specialtyForm.name.trim() }
        : { name: specialtyForm.name.trim() }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        alert(editingSpecialty ? 'Đã cập nhật chuyên khoa!' : 'Đã thêm chuyên khoa!')
        setShowSpecialtyModal(false)
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  async function handleDeleteSpecialty(specialtyId) {
    if (!confirm('Bạn có chắc muốn xóa chuyên khoa này?')) return

    try {
      const res = await fetch('/api/admin/specialties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialtyId })
      })

      if (res.ok) {
        alert('Đã xóa chuyên khoa thành công!')
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Không thể xóa chuyên khoa')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  async function handleUpdateAppointmentStatus(appointmentId, newStatus) {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái lịch hẹn thành "${newStatus}"?`)) return

    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status: newStatus })
      })

      if (res.ok) {
        alert('Đã cập nhật trạng thái thành công!')
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Không thể cập nhật trạng thái')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  async function handleDeleteAppointment(appointmentId) {
    if (!confirm('Bạn có chắc muốn xóa lịch hẹn này? Hành động này không thể hoàn tác!')) return

    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })

      if (res.ok) {
        alert('Đã xóa lịch hẹn thành công!')
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Không thể xóa lịch hẹn')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  async function openAppointmentDetail(appointmentId) {
    try {
      const res = await fetch(`/api/admin/appointments/${appointmentId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedAppointmentDetail(data)
        setShowAppointmentDetail(true)
      } else {
        alert('Không thể tải thông tin lịch hẹn')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  function openUserModal() {
    setUserForm({
      email: '',
      password: '',
      name: '',
      role: 'patient',
      specialtyId: ''
    })
    setShowUserModal(true)
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    
    if (!userForm.email.trim() || !userForm.password.trim() || !userForm.name.trim()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (userForm.role === 'doctor' && !userForm.specialtyId) {
      alert('Vui lòng chọn chuyên khoa cho bác sĩ')
      return
    }

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userForm.email.trim(),
          password: userForm.password,
          name: userForm.name.trim(),
          role: userForm.role,
          specialtyId: userForm.role === 'doctor' ? parseInt(userForm.specialtyId) : null
        })
      })

      if (res.ok) {
        alert('Đã tạo tài khoản thành công!')
        setShowUserModal(false)
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <Link href="/" className="nav-logo">🏥 YourMedicare Admin</Link>
          <div className="nav-links">
            <Link href="/admin">Dashboard</Link>
            <button onClick={async () => {
              await fetch('/api/auth/logout')
              window.location.href = '/'
            }} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '8px 16px', fontSize: '15px', fontWeight: '500' }}>
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: '#1a1a1a', marginBottom: '8px' }}>
            Quản trị hệ thống
          </h1>
          <p style={{ color: '#666' }}>
            Quản lý người dùng, bác sĩ, chuyên khoa và lịch hẹn
          </p>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', borderBottom: '2px solid #eee', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: activeTab === 'overview' ? '#2563eb' : '#666',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              whiteSpace: 'nowrap'
            }}
          >
            📊 Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: activeTab === 'users' ? '#2563eb' : '#666',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              whiteSpace: 'nowrap'
            }}
          >
            👥 Người dùng
          </button>
          <button
            onClick={() => setActiveTab('specialties')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: activeTab === 'specialties' ? '#2563eb' : '#666',
              border: 'none',
              borderBottom: activeTab === 'specialties' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              whiteSpace: 'nowrap'
            }}
          >
            🏥 Chuyên khoa
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: activeTab === 'appointments' ? '#2563eb' : '#666',
              border: 'none',
              borderBottom: activeTab === 'appointments' ? '3px solid #2563eb' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              whiteSpace: 'nowrap'
            }}
          >
            📅 Lịch hẹn
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#666' }}>Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Tổng người dùng</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb' }}>{stats.totalUsers}</div>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Bác sĩ</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.doctors}</div>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Bệnh nhân</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{stats.patients}</div>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Lịch hẹn</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats.appointments}</div>
                  </div>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Chuyên khoa</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6' }}>{specialties.length}</div>
                  </div>
                </div>

                {/* Revenue Statistics Chart */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>💰</span> Thống kê doanh thu theo trạng thái lịch hẹn
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#2d3436', marginBottom: '8px', fontWeight: '500' }}>⏳ Chờ xác nhận</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#2d3436' }}>
                        {appointments.filter(a => a.status === 'pending').length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#2d3436', marginTop: '4px', opacity: 0.8 }}>
                        {((appointments.filter(a => a.status === 'pending').length / (appointments.length || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: 'white', marginBottom: '8px', fontWeight: '500' }}>✓ Đã xác nhận</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                        {appointments.filter(a => a.status === 'confirmed').length}
                      </div>
                      <div style={{ fontSize: '12px', color: 'white', marginTop: '4px', opacity: 0.9 }}>
                        {((appointments.filter(a => a.status === 'confirmed').length / (appointments.length || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: 'white', marginBottom: '8px', fontWeight: '500' }}>✓ Hoàn thành</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                        {appointments.filter(a => a.status === 'completed').length}
                      </div>
                      <div style={{ fontSize: '12px', color: 'white', marginTop: '4px', opacity: 0.9 }}>
                        {((appointments.filter(a => a.status === 'completed').length / (appointments.length || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div style={{ padding: '16px', background: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', color: 'white', marginBottom: '8px', fontWeight: '500' }}>✕ Đã hủy</div>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                        {appointments.filter(a => a.status === 'cancelled').length}
                      </div>
                      <div style={{ fontSize: '12px', color: 'white', marginTop: '4px', opacity: 0.9 }}>
                        {((appointments.filter(a => a.status === 'cancelled').length / (appointments.length || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Visual Bar Chart */}
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      Biểu đồ phân bổ
                    </div>
                    {[
                      { status: 'pending', label: 'Chờ xác nhận', color: '#fdcb6e', count: appointments.filter(a => a.status === 'pending').length },
                      { status: 'confirmed', label: 'Đã xác nhận', color: '#0984e3', count: appointments.filter(a => a.status === 'confirmed').length },
                      { status: 'completed', label: 'Hoàn thành', color: '#00b894', count: appointments.filter(a => a.status === 'completed').length },
                      { status: 'cancelled', label: 'Đã hủy', color: '#d63031', count: appointments.filter(a => a.status === 'cancelled').length }
                    ].map(item => {
                      const percentage = (item.count / (appointments.length || 1)) * 100
                      return (
                        <div key={item.status} style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                            <span style={{ color: '#666' }}>{item.label}</span>
                            <span style={{ fontWeight: '600', color: '#333' }}>{item.count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '8px', 
                            background: '#f0f0f0', 
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              background: item.color,
                              borderRadius: '4px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ 
                    marginTop: '24px', 
                    padding: '16px', 
                    background: '#f9fafb', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>💡</span>
                      <div>
                        <strong style={{ color: '#333' }}>Tổng doanh thu dự kiến:</strong>
                        <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>
                          {(appointments.filter(a => a.status === 'completed').length * 500000).toLocaleString('vi-VN')} VNĐ
                        </span>
                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#999' }}>
                          (Giá trung bình: 500,000 VNĐ/lịch hẹn hoàn thành)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ margin: 0 }}>Quản lý người dùng ({users.filter(u => {
                    const matchSearch = !searchTerm || 
                      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchStatus = statusFilter === 'all' || 
                      (statusFilter === 'active' && u.isActive) || 
                      (statusFilter === 'locked' && !u.isActive)
                    return matchSearch && matchStatus
                  }).length})</h3>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="🔍 Tìm kiếm theo tên, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        width: '280px',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <option value="all">📋 Tất cả trạng thái</option>
                      <option value="active">✓ Hoạt động</option>
                      <option value="locked">✕ Đã khóa</option>
                    </select>

                    <button
                      onClick={openUserModal}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ➕ Thêm tài khoản
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tên</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Vai trò</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Trạng thái</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Ngày tạo</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => {
                        const matchSearch = !searchTerm || 
                          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        const matchStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && u.isActive) || 
                          (statusFilter === 'locked' && !u.isActive)
                        return matchSearch && matchStatus
                      }).map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>{u.id}</td>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{u.name}</td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{u.email}</td>
                          <td style={{ padding: '12px' }}>
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u.id, e.target.value)}
                              disabled={u.role === 'admin' && user?.id === u.id}
                              style={{
                                padding: '6px 12px',
                                background: u.role === 'admin' ? '#fee2e2' : u.role === 'doctor' ? '#dcfce7' : '#dbeafe',
                                color: u.role === 'admin' ? '#dc2626' : u.role === 'doctor' ? '#16a34a' : '#2563eb',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: (u.role === 'admin' && user?.id === u.id) ? 'not-allowed' : 'pointer',
                                width: 'auto'
                              }}
                            >
                              <option value="patient">patient</option>
                              <option value="doctor">doctor</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => handleToggleActive(u.id, !u.isActive)}
                              disabled={user?.id === u.id}
                              style={{
                                padding: '6px 12px',
                                background: u.isActive ? '#dcfce7' : '#fee2e2',
                                color: u.isActive ? '#16a34a' : '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: user?.id === u.id ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                opacity: user?.id === u.id ? 0.5 : 1
                              }}
                            >
                              {u.isActive ? '✓ Hoạt động' : '✕ Đã khóa'}
                            </button>
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={user?.id === u.id}
                              style={{
                                padding: '6px 16px',
                                background: user?.id === u.id ? '#ccc' : 'white',
                                color: user?.id === u.id ? '#666' : '#dc2626',
                                border: user?.id === u.id ? '1px solid #ccc' : '1px solid #dc2626',
                                borderRadius: '6px',
                                cursor: user?.id === u.id ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => {
                                if (user?.id !== u.id) {
                                  e.currentTarget.style.background = '#dc2626'
                                  e.currentTarget.style.color = 'white'
                                }
                              }}
                              onMouseOut={(e) => {
                                if (user?.id !== u.id) {
                                  e.currentTarget.style.background = 'white'
                                  e.currentTarget.style.color = '#dc2626'
                                }
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {users.filter(u => {
                    const matchSearch = !searchTerm || 
                      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchStatus = statusFilter === 'all' || 
                      (statusFilter === 'active' && u.isActive) || 
                      (statusFilter === 'locked' && !u.isActive)
                    return matchSearch && matchStatus
                  }).length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#999'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                      <div style={{ fontSize: '16px', fontWeight: '500', color: '#666' }}>
                        Không tìm thấy người dùng nào
                      </div>
                      {(searchTerm || statusFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                          }}
                          style={{
                            marginTop: '16px',
                            padding: '8px 16px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specialties Tab */}
            {activeTab === 'specialties' && (
              <>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Quản lý chuyên khoa ({specialties.length})</h3>
                  <button
                    onClick={() => openSpecialtyModal()}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      margin: 0
                    }}
                  >
                    ➕ Thêm chuyên khoa
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                  {specialties.map(s => (
                    <div key={s.id} style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏥</div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>{s.name}</h3>
                      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#999' }}>ID: {s.id}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openSpecialtyModal(s)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: 'white',
                            color: '#2563eb',
                            border: '1px solid #2563eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
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
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteSpecialty(s.id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: 'white',
                            color: '#dc2626',
                            border: '1px solid #dc2626',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#dc2626'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.color = '#dc2626'
                          }}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ margin: 0 }}>Quản lý lịch hẹn ({appointments.length})</h3>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="🔍 Tìm kiếm theo tên bệnh nhân, bác sĩ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        minWidth: '250px'
                      }}
                    />
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        padding: '10px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <option value="all">📋 Tất cả trạng thái</option>
                      <option value="pending">⏳ Chờ xác nhận</option>
                      <option value="confirmed">✓ Đã xác nhận</option>
                      <option value="completed">✓ Hoàn thành</option>
                      <option value="cancelled">✕ Đã hủy</option>
                    </select>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Bệnh nhân</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Bác sĩ</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Chuyên khoa</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Ngày giờ</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Trạng thái</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments
                        .filter(a => {
                          const matchSearch = searchTerm === '' || 
                            a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            a.specialtyName.toLowerCase().includes(searchTerm.toLowerCase())
                          const matchStatus = statusFilter === 'all' || a.status === statusFilter
                          return matchSearch && matchStatus
                        })
                        .map(a => {
                          const statusColors = {
                            pending: { bg: '#fef3c7', text: '#92400e' },
                            confirmed: { bg: '#dbeafe', text: '#1e40af' },
                            completed: { bg: '#d1fae5', text: '#065f46' },
                            cancelled: { bg: '#fee2e2', text: '#991b1b' }
                          }
                          const statusLabels = {
                            pending: '⏳ Chờ xác nhận',
                            confirmed: '✓ Đã xác nhận',
                            completed: '✓ Hoàn thành',
                            cancelled: '✕ Đã hủy'
                          }
                          const color = statusColors[a.status] || { bg: '#f3f4f6', text: '#374151' }
                          
                          return (
                            <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '12px' }}>{a.id}</td>
                              <td style={{ padding: '12px' }}>
                                <div style={{ fontWeight: '500', marginBottom: '2px' }}>{a.patientName}</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>{a.patientEmail}</div>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <div style={{ fontWeight: '500', marginBottom: '2px' }}>{a.doctorName}</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>{a.doctorEmail}</div>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  background: '#f0f0f0',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: '#555'
                                }}>
                                  {a.specialtyName}
                                </span>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <div style={{ fontWeight: '500' }}>
                                  {new Date(a.appointmentDate).toLocaleDateString('vi-VN')}
                                </div>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                  {new Date(a.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <select
                                  value={a.status}
                                  onChange={(e) => handleUpdateAppointmentStatus(a.id, e.target.value)}
                                  style={{
                                    padding: '6px 12px',
                                    background: color.bg,
                                    color: color.text,
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="pending">⏳ Chờ xác nhận</option>
                                  <option value="confirmed">✓ Đã xác nhận</option>
                                  <option value="completed">✓ Hoàn thành</option>
                                  <option value="cancelled">✕ Đã hủy</option>
                                </select>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => openAppointmentDetail(a.id)}
                                    style={{
                                      padding: '6px 16px',
                                      background: 'white',
                                      color: '#2563eb',
                                      border: '1px solid #2563eb',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: '500',
                                      transition: 'all 0.2s ease'
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
                                    👁️ Chi tiết
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAppointment(a.id)}
                                    style={{
                                      padding: '6px 16px',
                                      background: 'white',
                                      color: '#dc2626',
                                      border: '1px solid #dc2626',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      fontWeight: '500',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.background = '#dc2626'
                                      e.currentTarget.style.color = 'white'
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.background = 'white'
                                      e.currentTarget.style.color = '#dc2626'
                                    }}
                                  >
                                    🗑️ Xóa
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                  
                  {appointments.filter(a => {
                    const matchSearch = searchTerm === '' || 
                      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.specialtyName.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchStatus = statusFilter === 'all' || a.status === statusFilter
                    return matchSearch && matchStatus
                  }).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                      <p style={{ fontSize: '16px', fontWeight: '500' }}>
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Không tìm thấy lịch hẹn phù hợp' 
                          : 'Chưa có lịch hẹn nào'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
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
                ➕ Thêm tài khoản mới
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
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
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    placeholder="Nhập họ và tên"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    placeholder="example@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                  💡 Mật khẩu phải có ít nhất 6 ký tự
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    Vai trò *
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value, specialtyId: ''})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                  >
                    <option value="patient">Bệnh nhân</option>
                    <option value="doctor">Bác sĩ</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                {userForm.role === 'doctor' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      Chuyên khoa *
                    </label>
                    <select
                      value={userForm.specialtyId}
                      onChange={(e) => setUserForm({...userForm, specialtyId: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <option value="">-- Chọn chuyên khoa --</option>
                      {specialties.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <div style={{ fontSize: '20px' }}>⚠️</div>
                  <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                    <strong>Lưu ý:</strong> Tài khoản mới sẽ được tạo với trạng thái hoạt động. 
                    {userForm.role === 'doctor' && ' Bác sĩ cần cập nhật thêm thông tin hồ sơ sau khi đăng nhập.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'white',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
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
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showAppointmentDetail && selectedAppointmentDetail && (
        <div className="modal-overlay" onClick={() => setShowAppointmentDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
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
                📋 Chi tiết lịch hẹn #{selectedAppointmentDetail.id}
              </h2>
              <button
                onClick={() => setShowAppointmentDetail(false)}
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
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Trạng thái */}
              <div style={{ 
                marginBottom: '24px', 
                padding: '16px', 
                background: selectedAppointmentDetail.status === 'completed' ? '#d1fae5' : 
                           selectedAppointmentDetail.status === 'confirmed' ? '#dbeafe' :
                           selectedAppointmentDetail.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                borderRadius: '12px',
                border: '2px solid ' + (selectedAppointmentDetail.status === 'completed' ? '#059669' : 
                                       selectedAppointmentDetail.status === 'confirmed' ? '#2563eb' :
                                       selectedAppointmentDetail.status === 'cancelled' ? '#dc2626' : '#f59e0b')
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Trạng thái lịch hẹn</div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  color: selectedAppointmentDetail.status === 'completed' ? '#065f46' : 
                         selectedAppointmentDetail.status === 'confirmed' ? '#1e40af' :
                         selectedAppointmentDetail.status === 'cancelled' ? '#991b1b' : '#92400e'
                }}>
                  {selectedAppointmentDetail.status === 'pending' && '⏳ Chờ xác nhận'}
                  {selectedAppointmentDetail.status === 'confirmed' && '✓ Đã xác nhận'}
                  {selectedAppointmentDetail.status === 'completed' && '✓ Hoàn thành'}
                  {selectedAppointmentDetail.status === 'cancelled' && '✕ Đã hủy'}
                </div>
              </div>

              {/* Thông tin bệnh nhân */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👤</span> Thông tin bệnh nhân
                </h3>
                <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Họ tên</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                        {selectedAppointmentDetail.patient.name}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Email</div>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>
                        {selectedAppointmentDetail.patient.email}
                      </div>
                    </div>
                    {selectedAppointmentDetail.patient.phone && (
                      <div>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Số điện thoại</div>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>
                          {selectedAppointmentDetail.patient.phone}
                        </div>
                      </div>
                    )}
                    {selectedAppointmentDetail.patient.dateOfBirth && (
                      <div>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Ngày sinh</div>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>
                          {new Date(selectedAppointmentDetail.patient.dateOfBirth).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông tin bác sĩ */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👨‍⚕️</span> Thông tin bác sĩ
                </h3>
                <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Họ tên</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                        Dr. {selectedAppointmentDetail.doctor.name}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Email</div>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937' }}>
                        {selectedAppointmentDetail.doctor.email}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Chuyên khoa</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#2563eb' }}>
                        {selectedAppointmentDetail.doctor.specialty?.name || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin lịch hẹn */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📅</span> Thời gian khám
                </h3>
                <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Ngày khám</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                        {new Date(selectedAppointmentDetail.appointmentDate).toLocaleDateString('vi-VN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Giờ khám</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                        {new Date(selectedAppointmentDetail.appointmentDate).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Ngày tạo</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {new Date(selectedAppointmentDetail.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hồ sơ bệnh án (nếu có) */}
              {selectedAppointmentDetail.medicalRecord && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📋</span> Hồ sơ bệnh án
                  </h3>
                  <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#92400e', marginBottom: '4px', fontWeight: '600' }}>Chẩn đoán</div>
                      <div style={{ fontSize: '14px', color: '#78350f' }}>
                        {selectedAppointmentDetail.medicalRecord.diagnosis}
                      </div>
                    </div>
                    {selectedAppointmentDetail.medicalRecord.symptoms && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '13px', color: '#92400e', marginBottom: '4px', fontWeight: '600' }}>Triệu chứng</div>
                        <div style={{ fontSize: '14px', color: '#78350f' }}>
                          {selectedAppointmentDetail.medicalRecord.symptoms}
                        </div>
                      </div>
                    )}
                    {selectedAppointmentDetail.medicalRecord.notes && (
                      <div>
                        <div style={{ fontSize: '13px', color: '#92400e', marginBottom: '4px', fontWeight: '600' }}>Ghi chú</div>
                        <div style={{ fontSize: '14px', color: '#78350f' }}>
                          {selectedAppointmentDetail.medicalRecord.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #f0f0f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAppointmentDetail(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'white',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowAppointmentDetail(false)
                    handleDeleteAppointment(selectedAppointmentDetail.id)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  🗑️ Xóa lịch hẹn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Specialty Modal */}
      {showSpecialtyModal && (
        <div className="modal-overlay" onClick={() => setShowSpecialtyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
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
                {editingSpecialty ? 'Sửa chuyên khoa' : 'Thêm chuyên khoa mới'}
              </h2>
              <button
                onClick={() => setShowSpecialtyModal(false)}
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
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSpecialty} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                  Tên chuyên khoa *
                </label>
                <input
                  type="text"
                  value={specialtyForm.name}
                  onChange={(e) => setSpecialtyForm({name: e.target.value})}
                  placeholder="Ví dụ: Cardiology, Neurology, Khoa Nội..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    margin: 0
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowSpecialtyModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'white',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: 0
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
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: 0
                  }}
                >
                  {editingSpecialty ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

