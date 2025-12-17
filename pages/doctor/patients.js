import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function DoctorPatients(){
  const [patients, setPatients] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [medicalRecords, setMedicalRecords] = useState([])
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
        loadPatients()
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

  async function loadPatients() {
    try {
      const res = await fetch('/api/doctor/appointments')
      if (res.ok) {
        const appointments = await res.json()
        
        // Extract unique patients
        const patientMap = new Map()
        appointments.forEach(a => {
          if (!patientMap.has(a.patient.id)) {
            patientMap.set(a.patient.id, {
              ...a.patient,
              appointments: [],
              completedAppointments: 0,
              pendingAppointments: 0,
              lastVisit: null
            })
          }
          
          const patient = patientMap.get(a.patient.id)
          patient.appointments.push(a)
          
          if (a.status === 'completed') patient.completedAppointments++
          if (a.status === 'pending') patient.pendingAppointments++
          
          const apptDate = new Date(a.datetime)
          if (!patient.lastVisit || apptDate > new Date(patient.lastVisit)) {
            patient.lastVisit = a.datetime
          }
        })
        
        setPatients(Array.from(patientMap.values()))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function viewPatientHistory(patient) {
    setSelectedPatient(patient)
    
    try {
      const res = await fetch(`/api/doctor/medical-records?patientId=${patient.id}`)
      if (res.ok) {
        const records = await res.json()
        setMedicalRecords(records)
      }
    } catch (err) {
      console.error(err)
    }
    
    setShowModal(true)
  }

  const filteredPatients = patients.filter(p => 
    searchTerm === '' ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            👥 Quản lý bệnh nhân
          </h1>
          <p style={{ color: '#666' }}>
            Xem danh sách bệnh nhân và lịch sử khám bệnh
          </p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm bệnh nhân theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#666' }}>Đang tải...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
            <h3 style={{ color: '#666', marginBottom: '8px' }}>Không có bệnh nhân</h3>
            <p style={{ color: '#999' }}>
              {searchTerm ? 'Không tìm thấy bệnh nhân phù hợp' : 'Chưa có bệnh nhân nào'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredPatients.map(p => (
              <div key={p.id} style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #eee'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: '700'
                  }}>
                    {p.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a1a', marginBottom: '4px' }}>
                      {p.name}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      {p.email}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>Tổng lượt khám:</span>
                    <strong style={{ color: '#333' }}>{p.appointments.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>Đã hoàn thành:</span>
                    <strong style={{ color: '#10b981' }}>{p.completedAppointments}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666' }}>Đang chờ:</span>
                    <strong style={{ color: '#f59e0b' }}>{p.pendingAppointments}</strong>
                  </div>
                  {p.lastVisit && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>Lần khám cuối:</span>
                      <strong style={{ color: '#3b82f6' }}>
                        {new Date(p.lastVisit).toLocaleDateString('vi-VN')}
                      </strong>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => viewPatientHistory(p)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  📋 Xem lịch sử khám
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient History Modal */}
      {showModal && selectedPatient && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
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
                📋 Lịch sử khám bệnh
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
              <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: '700'
                  }}>
                    {selectedPatient.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a1a', marginBottom: '4px' }}>
                      {selectedPatient.name}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {selectedPatient.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Tổng lượt khám</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>
                      {selectedPatient.appointments.length}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Đã hoàn thành</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                      {selectedPatient.completedAppointments}
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Hồ sơ khám</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>
                      {medicalRecords.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Records */}
              <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>📋 Hồ sơ khám bệnh</h4>
              
              {medicalRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <p style={{ color: '#999', fontSize: '14px' }}>Chưa có hồ sơ khám bệnh</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {medicalRecords.map(record => (
                    <div key={record.id} style={{
                      padding: '20px',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>
                            📅 {new Date(record.appointment.appointmentDate).toLocaleDateString('vi-VN')} • 
                            🕐 {new Date(record.appointment.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div style={{ fontSize: '13px', color: '#999' }}>
                            Tạo: {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '6px' }}>
                          🩺 Chẩn đoán
                        </div>
                        <div style={{ fontSize: '14px', color: '#333', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          {record.diagnosis}
                        </div>
                      </div>

                      {record.symptoms && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '6px' }}>
                            🤒 Triệu chứng
                          </div>
                          <div style={{ fontSize: '14px', color: '#333', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                            {record.symptoms}
                          </div>
                        </div>
                      )}

                      {record.notes && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '6px' }}>
                            📝 Ghi chú
                          </div>
                          <div style={{ fontSize: '14px', color: '#333', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                            {record.notes}
                          </div>
                        </div>
                      )}

                      {record.prescriptions && record.prescriptions.length > 0 && (
                        <div>
                          <div style={{ fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '8px' }}>
                            💊 Đơn thuốc ({record.prescriptions.length})
                          </div>
                          <div style={{ display: 'grid', gap: '8px' }}>
                            {record.prescriptions.map((p, i) => (
                              <div key={p.id} style={{
                                padding: '12px',
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                fontSize: '13px'
                              }}>
                                <div style={{ fontWeight: '600', color: '#15803d', marginBottom: '6px' }}>
                                  {i + 1}. {p.medication}
                                </div>
                                <div style={{ color: '#666', lineHeight: '1.6' }}>
                                  <div>• Liều lượng: {p.dosage}</div>
                                  <div>• Thời gian: {p.duration}</div>
                                  {p.instructions && <div>• Hướng dẫn: {p.instructions}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

