import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'

export default function AdminSupport() {
  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadChats()
      const interval = setInterval(loadChats, 3000)
      return () => clearInterval(interval)
    }
  }, [user])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.role !== 'admin') {
          router.push('/')
        } else {
          setUser(data)
        }
      } else {
        router.push('/login')
      }
    } catch (err) {
      console.error(err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadChats() {
    try {
      const res = await fetch('/api/support', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setChats(data)
      }
    } catch (err) {
      console.error('Error loading chats:', err)
    }
  }

  async function updateChatStatus(chatId, status) {
    try {
      const res = await fetch(`/api/support/${chatId}/messages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        await loadChats()
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  function getUnreadCount(chat) {
    if (!chat.messages || !chat.messages[0]) return 0
    return chat.messages.filter(m => !m.isRead && m.senderId !== user?.id).length
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Đang tải...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 32px',
            borderBottom: '1px solid #f0f0f0',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white'
          }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
              💬 Quản lý hỗ trợ khách hàng
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Tổng số: {chats.length} cuộc hội thoại
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 32px' }}>
            {chats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Chưa có tin nhắn hỗ trợ
                </h3>
                <p style={{ fontSize: '14px' }}>
                  Khi người dùng gửi yêu cầu hỗ trợ, chúng sẽ xuất hiện ở đây
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      background: selectedChat?.id === chat.id ? '#f0fdf4' : 'white'
                    }}
                    onClick={() => setSelectedChat(selectedChat?.id === chat.id ? null : chat)}
                    onMouseOver={(e) => {
                      if (selectedChat?.id !== chat.id) {
                        e.currentTarget.style.background = '#f9fafb'
                        e.currentTarget.style.borderColor = '#10b981'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedChat?.id !== chat.id) {
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: chat.user.profileImage ? 'transparent' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          fontWeight: '700',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {chat.user.profileImage ? (
                            <img src={chat.user.profileImage} alt={chat.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            chat.user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
                              {chat.user.name}
                            </h3>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: chat.user.role === 'patient' ? '#dbeafe' : '#fef3c7',
                              color: chat.user.role === 'patient' ? '#1e40af' : '#92400e'
                            }}>
                              {chat.user.role === 'patient' ? 'Bệnh nhân' : chat.user.role === 'doctor' ? 'Bác sĩ' : 'Người dùng'}
                            </span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: chat.status === 'open' ? '#dcfce7' : '#f3f4f6',
                              color: chat.status === 'open' ? '#166534' : '#6b7280'
                            }}>
                              {chat.status === 'open' ? '● Đang mở' : '○ Đã đóng'}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                            {chat.user.email}
                          </div>
                          {chat.messages[0] && (
                            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '8px' }}>
                              <strong>Tin nhắn gần nhất:</strong> {chat.messages[0].content}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                          {new Date(chat.lastMessageAt).toLocaleString('vi-VN')}
                        </div>
                        {getUnreadCount(chat) > 0 && (
                          <div style={{
                            background: '#ef4444',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            display: 'inline-block'
                          }}>
                            {getUnreadCount(chat)} mới
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedChat?.id === chat.id && (
                      <div style={{
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateChatStatus(chat.id, 'open')
                            }}
                            style={{
                              padding: '8px 16px',
                              background: chat.status === 'open' ? '#10b981' : 'white',
                              color: chat.status === 'open' ? 'white' : '#10b981',
                              border: `1px solid #10b981`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Mở lại
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateChatStatus(chat.id, 'closed')
                            }}
                            style={{
                              padding: '8px 16px',
                              background: chat.status === 'closed' ? '#6b7280' : 'white',
                              color: chat.status === 'closed' ? 'white' : '#6b7280',
                              border: `1px solid #6b7280`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Đóng
                          </button>
                        </div>
                        <div style={{
                          padding: '16px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          <strong>Lưu ý:</strong> Sử dụng widget chat ở góc dưới bên phải để trả lời tin nhắn của khách hàng
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
