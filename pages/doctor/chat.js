import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'

export default function DoctorChat() {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [user, setUser] = useState(null)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadChats()
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      if (selectedChat) {
        loadMessages(selectedChat.id, true)
      }
      loadChats()
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        if (data.role !== 'doctor') {
          router.push('/')
        }
      } else {
        router.push('/login')
      }
    } catch (err) {
      router.push('/login')
    }
  }

  async function loadChats() {
    try {
      const res = await fetch('/api/chat', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setChats(data)
      }
    } catch (err) {
      console.error('Error loading chats:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(chatId, silent = false) {
    try {
      const res = await fetch(`/api/chat/${chatId}/messages`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      if (!silent) {
        console.error('Error loading messages:', err)
      }
    }
  }

  async function handleSelectChat(chat) {
    setSelectedChat(chat)
    await loadMessages(chat.id)
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedChat) return

    setSending(true)
    try {
      const res = await fetch(`/api/chat/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newMessage })
      })

      if (res.ok) {
        const message = await res.json()
        setMessages([...messages, message])
        setNewMessage('')
        loadChats()
      } else {
        alert('Không thể gửi tin nhắn')
      }
    } catch (err) {
      alert('Có lỗi xảy ra')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: '#1e3a8a', fontSize: '18px' }}>Đang tải...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', color: '#1e3a8a', marginBottom: '8px', fontWeight: '700' }}>
              💬 Tin nhắn bệnh nhân
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px' }}>
              Trao đổi với bệnh nhân của bạn
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '20px',
            height: 'calc(100vh - 200px)'
          }}>
            {/* Chat List */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '20px',
                borderBottom: '2px solid #f0f0f0',
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                color: 'white'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Cuộc trò chuyện</h3>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {chats.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                    <p>Chưa có cuộc trò chuyện nào</p>
                  </div>
                ) : (
                  chats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        background: selectedChat?.id === chat.id ? '#f0f7ff' : 'white',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = selectedChat?.id === chat.id ? '#f0f7ff' : '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.background = selectedChat?.id === chat.id ? '#f0f7ff' : 'white'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: chat.patient.profileImage ? 'transparent' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '700',
                          overflow: 'hidden'
                        }}>
                          {chat.patient.profileImage ? (
                            <img src={chat.patient.profileImage} alt={chat.patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            chat.patient.name?.charAt(0).toUpperCase() || 'P'
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '15px', color: '#1a1a1a', marginBottom: '4px' }}>
                            {chat.patient.name}
                          </div>
                          <div style={{ fontSize: '13px', color: '#2563eb' }}>
                            Bệnh nhân
                          </div>
                          {chat.messages[0] && (
                            <div style={{
                              fontSize: '13px',
                              color: '#999',
                              marginTop: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {chat.messages[0].content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #f0f0f0',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: selectedChat.patient.profileImage ? 'transparent' : 'rgba(255,255,255,0.2)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: '700',
                      overflow: 'hidden'
                    }}>
                      {selectedChat.patient.profileImage ? (
                        <img src={selectedChat.patient.profileImage} alt={selectedChat.patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        selectedChat.patient.name?.charAt(0).toUpperCase() || 'P'
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '18px', color: 'white' }}>
                        {selectedChat.patient.name}
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                        Bệnh nhân
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    background: '#f9fafb'
                  }}>
                    {messages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#999', paddingTop: '60px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '12px' }}>💬</div>
                        <p>Chưa có tin nhắn nào</p>
                        <p style={{ fontSize: '14px' }}>Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
                      </div>
                    ) : (
                      <>
                        {messages.map(msg => (
                          <div
                            key={msg.id}
                            style={{
                              marginBottom: '16px',
                              display: 'flex',
                              justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: '16px',
                              background: msg.senderId === user?.id
                                ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                                : 'white',
                              color: msg.senderId === user?.id ? 'white' : '#1a1a1a',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                              <div style={{ marginBottom: '4px' }}>{msg.content}</div>
                              <div style={{
                                fontSize: '11px',
                                color: msg.senderId === user?.id ? 'rgba(255,255,255,0.8)' : '#999',
                                textAlign: 'right'
                              }}>
                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} style={{
                    padding: '20px',
                    borderTop: '2px solid #f0f0f0',
                    background: 'white'
                  }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        disabled={sending}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '12px',
                          fontSize: '15px',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        style={{
                          padding: '12px 32px',
                          background: sending || !newMessage.trim() ? '#ccc' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                          boxShadow: sending || !newMessage.trim() ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.4)'
                        }}
                      >
                        {sending ? '⌛' : '📤'} Gửi
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#999',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '64px' }}>💬</div>
                  <p style={{ fontSize: '18px' }}>Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
