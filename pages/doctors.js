import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Doctors({ doctors, specialty }){
  const router = useRouter()

  return (
    <>
      <Navbar />

      <div className="doctors-page">
        <div className="container">
          {/* Header Section */}
          <div className="page-header">
            <div className="header-content">
              <div className="breadcrumb">
                <Link href="/">Trang chủ</Link>
                <span className="separator">/</span>
                {specialty ? (
                  <>
                    <Link href="/specialties">Chuyên khoa</Link>
                    <span className="separator">/</span>
                    <span className="current">{specialty}</span>
                  </>
                ) : (
                  <span className="current">Bác sĩ</span>
                )}
              </div>
              
              <h1 className="page-title">
                {specialty ? `Bác sĩ chuyên khoa ${specialty}` : 'Danh sách bác sĩ'}
              </h1>
              <p className="page-subtitle">
                {specialty 
                  ? `Tìm và đặt lịch với bác sĩ ${specialty} phù hợp nhất cho bạn` 
                  : 'Chọn bác sĩ phù hợp và đặt lịch khám ngay hôm nay'
                }
              </p>

              {specialty && (
                <div className="filter-section">
                  <Link href="/specialties" className="view-all-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="19" y1="12" x2="5" y2="12"/>
                      <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Xem tất cả chuyên khoa
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Doctors Grid */}
          {doctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="empty-title">Chưa có bác sĩ</h3>
              <p className="empty-description">
                Hiện tại chưa có bác sĩ nào trong {specialty ? `chuyên khoa ${specialty}` : 'danh sách'}
              </p>
              <Link href="/specialties" className="btn-primary">
                Xem chuyên khoa khác
              </Link>
            </div>
          ) : (
            <>
              <div className="results-count">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Tìm thấy <strong>{doctors.length}</strong> bác sĩ
              </div>

              <div className="doctors-grid">
                {doctors.map(d => (
                  <div key={d.id} className="doctor-card">
                    <div className="card-header">
                      <div className="doctor-avatar-wrapper">
                        <div className="doctor-avatar">
                          {d.profileImage ? (
                            <img 
                              src={d.profileImage} 
                              alt={d.name} 
                              loading="lazy"
                            />
                          ) : (
                            <span className="avatar-initial">{d.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="status-badge">
                          <span className="status-dot"></span>
                          Sẵn sàng
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <h3 className="doctor-name">{d.name}</h3>
                      
                      <div className="doctor-specialty-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                          <line x1="12" y1="8" x2="12" y2="16"/>
                          <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                        {d.specialty}
                      </div>

                      {d.bio && (
                        <p className="doctor-bio">{d.bio}</p>
                      )}

                      <div className="doctor-stats">
                        <div className="stat-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span>500+ bệnh nhân</span>
                        </div>
                        <div className="stat-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          <span>4.8/5.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <Link href={`/booking?doctorId=${d.id}`} className="btn-book">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Đặt lịch khám
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .doctors-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          padding: 40px 0 80px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .page-header {
          margin-bottom: 48px;
        }

        .header-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .breadcrumb a {
          color: #64748b;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .breadcrumb a:hover {
          color: #667eea;
        }

        .breadcrumb .separator {
          color: #cbd5e1;
        }

        .breadcrumb .current {
          color: #1e293b;
          font-weight: 600;
        }

        .page-title {
          font-size: 48px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 16px 0;
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 18px;
          color: #64748b;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }

        .filter-section {
          margin-top: 24px;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .view-all-link:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .results-count {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          margin-bottom: 32px;
          color: #64748b;
          font-size: 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .results-count strong {
          color: #667eea;
          font-weight: 700;
        }

        .results-count svg {
          color: #667eea;
        }

        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 28px;
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .doctor-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          border: 2px solid #f1f5f9;
          display: flex;
          flex-direction: column;
        }

        .doctor-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .card-header {
          padding: 32px 24px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          text-align: center;
        }

        .doctor-avatar-wrapper {
          position: relative;
          display: inline-block;
        }

        .doctor-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 4px solid white;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
        }

        .doctor-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .avatar-initial {
          font-size: 40px;
          font-weight: 800;
          color: white;
        }

        .status-badge {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 2px solid #f1f5f9;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .card-body {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .doctor-name {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          text-align: center;
        }

        .doctor-specialty-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #667eea;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          align-self: center;
          border: 1px solid #bfdbfe;
        }

        .doctor-bio {
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          margin: 0;
          text-align: center;
          flex: 1;
        }

        .doctor-stats {
          display: flex;
          gap: 16px;
          justify-content: center;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748b;
        }

        .stat-item svg {
          color: #94a3b8;
        }

        .card-footer {
          padding: 20px 24px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
        }

        .btn-book {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-book:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-book:active {
          transform: translateY(0);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          max-width: 500px;
          margin: 0 auto;
        }

        .empty-icon {
          margin-bottom: 24px;
          color: #cbd5e1;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 12px 0;
        }

        .empty-description {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 32px;
          }

          .page-subtitle {
            font-size: 16px;
          }

          .doctors-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .breadcrumb {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}

export async function getServerSideProps({ query }){
  const params = new URLSearchParams()
  if (query.specialty) params.append('specialty', query.specialty)
  params.append('includeImage', 'true')
  
  const res = await fetch(`http://localhost:3000/api/doctors?${params.toString()}`)
  const doctors = await res.json()
  return { props: { doctors, specialty: query.specialty || null } }
}
