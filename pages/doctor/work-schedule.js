import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const SHIFTS = [
  { id: 'morning', name: 'Sáng', startTime: '08:00', endTime: '12:00', icon: '🌅' },
  { id: 'afternoon', name: 'Chiều', startTime: '13:00', endTime: '17:00', icon: '☀️' },
  { id: 'evening', name: 'Tối', startTime: '18:00', endTime: '22:00', icon: '🌙' }
]

const DAYS_OF_WEEK = [
  { id: 1, name: 'Thứ 2', short: 'T2' },
  { id: 2, name: 'Thứ 3', short: 'T3' },
  { id: 3, name: 'Thứ 4', short: 'T4' },
  { id: 4, name: 'Thứ 5', short: 'T5' },
  { id: 5, name: 'Thứ 6', short: 'T6' },
  { id: 6, name: 'Thứ 7', short: 'T7' },
  { id: 0, name: 'Chủ nhật', short: 'CN' }
]

const MIN_SHIFTS_REQUIRED = 5
const MIN_EVENING_SHIFTS = 2

export default function WorkSchedule() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedSchedules, setSelectedSchedules] = useState({})
  const [slotDurations, setSlotDurations] = useState({}) // Thời lượng ca khám cho từng shift
  const [currentWeekStart, setCurrentWeekStart] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (currentWeekStart && user) {
      loadSchedules()
    }
  }, [currentWeekStart])

  useEffect(() => {
    // Set current week start on mount (Sunday as first day)
    // Get today's date in local timezone
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const date = today.getDate()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate the date of the Sunday of this week
    const sundayDate = date - dayOfWeek
    const sunday = new Date(year, month, sundayDate, 0, 0, 0, 0)
    
    console.log('=== Calculating Week Start ===')
    console.log('Today:', today.toISOString())
    console.log('Today local:', today.toLocaleString('vi-VN'))
    console.log('Day of week:', dayOfWeek, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek])
    console.log('Sunday date:', sundayDate)
    console.log('Week start (Sunday):', sunday.toISOString())
    console.log('Week start local:', sunday.toLocaleString('vi-VN'))
    console.log('Week start YYYY-MM-DD:', sunday.toISOString().split('T')[0])
    
    setCurrentWeekStart(sunday)
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  async function loadSchedules() {
    try {
      // Normalize weekStartDate to YYYY-MM-DD format
      const weekStart = new Date(currentWeekStart)
      weekStart.setHours(0, 0, 0, 0)
      const weekStartStr = weekStart.toISOString().split('T')[0]
      
      const res = await fetch(`/api/doctor/schedule?weekStart=${weekStartStr}`)
      if (res.ok) {
        const data = await res.json()
        // Convert to schedule map
        const scheduleMap = {}
        const durationMap = {}
        data.forEach(schedule => {
          const key = `${schedule.dayOfWeek}-${schedule.shift}`
          scheduleMap[key] = schedule.isAvailable
          durationMap[key] = schedule.slotDuration || 30
        })
        setSelectedSchedules(scheduleMap)
        setSlotDurations(durationMap)
      } else {
        const error = await res.json()
        console.error('API Error:', error)
        setMessage({ type: 'error', text: error.error || 'Không thể tải lịch làm việc' })
      }
    } catch (err) {
      console.error('Fetch Error:', err)
      setMessage({ type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại.' })
    }
  }

  function toggleSchedule(dayId, shiftId) {
    const key = `${dayId}-${shiftId}`
    setSelectedSchedules(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    // Nếu đang chọn và chưa có duration, set mặc định 30 phút
    if (!selectedSchedules[key] && !slotDurations[key]) {
      setSlotDurations(prev => ({
        ...prev,
        [key]: 30
      }))
    }
  }

  function updateSlotDuration(dayId, shiftId, duration) {
    const key = `${dayId}-${shiftId}`
    setSlotDurations(prev => ({
      ...prev,
      [key]: parseInt(duration)
    }))
  }

  function getWeekDateRange() {
    if (!currentWeekStart) return ''
    const endDate = new Date(currentWeekStart)
    endDate.setDate(endDate.getDate() + 6)
    return `${currentWeekStart.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`
  }

  function navigateWeek(direction) {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + (direction * 7))
    newWeekStart.setHours(0, 0, 0, 0)
    setCurrentWeekStart(newWeekStart)
    // Clear message when changing weeks
    setMessage({ type: '', text: '' })
  }

  function getDayDate(dayId) {
    if (!currentWeekStart) return ''
    const date = new Date(currentWeekStart)
    // dayId: 1=Mon, 2=Tue, ..., 0=Sun
    const diff = dayId === 0 ? 6 : dayId - 1
    date.setDate(date.getDate() + diff)
    return `${date.getDate()}-${date.getMonth() + 1}`
  }

  function getStats() {
    const totalShifts = Object.values(selectedSchedules).filter(v => v).length
    const eveningShifts = Object.entries(selectedSchedules)
      .filter(([key, value]) => value && key.endsWith('-evening'))
      .length
    
    return {
      totalShifts,
      eveningShifts,
      isTotalValid: totalShifts >= MIN_SHIFTS_REQUIRED,
      isEveningValid: eveningShifts >= MIN_EVENING_SHIFTS,
      isValid: totalShifts >= MIN_SHIFTS_REQUIRED && eveningShifts >= MIN_EVENING_SHIFTS
    }
  }

  async function saveSchedules() {
    const stats = getStats()
    if (!stats.isValid) {
      setMessage({
        type: 'error',
        text: `Bạn cần chọn ít nhất ${MIN_SHIFTS_REQUIRED} buổi làm việc và ${MIN_EVENING_SHIFTS} buổi tối!`
      })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Convert selected schedules to array
      const schedules = []
      Object.entries(selectedSchedules).forEach(([key, isAvailable]) => {
        if (isAvailable) {
          const [dayOfWeek, shift] = key.split('-')
          const shiftInfo = SHIFTS.find(s => s.id === shift)
          schedules.push({
            dayOfWeek: parseInt(dayOfWeek),
            shift,
            startTime: shiftInfo.startTime,
            endTime: shiftInfo.endTime,
            slotDuration: slotDurations[key] || 30,
            isAvailable: true
          })
        }
      })

      // Normalize weekStartDate to YYYY-MM-DD format
      const weekStart = new Date(currentWeekStart)
      weekStart.setHours(0, 0, 0, 0)
      const weekStartStr = weekStart.toISOString().split('T')[0]

      console.log('Sending schedules:', schedules)
      console.log('Sending weekStartDate:', weekStartStr)

      const res = await fetch('/api/doctor/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedules,
          weekStartDate: weekStartStr
        })
      })

      const data = await res.json()
      console.log('Response:', data)

      if (res.ok) {
        setMessage({ type: 'success', text: 'Lưu lịch làm việc thành công!' })
        // Reload schedules to refresh the UI
        setTimeout(() => {
          loadSchedules()
        }, 500)
      } else {
        console.error('Error response:', data)
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Có lỗi xảy ra')
        setMessage({ type: 'error', text: errorMsg })
      }
    } catch (err) {
      console.error('Save error:', err)
      setMessage({ type: 'error', text: `Lỗi: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#666' }}>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-content">
          <Link href="/" className="nav-logo">🏥 YourMedicare</Link>
          <div className="nav-links">
            <Link href="/doctor">Home</Link>
            <Link href="/doctor/appointments">Lịch hẹn</Link>
            <Link href="/doctor/work-schedule" style={{ color: '#2563eb', fontWeight: '600' }}>Lịch làm việc</Link>
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
              }} style={{ 
                background: '#fee2e2', 
                border: 'none', 
                color: '#dc2626', 
                cursor: 'pointer', 
                padding: '8px 16px', 
                fontSize: '14px', 
                fontWeight: '500',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>→</span> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ 
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
        minHeight: '100vh',
        paddingTop: '40px',
        paddingBottom: '60px'
      }}>
        <div className="container">
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', color: '#1a1a1a', marginBottom: '8px', fontWeight: '700' }}>
              Lịch làm việc
            </h1>
            <p style={{ color: '#666', fontSize: '15px' }}>
              Chọn các ca làm việc (Sáng, Chiều, Tối) cho từng ngày trong tuần. Sau khi chọn xong, click "Lưu lịch làm việc" để lưu.
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px', 
            marginBottom: '32px' 
          }}>
            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '16px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📅
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Tổng số buổi làm</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: stats.isTotalValid ? '#2563eb' : '#dc2626' }}>
                  {stats.totalShifts}/{MIN_SHIFTS_REQUIRED}
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '16px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🌙
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Buổi tối</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: stats.isEveningValid ? '#2563eb' : '#dc2626' }}>
                  {stats.eveningShifts}/{MIN_EVENING_SHIFTS}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Cần thêm {Math.max(0, MIN_EVENING_SHIFTS - stats.eveningShifts)} buổi tối</div>
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '16px', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: stats.isValid 
                  ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
                  : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {stats.isValid ? '✅' : '❌'}
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Trạng thái</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: stats.isValid ? '#059669' : '#dc2626' 
                }}>
                  {stats.isValid ? '✓ Đạt yêu cầu' : '✗ Chưa đạt'}
                </div>
              </div>
            </div>
          </div>

          {/* Week Navigation */}
          <div style={{ 
            background: 'white', 
            padding: '20px 24px', 
            borderRadius: '16px', 
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={() => navigateWeek(-1)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              ← Tuần trước
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>Tuần này</div>
              <div style={{ fontSize: '14px', color: '#666' }}>{getWeekDateRange()}</div>
            </div>
            <button
              onClick={() => navigateWeek(1)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              Tuần sau →
            </button>
          </div>

          {/* Schedule Grid */}
          <div style={{ 
            background: 'white', 
            padding: '28px', 
            borderRadius: '16px', 
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            marginBottom: '24px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '20px' 
            }}>
              <span style={{ fontSize: '24px' }}>📋</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Lịch làm việc tuần này</h2>
            </div>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              Click vào các nút ca làm việc để chọn/bỏ chọn. Khung giờ của mỗi ca (Sáng, Chiều, Tối) được hiển thị rõ ràng ở header bảng.
            </p>

            {/* Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '120px repeat(3, 1fr)', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ padding: '12px', fontWeight: '600', color: '#666' }}>Ngày</div>
              {SHIFTS.map(shift => (
                <div key={shift.id} style={{ 
                  textAlign: 'center', 
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{shift.icon}</div>
                  <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{shift.name}</div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#2563eb', 
                    background: '#eff6ff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginTop: '6px',
                    display: 'inline-block'
                  }}>
                    {shift.startTime} - {shift.endTime}
                  </div>
                </div>
              ))}
            </div>

            {/* Table Body */}
            {DAYS_OF_WEEK.map(day => (
              <div key={day.id} style={{ 
                display: 'grid', 
                gridTemplateColumns: '120px repeat(3, 1fr)', 
                gap: '12px',
                marginBottom: '12px',
                alignItems: 'center'
              }}>
                <div style={{ 
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: '600', color: '#1a1a1a' }}>{day.name}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{getDayDate(day.id)}</div>
                </div>
                {SHIFTS.map(shift => {
                  const key = `${day.id}-${shift.id}`
                  const isSelected = selectedSchedules[key]
                  return (
                    <div key={shift.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={() => toggleSchedule(day.id, shift.id)}
                        style={{
                          padding: '16px',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' 
                            : '#f3f4f6',
                          color: isSelected ? 'white' : '#666',
                          border: isSelected ? '2px solid #2563eb' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {isSelected ? (
                          <>
                            <span style={{ 
                              width: '20px', 
                              height: '20px', 
                              background: 'white', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#2563eb',
                              fontSize: '12px',
                              fontWeight: '700'
                            }}>✓</span>
                            Đã chọn
                          </>
                        ) : (
                          <>
                            <span style={{ 
                              width: '20px', 
                              height: '20px', 
                              background: '#e5e7eb', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}>🕐</span>
                            Chọn
                          </>
                        )}
                      </button>
                      {isSelected && (
                        <div style={{ 
                          padding: '8px 12px', 
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <label style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            display: 'block',
                            marginBottom: '4px',
                            fontWeight: '500'
                          }}>
                            ⏱️ Thời lượng 1 ca:
                          </label>
                          <select
                            value={slotDurations[key] || 30}
                            onChange={(e) => updateSlotDuration(day.id, shift.id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              background: 'white'
                            }}
                          >
                            <option value="15">15 phút</option>
                            <option value="20">20 phút</option>
                            <option value="30">30 phút</option>
                            <option value="45">45 phút</option>
                            <option value="60">60 phút</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Message */}
          {message.text && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: '500'
            }}>
              <span style={{ fontSize: '20px' }}>{message.type === 'success' ? '✅' : '⚠️'}</span>
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={saveSchedules}
              disabled={saving || !stats.isValid}
              style={{
                padding: '16px 48px',
                background: stats.isValid 
                  ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)' 
                  : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: stats.isValid ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: stats.isValid ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? (
                <>
                  <span className="spinner" style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Đang lưu...
                </>
              ) : (
                <>
                  💾 Lưu lịch làm việc
                </>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div style={{ 
            marginTop: '32px',
            padding: '24px',
            background: '#fffbeb',
            borderRadius: '16px',
            border: '1px solid #fbbf24'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💡</span> Hướng dẫn
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '14px', lineHeight: '1.8' }}>
              <li>Bạn cần chọn ít nhất <strong>{MIN_SHIFTS_REQUIRED} buổi làm việc</strong> trong tuần</li>
              <li>Trong đó phải có ít nhất <strong>{MIN_EVENING_SHIFTS} buổi tối</strong> (18:00 - 22:00)</li>
              <li>Click vào ô để chọn/bỏ chọn ca làm việc</li>
              <li>Sau khi chọn ca, bạn có thể chọn <strong>thời lượng 1 ca khám</strong> (15-60 phút). Hệ thống sẽ tự động sinh các slot khám theo thời lượng này</li>
              <li>Sau khi chọn đủ, nhấn "Lưu lịch làm việc" để lưu</li>
              <li>Bạn có thể đăng ký lịch cho các tuần tiếp theo bằng cách chuyển tuần</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
