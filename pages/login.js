import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e){
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Redirect based on role
        if (data.role === 'admin') {
          router.push('/admin')
        } else if (data.role === 'doctor') {
          router.push('/doctor')
        } else {
          router.push('/patient/appointments')
        }
      } else {
        if (res.status === 403) {
          setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.')
        } else {
          setError(data.error || 'Đăng nhập thất bại')
        }
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🏥 Đăng nhập</h2>
          <p>Chào mừng bạn trở lại!</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                style={{ paddingRight: '50px', width: '100%', boxSizing: 'border-box' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                  lineHeight: '1',
                  zIndex: 10
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                {showPassword ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="form-footer">
          Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
        </div>

        <div className="form-footer" style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <Link href="/">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  )
}
