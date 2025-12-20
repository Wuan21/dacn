import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function PatientDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [recentAppointments, setRecentAppointments] = useState([])
  const [recentRecords, setRecentRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user info
      const userRes = await fetch('/api/auth/me')
      const userData = await userRes.json()
      setUserName(userData.name || 'Bệnh nhân')
      
      // Fetch appointments
      const appointmentsRes = await fetch('/api/appointments')
      const appointments = await appointmentsRes.json()
      
      // Fetch medical records
      const recordsRes = await fetch('/api/patient/medical-records')
      const records = await recordsRes.json()
      
      // Calculate stats
      const now = new Date()
      const upcomingAppointments = appointments.filter(apt => 
        apt.status === 'confirmed' && new Date(apt.appointmentDate) > now
      )
      
      const stats = {
        totalAppointments: appointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        totalMedicalRecords: records.length
      }
      
      setStats(stats)
      setRecentAppointments(appointments.slice(0, 5))
      setRecentRecords(records.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      alert('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { 
        text: 'Chờ xác nhận', 
        icon: '⏳',
        gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        bg: '#fffbeb',
        color: '#d97706'
      },
      confirmed: { 
        text: 'Đã xác nhận', 
        icon: '✅',
        gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        bg: '#ecfdf5',
        color: '#059669'
      },
      completed: { 
        text: 'Hoàn thành', 
        icon: '✔️',
        gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        bg: '#eff6ff',
        color: '#2563eb'
      },
      cancelled: { 
        text: 'Đã hủy', 
        icon: '❌',
        gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
        bg: '#fef2f2',
        color: '#dc2626'
      }
    }
    const style = statusMap[status] || statusMap.pending
    return (
      <span style={{
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        color: style.color,
        background: style.bg,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        border: `1px solid ${style.color}20`
      }}>
        <span>{style.icon}</span>
        {style.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
        
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px 20px;
          }
          
          .loading-spinner {
            text-align: center;
          }
          
          .spinner {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            border: 4px solid #f1f5f9;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loading-spinner p {
            color: #64748b;
            font-size: 16px;
            font-weight: 500;
          }
        `}</style>
<Footer />

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          padding: 40px 0 80px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Welcome Header */
        .welcome-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 32px;
          padding: 48px;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .welcome-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .welcome-content {
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .greeting-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .page-title {
          font-size: 48px;
          font-weight: 800;
          color: white;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.6;
        }

        .welcome-illustration {
          position: relative;
          z-index: 1;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 24px;
          padding: 28px;
          display: flex;
          gap: 20px;
          transition: all 0.3s ease;
          border: 2px solid #f1f5f9;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          opacity: 0.05;
          transition: all 0.3s ease;
        }

        .stat-card.stat-blue::before {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .stat-card.stat-green::before {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-card.stat-cyan::before {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        }

        .stat-card.stat-orange::before {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: transparent;
        }

        .stat-card:hover::before {
          opacity: 0.1;
          width: 150px;
          height: 150px;
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-blue .stat-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .stat-green .stat-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-cyan .stat-icon {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        }

        .stat-orange .stat-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-number {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .stat-progress {
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-bar {
          height: 100%;
          border-radius: 10px;
          transition: width 0.8s ease;
        }

        .stat-blue .progress-bar {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .stat-green .progress-bar {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-cyan .progress-bar {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        }

        .stat-orange .progress-bar {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 28px;
          margin-bottom: 40px;
        }

        .content-card {
          background: white;
          border-radius: 24px;
          padding: 28px;
          border: 2px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .content-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f1f5f9;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .card-title svg {
          color: #667eea;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 20px;
        }

        .empty-text {
          color: #94a3b8;
          font-size: 16px;
          margin: 0 0 24px 0;
        }

        .empty-action-btn {
          padding: 12px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .empty-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        /* Appointments List */
        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .appointment-item {
          padding: 20px;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .appointment-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
          transform: translateX(4px);
        }

        .appointment-doctor {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .doctor-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
        }

        .doctor-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .doctor-info {
          flex: 1;
        }

        .doctor-name {
          font-size: 17px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .doctor-specialty {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #64748b;
        }

        .doctor-specialty svg {
          color: #94a3b8;
        }

        .appointment-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .appointment-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #64748b;
        }

        .appointment-time svg {
          color: #94a3b8;
        }

        /* Records List */
        .records-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .record-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .record-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
          transform: translateX(4px);
        }

        .record-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          flex-shrink: 0;
        }

        .record-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .record-diagnosis {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .record-doctor,
        .record-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .record-doctor svg,
        .record-date svg {
          color: #94a3b8;
        }

        /* Quick Actions */
        .quick-actions-section {
          margin-top: 48px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 24px 0;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .action-card {
          background: white;
          border: 2px solid #f1f5f9;
          border-radius: 24px;
          padding: 32px 28px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-align: left;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.4s ease;
        }

        .action-card.action-blue::before {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .action-card.action-green::before {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .action-card.action-orange::before {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .action-card.action-purple::before {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .action-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
          border-color: transparent;
        }

        .action-card:hover::before {
          opacity: 0.08;
          width: 200px;
          height: 200px;
        }

        .action-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .action-blue .action-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .action-green .action-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .action-orange .action-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .action-purple .action-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .action-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
          position: relative;
          z-index: 1;
        }

        .action-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 16px 0;
          position: relative;
          z-index: 1;
        }

        .action-arrow {
          display: flex;
          align-items: center;
          color: #667eea;
          transition: transform 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .action-card:hover .action-arrow {
          transform: translateX(8px);
        }

        @media (max-width: 1200px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .welcome-header {
            padding: 32px 24px;
            flex-direction: column;
            text-align: center;
          }

          .welcome-illustration {
            display: none;
          }

          .page-title {
            font-size: 32px;
          }

          .page-subtitle {
            font-size: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <div className="welcome-content">
              <div className="greeting-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Xin chào!</span>
              </div>
              <h1 className="page-title">
                Chào mừng trở lại, {userName}
              </h1>
              <p className="page-subtitle">
                Tổng quan về lịch hẹn và hồ sơ khám bệnh của bạn
              </p>
            </div>
            <div className="welcome-illustration">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" fill="url(#gradient1)" opacity="0.1"/>
                <circle cx="100" cy="100" r="60" fill="url(#gradient1)" opacity="0.2"/>
                <path d="M100 60 L100 140 M60 100 L140 100" stroke="url(#gradient1)" strokeWidth="8" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats?.totalAppointments || 0}</div>
                <div className="stat-label">Tổng lịch hẹn</div>
                <div className="stat-progress">
                  <div className="progress-bar" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="stat-card stat-green">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats?.upcomingAppointments || 0}</div>
                <div className="stat-label">Lịch hẹn sắp tới</div>
                <div className="stat-progress">
                  <div className="progress-bar" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            <div className="stat-card stat-cyan">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats?.completedAppointments || 0}</div>
                <div className="stat-label">Đã hoàn thành</div>
                <div className="stat-progress">
                  <div className="progress-bar" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="stat-card stat-orange">
              <div className="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats?.totalMedicalRecords || 0}</div>
                <div className="stat-label">Hồ sơ khám bệnh</div>
                <div className="stat-progress">
                  <div className="progress-bar" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appointments & Medical Records */}
          <div className="content-grid">
            {/* Recent Appointments */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Lịch hẹn gần đây
                </h2>
                <button onClick={() => router.push('/patient/appointments')} className="view-all-btn">
                  Xem tất cả
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>

              {recentAppointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <p className="empty-text">Chưa có lịch hẹn nào</p>
                  <button onClick={() => router.push('/doctors')} className="empty-action-btn">
                    Đặt lịch ngay
                  </button>
                </div>
              ) : (
                <div className="appointments-list">
                  {recentAppointments.map(appointment => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-doctor">
                        <div className="doctor-avatar">
                          {appointment.doctor?.profileImage ? (
                            <img src={appointment.doctor.profileImage} alt={appointment.doctor.name} />
                          ) : (
                            <span>{appointment.doctor?.name?.charAt(0).toUpperCase() || 'D'}</span>
                          )}
                        </div>
                        <div className="doctor-info">
                          <div className="doctor-name">{appointment.doctor?.name || 'Bác sĩ'}</div>
                          <div className="doctor-specialty">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                              <line x1="12" y1="8" x2="12" y2="16"/>
                              <line x1="8" y1="12" x2="16" y2="12"/>
                            </svg>
                            {appointment.doctor?.specialty?.name || 'Chuyên khoa'}
                          </div>
                        </div>
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-time">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Medical Records */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Hồ sơ khám gần đây
                </h2>
                <button onClick={() => router.push('/patient/medical-records')} className="view-all-btn">
                  Xem tất cả
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>

              {recentRecords.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <p className="empty-text">Chưa có hồ sơ khám bệnh</p>
                </div>
              ) : (
                <div className="records-list">
                  {recentRecords.map(record => (
                    <div key={record.id} className="record-item">
                      <div className="record-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div className="record-content">
                        <div className="record-diagnosis">{record.diagnosis}</div>
                        <div className="record-doctor">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          Bác sĩ: {record.appointment?.doctor?.name || 'N/A'}
                        </div>
                        <div className="record-date">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {formatDate(record.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2 className="section-title">Thao tác nhanh</h2>
            <div className="quick-actions-grid">
              <button onClick={() => router.push('/doctors')} className="action-card action-blue">
                <div className="action-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                  </svg>
                </div>
                <h3 className="action-title">Đặt lịch hẹn mới</h3>
                <p className="action-description">Tìm và đặt lịch với bác sĩ phù hợp</p>
                <div className="action-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>
              
              <button onClick={() => router.push('/patient/appointments')} className="action-card action-green">
                <div className="action-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <h3 className="action-title">Quản lý lịch hẹn</h3>
                <p className="action-description">Xem và cập nhật lịch hẹn của bạn</p>
                <div className="action-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>
              
              <button onClick={() => router.push('/patient/medical-records')} className="action-card action-orange">
                <div className="action-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <h3 className="action-title">Xem hồ sơ khám</h3>
                <p className="action-description">Truy cập hồ sơ y tế của bạn</p>
                <div className="action-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>

              <button onClick={() => router.push('/patient/profile')} className="action-card action-purple">
                <div className="action-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h3 className="action-title">Thông tin cá nhân</h3>
                <p className="action-description">Cập nhật thông tin tài khoản</p>
                <div className="action-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          padding: 40px 0 80px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Welcome Header */
        .welcome-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 32px;
          padding: 48px;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .welcome-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .welcome-content {
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .greeting-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .page-title {
          font-size: 48px;
          font-weight: 800;
          color: white;
          margin: 0 0 12px 0;
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.6;
        }

        .welcome-illustration {
          position: relative;
          z-index: 1;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 24px;
          padding: 28px;
          display: flex;
          gap: 20px;
          transition: all 0.3s ease;
          border: 2px solid #f1f5f9;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          opacity: 0.05;
          transition: all 0.3s ease;
        }

        .stat-card.stat-blue::before {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .stat-card.stat-green::before {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-card.stat-cyan::before {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        }

        .stat-card.stat-orange::before {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: transparent;
        }

        .stat-card:hover::before {
          opacity: 0.1;
          width: 150px;
          height: 150px;
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-blue .stat-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .stat-green .stat-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-cyan .stat-icon {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        }

        .stat-orange .stat-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-number {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .stat-progress {
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-bar {
          height: 100%;
          border-radius: 10px;
          transition: width 0.8s ease;
        }

        .stat-blue .progress-bar {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .stat-green .progress-bar {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .stat-cyan .progress-bar {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        }

        .stat-orange .progress-bar {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 28px;
          margin-bottom: 40px;
        }

        .content-card {
          background: white;
          border-radius: 24px;
          padding: 28px;
          border: 2px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .content-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f1f5f9;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .card-title svg {
          color: #667eea;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 20px;
        }

        .empty-text {
          color: #94a3b8;
          font-size: 16px;
          margin: 0 0 24px 0;
        }

        .empty-action-btn {
          padding: 12px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .empty-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        /* Appointments List */
        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .appointment-item {
          padding: 20px;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .appointment-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
          transform: translateX(4px);
        }

        .appointment-doctor {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .doctor-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
        }

        .doctor-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .doctor-info {
          flex: 1;
        }

        .doctor-name {
          font-size: 17px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .doctor-specialty {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #64748b;
        }

        .doctor-specialty svg {
          color: #94a3b8;
        }

        .appointment-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .appointment-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #64748b;
        }

        .appointment-time svg {
          color: #94a3b8;
        }

        /* Records List */
        .records-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .record-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .record-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
          transform: translateX(4px);
        }

        .record-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          flex-shrink: 0;
        }

        .record-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .record-diagnosis {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .record-doctor,
        .record-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .record-doctor svg,
        .record-date svg {
          color: #94a3b8;
        }

        /* Quick Actions */
        .quick-actions-section {
          margin-top: 48px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 24px 0;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .action-card {
          background: white;
          border: 2px solid #f1f5f9;
          border-radius: 24px;
          padding: 32px 28px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-align: left;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.4s ease;
        }

        .action-card.action-blue::before {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .action-card.action-green::before {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .action-card.action-orange::before {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .action-card.action-purple::before {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .action-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
          border-color: transparent;
        }

        .action-card:hover::before {
          opacity: 0.08;
          width: 200px;
          height: 200px;
        }

        .action-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .action-blue .action-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .action-green .action-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .action-orange .action-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .action-purple .action-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .action-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
          position: relative;
          z-index: 1;
        }

        .action-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 16px 0;
          position: relative;
          z-index: 1;
        }

        .action-arrow {
          display: flex;
          align-items: center;
          color: #667eea;
          transition: transform 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .action-card:hover .action-arrow {
          transform: translateX(8px);
        }

        @media (max-width: 1200px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .welcome-header {
            padding: 32px 24px;
            flex-direction: column;
            text-align: center;
          }

          .welcome-illustration {
            display: none;
          }

          .page-title {
            font-size: 32px;
          }

          .page-subtitle {
            font-size: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
