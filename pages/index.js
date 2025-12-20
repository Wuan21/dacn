import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleBookingClick = () => {
    if (!user) {
      // Chưa đăng nhập -> chuyển đến trang đăng nhập
      router.push('/login')
      return
    }

    if (user.role !== 'patient') {
      // Không phải patient -> hiển thị thông báo
      alert('Chỉ bệnh nhân mới có thể đặt lịch khám. Vui lòng đăng nhập với tài khoản bệnh nhân.')
      return
    }

    // Là patient -> chuyển đến trang danh sách bác sĩ
    router.push('/doctors')
  }

  return (
    <>
      <Navbar />

      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="hero-with-image">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Dịch vụ y tế chất lượng cao</span>
              </div>
              
              <h1>Đặt lịch khám bệnh<br/>dễ dàng</h1>
              <p>Hệ thống đặt lịch khám bệnh trực tuyến hiện đại và tiện lợi. Kết nối bạn với các bác sĩ chuyên nghiệp mọi lúc, mọi nơi.</p>
              
              <div className="hero-features">
                <div className="hero-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Đặt lịch nhanh chóng</span>
                </div>
                <div className="hero-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Bác sĩ giàu kinh nghiệm</span>
                </div>
                <div className="hero-feature-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>Bảo mật thông tin</span>
                </div>
              </div>
              
              <div className="cta-buttons">
                <button 
                  onClick={handleBookingClick} 
                  className="btn btn-primary hero-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      Đặt lịch ngay
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="hero-image">
              <div className="image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=600&fit=crop" 
                  alt="Doctor consultation"
                  className="rounded-image"
                />
                <div className="image-decoration decoration-1"></div>
                <div className="image-decoration decoration-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section-header">
          <h2>Tại sao chọn YourMedicare?</h2>
          <p>Chúng tôi cung cấp dịch vụ chăm sóc sức khỏe toàn diện</p>
        </div>

        <div className="features">
          <div className="feature-card-enhanced">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop" alt="Professional doctors" />
            </div>
            <div className="feature-content">
              <div className="feature-icon"></div>
              <h3>Đội ngũ bác sĩ chuyên nghiệp</h3>
              <p>Các bác sĩ giàu kinh nghiệm từ nhiều chuyên khoa khác nhau</p>
            </div>
          </div>

          <div className="feature-card-enhanced">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" alt="Appointment scheduling" />
            </div>
            <div className="feature-content">
              <div className="feature-icon"></div>
              <h3>Đặt lịch linh hoạt</h3>
              <p>Chọn thời gian khám phù hợp với lịch trình của bạn</p>
            </div>
          </div>

          <div className="feature-card-enhanced">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop" alt="Fast confirmation" />
            </div>
            <div className="feature-content">
              <div className="feature-icon"></div>
              <h3>Xác nhận nhanh chóng</h3>
              <p>Nhận xác nhận lịch hẹn ngay lập tức qua hệ thống</p>
            </div>
          </div>

          <div className="feature-card-enhanced">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop" alt="Security" />
            </div>
            <div className="feature-content">
              <div className="feature-icon"></div>
              <h3>Bảo mật thông tin</h3>
              <p>Thông tin cá nhân được bảo vệ tuyệt đối</p>
            </div>
          </div>

          <div className="feature-card-enhanced">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop" alt="Medical records" />
            </div>
            <div className="feature-content">
              <div className="feature-icon"></div>
              <h3>Quản lý lịch hẹn</h3>
              <p>Theo dõi và quản lý tất cả lịch khám của bạn</p>
            </div>
          </div>

          <div className="feature-card-enhanced">
            <div className="feature-image">
              <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop" alt="Multiple specialties" />
            </div>
            <div className="feature-content">
              <div className="feature-icon"></div>
              <h3>Nhiều chuyên khoa</h3>
              <p>Tim mạch, Da liễu, Nội khoa và nhiều chuyên khoa khác</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-content">
            <h2>Bắt đầu ngay hôm nay</h2>
            <p>Đăng ký tài khoản để trải nghiệm dịch vụ chăm sóc sức khỏe tốt nhất</p>
            <div className="cta-buttons">
              <Link href="/register" className="btn btn-primary">Đăng ký tài khoản</Link>
              <Link href="/specialties" className="btn btn-secondary">Xem chuyên khoa</Link>
            </div>
          </div>
          <div className="cta-image">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=500&fit=crop" 
              alt="Healthcare professionals"
              className="rounded-image"
            />
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .hero-with-image {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
          padding: 80px 60px;
          margin-bottom: 80px;
          border-radius: 32px;
          box-shadow: 0 20px 60px rgba(30, 58, 138, 0.25);
          position: relative;
          overflow: hidden;
        }

        .hero-with-image::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 100px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 24px;
          animation: fadeInDown 0.6s ease-out;
        }

        .hero-badge svg {
          width: 16px;
          height: 16px;
        }

        .hero-text h1 {
          font-size: 56px;
          color: white;
          margin-bottom: 24px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }

        .hero-text p {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 32px;
          line-height: 1.7;
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 40px;
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }

        .hero-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          font-size: 15px;
        }

        .hero-feature-item svg {
          flex-shrink: 0;
          opacity: 0.9;
        }

        .cta-buttons {
          animation: fadeInUp 0.6s ease-out 0.4s both;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 40px !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          background: white !important;
          color: #1e3a8a !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
          transition: all 0.3s ease !important;
          cursor: pointer;
        }

        .hero-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3) !important;
          background: #f8fafc !important;
        }

        .hero-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .hero-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .hero-btn svg {
          flex-shrink: 0;
        }

        .btn-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #1e3a8a;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hero-image {
          position: relative;
          animation: fadeIn 0.8s ease-out 0.5s both;
        }

        .image-wrapper {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
        }

        .hero-image img {
          width: 100%;
          height: auto;
          border-radius: 24px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease;
        }

        .hero-image:hover img {
          transform: scale(1.02);
        }

        .image-decoration {
          position: absolute;
          border-radius: 24px;
          z-index: -1;
        }

        .decoration-1 {
          top: -20px;
          right: -20px;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .decoration-2 {
          bottom: -20px;
          left: -20px;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.2));
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .hero-with-image {
            padding: 40px 24px;
          }

          .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-text h1 {
            font-size: 36px;
          }

          .hero-text p {
            font-size: 16px;
          }

          .hero-btn {
            width: 100%;
            justify-content: center;
          }

          .decoration-1,
          .decoration-2 {
            display: none;
          }
        }

        .rounded-image {
          border-radius: 24px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .section-header h2 {
          font-size: 36px;
          color: #1e3a8a;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .section-header p {
          font-size: 18px;
          color: #475569;
        }

        .feature-card-enhanced {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(30, 58, 138, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid #e2e8f0;
        }

        .feature-card-enhanced:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
        }

        .feature-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .feature-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .feature-card-enhanced:hover .feature-image img {
          transform: scale(1.1);
        }

        .feature-content {
          padding: 24px;
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .feature-content h3 {
          font-size: 20px;
          color: #1e3a8a;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .feature-content p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
        }

        .cta-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          margin-top: 80px;
          padding: 60px 40px;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(30, 58, 138, 0.3);
        }

        .cta-content h2 {
          color: white;
          margin-bottom: 16px;
          font-size: 36px;
          font-weight: 700;
        }

        .cta-content p {
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 24px;
          font-size: 18px;
        }

        .cta-image img {
          width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(30, 58, 138, 0.2);
        }

        @media (max-width: 768px) {
          .hero-content,
          .cta-section {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-text h1 {
            font-size: 36px;
          }

          .section-header h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </>
  )
}
