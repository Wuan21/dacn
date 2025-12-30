import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ActivatePage() {
  const router = useRouter()
  const { code, email } = router.query
  
  const [activationCode, setActivationCode] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoActivating, setAutoActivating] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // Auto-activate nếu có code và email trong URL
  useEffect(() => {
    if (code && email && !autoActivating) {
      setAutoActivating(true)
      handleActivate(email, code)
    } else if (code) {
      setActivationCode(code)
    }
    if (email) {
      setUserEmail(email)
    }
  }, [code, email])

  const handleActivate = async (emailToUse, codeToUse) => {
    const finalEmail = emailToUse || userEmail
    const finalCode = codeToUse || activationCode
    
    if (!finalEmail || !finalCode) {
      setError('Vui lòng nhập đầy đủ email và mã kích hoạt')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: finalEmail, 
          code: finalCode 
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message || 'Kích hoạt tài khoản thành công!')
        // Chuyển hướng đến trang đăng nhập sau 2 giây
        setTimeout(() => {
          router.push('/login?activated=true')
        }, 2000)
      } else {
        setError(data.error || 'Có lỗi xảy ra')
        // Nếu mã hết hạn, hiển thị nút gửi lại
        if (data.expired) {
          // Error message đã được set
        }
      }
    } catch (err) {
      console.error('Activation error:', err)
      setError('Có lỗi xảy ra khi kích hoạt tài khoản')
    } finally {
      setLoading(false)
      setAutoActivating(false)
    }
  }

  const handleResendEmail = async () => {
    if (!userEmail) {
      setError('Vui lòng nhập email')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/resend-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message || 'Email kích hoạt đã được gửi lại!')
      } else {
        setError(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      console.error('Resend error:', err)
      setError('Có lỗi xảy ra khi gửi lại email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '20px',
              animation: 'bounce 2s infinite'
            }}>
              🎉
            </div>
            <h1 style={{ 
              color: '#667eea', 
              marginBottom: '10px',
              fontSize: '28px',
              fontWeight: '700'
            }}>
              Kích hoạt tài khoản
            </h1>
            <p style={{ color: '#718096', fontSize: '15px' }}>
              Nhập mã kích hoạt đã được gửi qua email của bạn (có hiệu lực trong 5 phút)
            </p>
          </div>

          {autoActivating && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: '#eff6ff',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #667eea',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                margin: '0 auto 10px',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: '#1e40af', margin: 0 }}>
                Đang kích hoạt tài khoản...
              </p>
            </div>
          )}

          {message && (
            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ✓ {message}
            </div>
          )}

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ✗ {error}
            </div>
          )}

          {!autoActivating && !message && (
            <form onSubmit={(e) => {
              e.preventDefault()
              handleActivate()
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Mã kích hoạt
                </label>
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength="6"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '20px',
                    fontWeight: '600',
                    letterSpacing: '4px',
                    textAlign: 'center',
                    fontFamily: "'Courier New', monospace",
                    transition: 'border-color 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading 
                    ? '#cbd5e1' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                {loading ? 'Đang xử lý...' : '✓ Kích hoạt tài khoản'}
              </button>
            </form>
          )}

          <div style={{ 
            marginTop: '24px', 
            paddingTop: '24px', 
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{ 
              color: '#718096', 
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              Chưa nhận được email?
            </p>
            <button
              onClick={handleResendEmail}
              disabled={loading || !userEmail}
              style={{
                background: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (loading || !userEmail) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: (loading || !userEmail) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && userEmail) {
                  e.target.style.background = '#667eea'
                  e.target.style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#667eea'
              }}
            >
              📧 Gửi lại mã kích hoạt
            </button>
          </div>

          <div style={{ 
            marginTop: '24px', 
            textAlign: 'center'
          }}>
            <a 
              href="/login"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              ← Quay lại đăng nhập
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <Footer />
    </>
  )
}
