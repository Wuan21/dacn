import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'

export default function MedicalRecords(){
  const [records, setRecords] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(()=>{
    checkAuth()
  },[])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.role !== 'patient') {
          router.push('/')
          return
        }
        setUser(data)
        loadRecords()
      } else {
        router.push('/login')
      }
    } catch (err) {
      router.push('/login')
    }
  }

  async function loadRecords() {
    try {
      const res = await fetch('/api/patient/medical-records')
      if (res.ok) {
        const data = await res.json()
        setRecords(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function viewRecord(record) {
    setSelectedRecord(record)
    setShowModal(true)
  }

  const filteredRecords = records.filter(r => 
    searchTerm === '' ||
    r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.symptoms && r.symptoms.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <>
      <Navbar />

      <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="container" style={{ paddingTop: '40px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', color: '#1e3a8a', marginBottom: '8px', fontWeight: '700' }}>
              📋 Hồ sơ khám bệnh
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Xem lại lịch sử khám bệnh và đơn thuốc của bạn
            </p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo chẩn đoán, bác sĩ, triệu chứng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                outline: 'none'
              }}
            />
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p style={{ color: '#666', fontSize: '16px' }}>Đang tải...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 40px', 
              background: 'white', 
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                margin: '0 auto 24px'
              }}>📋</div>
              <h3 style={{ color: '#1a1a1a', marginBottom: '12px', fontSize: '24px', fontWeight: '600' }}>
                {searchTerm ? 'Không tìm thấy hồ sơ' : 'Chưa có hồ sơ khám bệnh'}
              </h3>
              <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác' 
                  : 'Hồ sơ khám bệnh sẽ được tạo sau khi bác sĩ khám và kê đơn thuốc'}
              </p>
              {!searchTerm && (
                <Link href="/doctors">
                  <button style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
                  }}>
                    📅 Đặt lịch khám
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {filteredRecords.map(record => {
                const doctor = record.appointment.doctor
                const specialty = doctor.doctorProfile?.specialty?.name || 'N/A'
                
                return (
                  <div key={record.id} style={{
                    background: 'white',
                    padding: '28px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: '700',
                            flexShrink: 0
                          }}>
                            👨‍⚕️
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a1a', fontWeight: '600', marginBottom: '4px' }}>
                              Dr. {doctor.name}
                            </h3>
                            <div style={{ fontSize: '14px', color: '#667eea', fontWeight: '500' }}>
                              🏥 {specialty}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                          <div>
                            📅 {new Date(record.appointment.datetime).toLocaleDateString('vi-VN')}
                          </div>
                          <div>
                            🕐 {new Date(record.appointment.datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div>
                            📝 {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>

                        <div style={{ 
                          padding: '16px', 
                          background: '#f9fafb', 
                          borderRadius: '12px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '8px' }}>
                            🩺 Chẩn đoán
                          </div>
                          <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6' }}>
                            {record.diagnosis}
                          </div>
                        </div>

                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: '#dcfce7',
                            color: '#16a34a',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            💊 {record.prescriptions.length} loại thuốc
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => viewRecord(record)}
                        style={{
                          padding: '12px 28px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📋 Xem chi tiết
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedRecord && (
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
                📋 Chi tiết hồ sơ khám
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
              {/* Doctor Info */}
              <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  👨‍⚕️ Thông tin bác sĩ
                </h4>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                  <div><strong>Bác sĩ:</strong> Dr. {selectedRecord.appointment.doctor.name}</div>
                  <div><strong>Chuyên khoa:</strong> {selectedRecord.appointment.doctor.doctorProfile?.specialty?.name || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedRecord.appointment.doctor.email}</div>
                </div>
              </div>

              {/* Appointment Info */}
              <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  📅 Thông tin khám
                </h4>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
                  <div><strong>Ngày khám:</strong> {new Date(selectedRecord.appointment.appointmentDate).toLocaleDateString('vi-VN')}</div>
                  <div><strong>Giờ khám:</strong> {new Date(selectedRecord.appointment.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div><strong>Ngày tạo hồ sơ:</strong> {new Date(selectedRecord.createdAt).toLocaleString('vi-VN')}</div>
                </div>
              </div>

              {/* Diagnosis */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                  🩺 Chẩn đoán
                </label>
                <div style={{ padding: '14px', background: '#fef3c7', borderRadius: '10px', fontSize: '15px', color: '#92400e', lineHeight: '1.6', border: '1px solid #fde68a' }}>
                  {selectedRecord.diagnosis}
                </div>
              </div>

              {/* Symptoms */}
              {selectedRecord.symptoms && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    🤒 Triệu chứng
                  </label>
                  <div style={{ padding: '14px', background: '#f9fafb', borderRadius: '10px', fontSize: '14px', color: '#666', lineHeight: '1.6', border: '1px solid #e5e7eb' }}>
                    {selectedRecord.symptoms}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedRecord.notes && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    📝 Ghi chú của bác sĩ
                  </label>
                  <div style={{ padding: '14px', background: '#f9fafb', borderRadius: '10px', fontSize: '14px', color: '#666', lineHeight: '1.6', border: '1px solid #e5e7eb' }}>
                    {selectedRecord.notes}
                  </div>
                </div>
              )}

              {/* Prescriptions */}
              {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    💊 Đơn thuốc ({selectedRecord.prescriptions.length})
                  </label>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {selectedRecord.prescriptions.map((p, i) => (
                      <div key={p.id} style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        border: '2px solid #bbf7d0',
                        borderRadius: '12px',
                        fontSize: '14px'
                      }}>
                        <div style={{ fontWeight: '700', color: '#15803d', marginBottom: '10px', fontSize: '16px' }}>
                          {i + 1}. {p.medication}
                        </div>
                        <div style={{ color: '#166534', lineHeight: '1.8' }}>
                          <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '600', minWidth: '90px' }}>💊 Liều lượng:</span>
                            <span>{p.dosage}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '600', minWidth: '90px' }}>⏰ Thời gian:</span>
                            <span>{p.duration}</span>
                          </div>
                          {p.instructions && (
                            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                              <span style={{ fontWeight: '600', minWidth: '90px' }}>📌 Hướng dẫn:</span>
                              <span>{p.instructions}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div style={{ 
                padding: '16px', 
                background: '#fffbeb', 
                border: '1px solid #fde68a', 
                borderRadius: '10px',
                marginTop: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>⚠️</div>
                  <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Lưu ý quan trọng:</strong>
                    • Sử dụng thuốc theo đúng chỉ định của bác sĩ<br/>
                    • Không tự ý thay đổi liều lượng hoặc ngừng thuốc<br/>
                    • Liên hệ bác sĩ nếu có phản ứng bất thường<br/>
                    • Bảo quản thuốc đúng cách theo hướng dẫn
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 32px',
                    background: 'white',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Đóng
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  🖨️ In hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

