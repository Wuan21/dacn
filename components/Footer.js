  import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="footer">
      <div className="footer-top-decoration"></div>
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-column footer-column-wide">
            <div className="footer-logo">
              <div className="logo-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                </svg>
              </div>
              <div>
                <span className="logo-text">YourMedicare</span>
                <span className="logo-tagline">Sức khỏe là tài sản quý giá nhất</span>
              </div>
            </div>
            <p className="footer-description">
              Hệ thống đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam. Kết nối bạn với hơn 1000+ bác sĩ chuyên khoa, phục vụ 24/7 với công nghệ hiện đại và bảo mật tuyệt đối.
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Bác sĩ</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Bệnh nhân</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Hỗ trợ</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li><Link href="/specialties">Chuyên khoa</Link></li>
              <li><Link href="/doctors">Bác sĩ</Link></li>
              <li><Link href="/booking">Đặt lịch khám</Link></li>
              <li><Link href="/patient/appointments">Lịch hẹn của tôi</Link></li>
              <li><Link href="/patient/profile">Hồ sơ bệnh án</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h3 className="footer-title">Dịch vụ</h3>
            <ul className="footer-links">
              <li><a href="#">Khám tổng quát</a></li>
              <li><a href="#">Tư vấn trực tuyến</a></li>
              <li><a href="#">Xét nghiệm y khoa</a></li>
              <li><a href="#">Chăm sóc tại nhà</a></li>
              <li><a href="#">Gói khám sức khỏe</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h3 className="footer-title">Liên hệ</h3>
            <ul className="footer-contact">
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div>
                  <strong>Địa chỉ</strong>
                  <span>123 Đường ABC, Q.1, TP.HCM</span>
                </div>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <div>
                  <strong>Hotline</strong>
                  <span>1900 1234 (24/7)</span>
                </div>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <div>
                  <strong>Email</strong>
                  <span>support@yourmedicare.vn</span>
                </div>
              </li>
            </ul>
            
            <div className="social-links">
              <a href="https://www.facebook.com/quanne21/?locale=vi_VN" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/wuan.21/" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} YourMedicare. All rights reserved. Designed with  by Nguyen Anh Quan
            </p>
            <div className="footer-bottom-links">
              <a href="#">Chính sách bảo mật</a>
              <a href="#">Điều khoản sử dụng</a>
              <a href="#">Quy chế hoạt động</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          color: #1e293b;
          margin-top: 100px;
          position: relative;
          border-top: 1px solid #e2e8f0;
        }

        .footer-top-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%);
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 70px 32px 32px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 60px;
          margin-bottom: 50px;
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
          margin-bottom: 8px;
        }

        .logo-icon-wrapper {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
          transition: transform 0.3s ease;
        }

        .logo-icon-wrapper:hover {
          transform: translateY(-4px);
        }

        .logo-text {
          font-size: 26px;
          font-weight: 800;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
          line-height: 1.2;
        }

        .logo-tagline {
          font-size: 13px;
          color: #64748b;
          display: block;
          font-weight: 500;
          margin-top: 4px;
        }

        .footer-description {
          color: #475569;
          line-height: 1.8;
          font-size: 15px;
          margin-top: 4px;
        }

        .footer-stats {
          display: flex;
          gap: 32px;
          padding: 20px 0;
          margin-top: 8px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .footer-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1e293b;
          position: relative;
          padding-bottom: 12px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 48px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 3px;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .footer-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 15px;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          font-weight: 500;
          position: relative;
        }

        .footer-links a::before {
          content: '→';
          margin-right: 8px;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }

        .footer-links a:hover {
          color: #2563eb;
          padding-left: 8px;
        }

        .footer-links a:hover::before {
          opacity: 1;
          transform: translateX(0);
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

        .footer-contact svg {
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .footer-contact li > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-contact strong {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          display: block;
        }

        .footer-contact span {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
        }

        .social-links {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .social-link {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
          color: #64748b;
          transition: all 0.3s ease;
          text-decoration: none;
          border: 2px solid #e2e8f0;
        }

        .social-link:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
          border-color: transparent;
        }

        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
          margin: 20px 0;
        }

        .footer-bottom {
          padding: 24px 0 0;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .copyright {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .footer-bottom-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 6px;
        }

        .footer-bottom-links a:hover {
          color: #2563eb;
          background: #f1f5f9;
        }

        .footer-bottom-links a:not(:last-child)::after {
          content: '•';
          margin-left: 16px;
          color: #cbd5e1;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }

          .footer-stats {
            gap: 24px;
          }
        }

        @media (max-width: 640px) {
          .footer-container {
            padding: 50px 24px 24px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-stats {
            justify-content: space-between;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .footer-bottom-links {
            flex-direction: column;
            gap: 4px;
          }

          .footer-bottom-links a:not(:last-child)::after {
            display: none;
          }
        }
      `}</style>
    </footer>
  )
}