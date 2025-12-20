import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function DoctorAppointments(){
  const [appointments, setAppointments] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [profile, setProfile] = useState(null)
  const [medicalForm, setMedicalForm] = useState({
    diagnosis: '',
    symptoms: '',
    notes: '',
    prescriptions: []
  })
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
      const res = await fetch('/api/doctor/appointments')
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

  function openMedicalRecordModal(appointment) {
    setSelectedAppointment(appointment)
    if (appointment.medicalRecord) {
      setMedicalForm({
        diagnosis: appointment.medicalRecord.diagnosis,
        symptoms: appointment.medicalRecord.symptoms || '',
        notes: appointment.medicalRecord.notes || '',
        prescriptions: appointment.medicalRecord.prescriptions || []
      })
    } else {
      setMedicalForm({
        diagnosis: '',
        symptoms: '',
        notes: '',
        prescriptions: []
      })
    }
    setShowModal(true)
  }

  async function saveMedicalRecord(e) {
    e.preventDefault()
    
    if (!medicalForm.diagnosis.trim()) {
      alert('Vui lòng nhập chẩn đoán')
      return
    }

    try {
      const res = await fetch('/api/doctor/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          diagnosis: medicalForm.diagnosis,
          symptoms: medicalForm.symptoms,
          notes: medicalForm.notes,
          prescriptions: medicalForm.prescriptions
        })
      })

      if (res.ok) {
        alert('Đã lưu hồ sơ khám bệnh thành công!')
        setShowModal(false)
        loadAppointments()
      } else {
        const data = await res.json()
        alert(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    }
  }

  function addPrescription() {
    setMedicalForm({
      ...medicalForm,
      prescriptions: [...medicalForm.prescriptions, {
        medication: '',
        dosage: '',
        duration: '',
        instructions: ''
      }]
    })
  }

  function updatePrescription(index, field, value) {
    const newPrescriptions = [...medicalForm.prescriptions]
    newPrescriptions[index][field] = value
    setMedicalForm({ ...medicalForm, prescriptions: newPrescriptions })
  }

  function removePrescription(index) {
    const newPrescriptions = medicalForm.prescriptions.filter((_, i) => i !== index)
    setMedicalForm({ ...medicalForm, prescriptions: newPrescriptions })
  }

  function getStatusBadge(status) {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', text: '⏳ Chờ xác nhận' },
      confirmed: { bg: '#dbeafe', color: '#1e40af', text: '✓ Đã xác nhận' },
      completed: { bg: '#d1fae5', color: '#065f46', text: '✓ Hoàn thành' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', text: '✕ Đã hủy' }
    }
    const style = styles[status] || styles.pending
    return (
      <span style={{
        padding: '6px 12px',
        background: style.bg,
        color: style.color,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600'
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
      const matchFilter = 
        filter === 'all' ||
        (filter === 'today' && apptDate.toDateString() === today.toDateString()) ||
        (filter === 'week' && apptDate >= today && apptDate < weekLater) ||
        (filter === 'pending' && a.status === 'pending') ||
        (filter === 'confirmed' && a.status === 'confirmed') ||
        (filter === 'completed' && a.status === 'completed')
      
      const matchSearch = searchTerm === '' || 
        a.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchFilter && matchSearch
    })
  }

  const filteredAppointments = filterAppointments(appointments)

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

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: '#1a1a1a', marginBottom: '8px' }}>
            📅 Quản lý lịch hẹn
          </h1>
          <p style={{ color: '#666' }}>
            Xem và quản lý tất cả lịch hẹn khám bệnh
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',
              minWidth: '250px',
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'white'
            }}
          >
            <option value="all">Tất cả</option>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#666' }}>Đang tải...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#666', marginBottom: '8px' }}>Không có lịch hẹn</h3>
            <p style={{ color: '#999' }}>
              {searchTerm || filter !== 'all' 
                ? 'Không tìm thấy lịch hẹn phù hợp' 
                : 'Chưa có lịch hẹn nào'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredAppointments.map(a => (
              <div key={a.id} style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: a.medicalRecord ? '2px solid #10b981' : '1px solid #eee'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
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
                      {a.patient.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a1a' }}>
                        {a.patient.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>
                        {a.patient.email}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        📅 {new Date(a.appointmentDate).toLocaleDateString('vi-VN')} • 
                        🕐 {new Date(a.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {getStatusBadge(a.status)}
                    {a.medicalRecord && (
                      <span style={{
                        padding: '6px 12px',
                        background: '#d1fae5',
                        color: '#065f46',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        📋 Có hồ sơ
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {a.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(a.id, 'confirmed')}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          padding: '10px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        ✓ Xác nhận
                      </button>
                      <button
                        onClick={() => updateStatus(a.id, 'cancelled')}
                        style={{
                          flex: 1,
                          minWidth: '120px',
                          padding: '10px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        ✗ Hủy
                      </button>
                    </>
                  )}

                  {(a.status === 'confirmed' || a.status === 'completed') && (
                    <button
                      onClick={() => openMedicalRecordModal(a)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: a.medicalRecord ? '#3b82f6' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      {a.medicalRecord ? '📋 Xem hồ sơ khám' : '➕ Tạo hồ sơ khám'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical Record Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              borderRadius: '20px 20px 0 0',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
                {selectedAppointment?.medicalRecord ? '📋 Hồ sơ khám bệnh' : '➕ Tạo hồ sơ khám'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'white'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Patient Info */}
              <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>👤 Thông tin bệnh nhân</h4>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                  <div><strong>Họ tên:</strong> {selectedAppointment?.patient.name}</div>
                  <div><strong>Email:</strong> {selectedAppointment?.patient.email}</div>
                  <div><strong>Ngày khám:</strong> {new Date(selectedAppointment?.appointmentDate).toLocaleString('vi-VN')}</div>
                </div>
              </div>

              {selectedAppointment?.medicalRecord ? (
                /* View Mode */
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      🩺 Chẩn đoán
                    </label>
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px' }}>
                      {selectedAppointment.medicalRecord.diagnosis}
                    </div>
                  </div>

                  {selectedAppointment.medicalRecord.symptoms && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        🤒 Triệu chứng
                      </label>
                      <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px' }}>
                        {selectedAppointment.medicalRecord.symptoms}
                      </div>
                    </div>
                  )}

                  {selectedAppointment.medicalRecord.notes && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        📝 Ghi chú
                      </label>
                      <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px' }}>
                        {selectedAppointment.medicalRecord.notes}
                      </div>
                    </div>
                  )}

                  {selectedAppointment.medicalRecord.prescriptions?.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        💊 Đơn thuốc
                      </label>
                      {selectedAppointment.medicalRecord.prescriptions.map((p, i) => (
                        <div key={i} style={{
                          padding: '16px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                            {i + 1}. {p.medication}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                            <div><strong>Liều lượng:</strong> {p.dosage}</div>
                            <div><strong>Thời gian:</strong> {p.duration}</div>
                            {p.instructions && <div><strong>Hướng dẫn:</strong> {p.instructions}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={saveMedicalRecord}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      🩺 Chẩn đoán *
                    </label>
                    <textarea
                      value={medicalForm.diagnosis}
                      onChange={(e) => setMedicalForm({...medicalForm, diagnosis: e.target.value})}
                      placeholder="Nhập chẩn đoán bệnh..."
                      required
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      🤒 Triệu chứng
                    </label>
                    <textarea
                      value={medicalForm.symptoms}
                      onChange={(e) => setMedicalForm({...medicalForm, symptoms: e.target.value})}
                      placeholder="Mô tả triệu chứng..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      📝 Ghi chú thêm
                    </label>
                    <textarea
                      value={medicalForm.notes}
                      onChange={(e) => setMedicalForm({...medicalForm, notes: e.target.value})}
                      placeholder="Ghi chú khác..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Prescriptions */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        💊 Đơn thuốc
                      </label>
                      <button
                        type="button"
                        onClick={addPrescription}
                        style={{
                          padding: '6px 16px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        ➕ Thêm thuốc
                      </button>
                    </div>

                    {medicalForm.prescriptions.map((p, i) => (
                      <div key={i} style={{
                        padding: '16px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <strong style={{ color: '#333', fontSize: '14px' }}>Thuốc {i + 1}</strong>
                          <button
                            type="button"
                            onClick={() => removePrescription(i)}
                            style={{
                              padding: '4px 12px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '12px' }}>
                          <input
                            type="text"
                            value={p.medication}
                            onChange={(e) => updatePrescription(i, 'medication', e.target.value)}
                            placeholder="Tên thuốc *"
                            required
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '13px'
                            }}
                          />
                          <input
                            type="text"
                            value={p.dosage}
                            onChange={(e) => updatePrescription(i, 'dosage', e.target.value)}
                            placeholder="Liều lượng (VD: 1 viên x 3 lần/ngày) *"
                            required
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '13px'
                            }}
                          />
                          <input
                            type="text"
                            value={p.duration}
                            onChange={(e) => updatePrescription(i, 'duration', e.target.value)}
                            placeholder="Thời gian dùng (VD: 7 ngày) *"
                            required
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '13px'
                            }}
                          />
                          <input
                            type="text"
                            value={p.instructions}
                            onChange={(e) => updatePrescription(i, 'instructions', e.target.value)}
                            placeholder="Hướng dẫn (VD: Uống sau ăn)"
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    {medicalForm.prescriptions.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#999', fontSize: '14px' }}>
                        Chưa có thuốc nào. Nhấn "Thêm thuốc" để kê đơn.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'white',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
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
                        fontWeight: '500'
                      }}
                    >
                      💾 Lưu hồ sơ
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

