import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role: 'patient' })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        router.push('/login?registered=true')
      } else {
        setError(data.error || 'Đăng ký thất bại')
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
          <h2>🏥 Đăng ký tài khoản</h2>
          <p>Tạo tài khoản bệnh nhân để đặt lịch khám</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input 
              type="text"
              value={name} 
              onChange={e=>setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

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
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                style={{ paddingRight: '45px', width: '100%', boxSizing: 'border-box' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                  lineHeight: '1'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword} 
                onChange={e=>setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                style={{ paddingRight: '45px', width: '100%', boxSizing: 'border-box' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                  lineHeight: '1'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Đăng ký...' : 'Đăng ký tài khoản bệnh nhân'}
          </button>
        </form>

        <div className="form-footer">
          Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </div>

        <div className="form-footer" style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          <Link href="/">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  )
}
