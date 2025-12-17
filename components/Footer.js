import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#1e3a8a" fillOpacity="0.1"/>
        </svg>
      </div>
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-column footer-column-wide">
            <div className="footer-logo">
              <div className="logo-icon-wrapper">
                <span className="logo-icon"></span>
              </div>
              <div>
                <span className="logo-text">YourMedicare</span>
                <span className="logo-tagline">Chăm sóc sức khỏe của bạn</span>
              </div>
            </div>
            <p className="footer-description">
              Hệ thống đặt lịch khám bệnh trực tuyến hiện đại và tin cậy. Kết nối bạn với đội ngũ bác sĩ chuyên khoa hàng đầu, mọi lúc mọi nơi.
            </p>
            <div className="social-links">
              <a href="#" className="https://www.facebook.com/quanne21/?locale=vi_VN" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="https://www.instagram.com/wuan.21/" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
            </div>
          </div>

          

          {/* Services */}
          <div className="footer-column">
            <h3 className="footer-title">Dịch vụ</h3>
            <ul className="footer-links">
              <li><a href="#">→ Đặt lịch khám</a></li>
              <li><a href="#">→ Tư vấn trực tuyến</a></li>
              <li><a href="#">→ Xét nghiệm</a></li>
              <li><a href="#">→ Khám tổng quát</a></li>
              <li><a href="#">→ Chăm sóc sức khỏe</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h3 className="footer-title">Liên hệ</h3>
            <ul className="footer-contact">
              <li>
                <div className="contact-icon">📍</div>
                <div>
                  <strong>Địa chỉ</strong>
                  <span>123 Đường ABC, Q.1, TP.HCM</span>
                </div>
              </li>
              <li>
                <div className="contact-icon">📞</div>
                <div>
                  <strong>Hotline</strong>
                  <span>(028) 1234 5678</span>
                </div>
              </li>
              <li>
                <div className="contact-icon">✉️</div>
                <div>
                  <strong>Email</strong>
                  <span>contact@yourmedicare.vn</span>
                </div>
              </li>
              <li>
                <div className="contact-icon">⏰</div>
                <div>
                  <strong>Giờ làm việc</strong>
                  <span>24/7 - Luôn sẵn sàng</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2024 YourMedicare. All rights reserved. Made with Nguyen Anh Quan for better healthcare.
            </p>
            <div className="footer-bottom-links">
              <a href="#">Chính sách bảo mật</a>
              <span className="separator">•</span>
              <a href="#">Điều khoản sử dụng</a>
              <span className="separator">•</span>
              <a href="#">Cookies</a>
              <span className="separator">•</span>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: white;
          color: #1e3a8a;
          margin-top: 80px;
          position: relative;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
        }

        .footer-wave {
          position: absolute;
          top: -50px;
          left: 0;
          width: 100%;
          height: 60px;
          overflow: hidden;
        }

        .footer-wave svg {
          width: 100%;
          height: 100%;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 24px 24px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2.5fr 1fr 1fr 1.5fr;
          gap: 60px;
          padding-bottom: 40px;
          border-bottom: 2px solid #e2e8f0;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-column-wide {
          gap: 24px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 4px;
        }

        .logo-icon-wrapper {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .logo-icon {
          font-size: 32px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .logo-text {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
          line-height: 1.2;
        }

        .logo-tagline {
          font-size: 12px;
          color: #64748b;
          display: block;
          font-weight: 500;
          margin-top: 2px;
        }

        .footer-description {
          color: #475569;
          line-height: 1.8;
          font-size: 15px;
        }

        .social-links {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .social-link {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 10px;
          color: #2563eb;
          transition: all 0.3s ease;
          text-decoration: none;
          border: 1px solid #bfdbfe;
        }

        .social-link:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
        }

        .footer-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #1e3a8a;
          position: relative;
          padding-bottom: 12px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 2px;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 15px;
          transition: all 0.3s ease;
          display: inline-block;
          font-weight: 500;
        }

        .footer-links a:hover {
          color: #2563eb;
          transform: translateX(6px);
        }

        .footer-contact {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-contact li {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .contact-icon {
          font-size: 22px;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 8px;
        }

        .footer-contact li > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-contact strong {
          font-size: 13px;
          font-weight: 700;
          color: #1e3a8a;
          display: block;
        }

        .footer-contact span {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
        }

        .footer-bottom {
          padding: 24px 0;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .copyright {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .footer-bottom-links a {
          color: #ffffffff;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
          font-weight: 500;
        }

        .footer-bottom-links a:hover {
          color: #ffffffff;
        }

        .separator {
          color: #cbd5e1;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 640px) {
          .footer-container {
            padding: 40px 20px 20px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .footer-wave {
            display: none;
          }
        }
      `}</style>
    </footer>
  )
}