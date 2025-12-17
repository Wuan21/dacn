import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <Navbar />

      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="hero-with-image">
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Đặt lịch khám bệnh dễ dàng</h1>
                <p>Hệ thống đặt lịch khám bệnh trực tuyến hiện đại và tiện lợi</p>
                
                <div className="cta-buttons">
                  <Link href="/register" className="btn btn-primary">Đăng ký ngay</Link>
                  <Link href="/login" className="btn btn-secondary">Đăng nhập</Link>
                </div>
              </div>
              
              <div className="hero-image">
                <img 
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=600&fit=crop" 
                  alt="Doctor consultation"
                  className="rounded-image"
                />
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
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          padding: 60px 70px;
          margin-bottom: 60px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(30, 58, 138, 0.3);
        }

        .hero-overlay {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 50px;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-text h1 {
          font-size: 48px;
          color: white;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .hero-text p {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 30px;
        }

        .hero-image img {
          width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .rounded-image {
          border-radius: 16px;
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
