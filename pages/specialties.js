import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Specialties({ specialties }){
  const specialtyIcons = {
    'Khoa Chấn Thương Chỉnh Hình': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    'Khoa Da Liễu': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
      </svg>
    ),
    'Khoa Nhi': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    'Khoa Nội Tổng Hợp': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 3v18"/>
        <path d="M15 3v18"/>
      </svg>
    ),
    'Khoa Tim Mạch': (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    )
  }

  const specialtyColors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', light: '#eff6ff' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', light: '#fef2f2' },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', light: '#ecfeff' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', light: '#f0fdf4' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', light: '#fffbeb' },
  ]

  return (
    <>
      <Navbar />

      <div className="specialties-page">
        <div className="container">
          {/* Hero Section */}
          <div className="page-header">
            <div className="header-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>Dịch vụ y tế chuyên nghiệp</span>
            </div>
            <h1 className="page-title">Chuyên khoa</h1>
            <p className="page-subtitle">
              Chọn chuyên khoa phù hợp với nhu cầu khám bệnh của bạn
            </p>
          </div>

          {/* Specialties Grid */}
          <div className="specialties-grid">
            {specialties.map((s, index) => {
              const colorScheme = specialtyColors[index % specialtyColors.length]
              
              return (
                <Link href={`/doctors?specialty=${encodeURIComponent(s.name)}`} key={s.id}>
                  <div className="specialty-card">
                    <div className="card-background" style={{ background: colorScheme.bg }}></div>
                    
                    <div className="card-content">
                      <div className="icon-wrapper" style={{ background: colorScheme.light }}>
                        <div className="icon-gradient" style={{ background: colorScheme.bg }}>
                          {specialtyIcons[s.name] || (
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                              <line x1="12" y1="8" x2="12" y2="16"/>
                              <line x1="8" y1="12" x2="16" y2="12"/>
                            </svg>
                          )}
                        </div>
                      </div>

                      <div className="card-body">
                        <h3 className="specialty-name">{s.name}</h3>
                        <p className="specialty-description">
                          Xem danh sách các chuyên khoa và danh sách bác sĩ
                        </p>
                      </div>

                      <div className="card-footer">
                        <span className="view-link">
                          Xem bác sĩ
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="card-decoration">
                      <div className="decoration-circle"></div>
                      <div className="decoration-circle"></div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <div className="cta-card">
              <div className="cta-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="cta-title">Không tìm thấy chuyên khoa phù hợp?</h3>
              <p className="cta-description">Xem danh sách tất cả bác sĩ để tìm kiếm bác sĩ phù hợp nhất với bạn</p>
              <Link href="/doctors" className="btn-cta">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Xem tất cả bác sĩ
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .specialties-page {
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
          text-align: center;
          max-width: 700px;
          margin: 0 auto 64px;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #667eea;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          border: 2px solid #bfdbfe;
        }

        .page-title {
          font-size: 56px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 16px 0;
          line-height: 1.2;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-size: 20px;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }

        .specialties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          margin-bottom: 64px;
        }

        .specialty-card {
          position: relative;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid #f1f5f9;
          height: 100%;
        }

        .specialty-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          opacity: 0.1;
          transition: all 0.4s ease;
        }

        .specialty-card:hover .card-background {
          opacity: 0.15;
          height: 140px;
        }

        .card-content {
          position: relative;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .icon-wrapper {
          width: 96px;
          height: 96px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          position: relative;
          transition: all 0.4s ease;
        }

        .specialty-card:hover .icon-wrapper {
          transform: scale(1.1) rotate(-5deg);
        }

        .icon-gradient {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .card-body {
          text-align: center;
        }

        .specialty-name {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 12px 0;
          line-height: 1.3;
        }

        .specialty-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        .card-footer {
          display: flex;
          justify-content: center;
          padding-top: 8px;
          border-top: 2px solid #f1f5f9;
        }

        .view-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #667eea;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .specialty-card:hover .view-link {
          gap: 12px;
        }

        .view-link svg {
          transition: transform 0.3s ease;
        }

        .specialty-card:hover .view-link svg {
          transform: translateX(4px);
        }

        .card-decoration {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0.05;
        }

        .decoration-circle:first-child {
          width: 150px;
          height: 150px;
          top: -50px;
          right: -50px;
        }

        .decoration-circle:last-child {
          width: 100px;
          height: 100px;
          bottom: -30px;
          left: -30px;
        }

        .cta-section {
          margin-top: 80px;
        }

        .cta-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 32px;
          padding: 64px 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-card::before {
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

        .cta-icon {
          width: 96px;
          height: 96px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          backdrop-filter: blur(10px);
        }

        .cta-title {
          font-size: 32px;
          font-weight: 800;
          color: white;
          margin: 0 0 16px 0;
          position: relative;
        }

        .cta-description {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 32px 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
          position: relative;
        }

        .btn-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 40px;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .btn-cta:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 40px;
          }

          .page-subtitle {
            font-size: 16px;
          }

          .specialties-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .cta-card {
            padding: 48px 32px;
          }

          .cta-title {
            font-size: 24px;
          }

          .cta-description {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  )
}

export async function getServerSideProps(){
  const res = await fetch('http://localhost:3000/api/specialties')
  const specialties = await res.json()
  return { props: { specialties } }
}
