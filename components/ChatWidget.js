import { useState, useEffect, useRef } from 'react'

let socket
let io

// Only import socket.io-client on client side
if (typeof window !== 'undefined') {
  import('socket.io-client').then(module => {
    io = module.io
  })
}

export default function ChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)
  const soundRef = useRef(null)

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      socketInitializer()
      loadOrCreateChat()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [user])

  useEffect(() => {
    if (chat && isOpen) {
      loadMessages()
      // Auto focus input when open
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      
      // Poll for new messages every 5 seconds when chat is open
      const pollInterval = setInterval(() => {
        if (!isSending) {
          loadMessages()
        }
      }, 5000)
      
      return () => clearInterval(pollInterval)
    }
  }, [chat, isOpen, isSending])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Play notification sound for new messages
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.senderId !== user.id && !isOpen) {
        playNotificationSound()
      }
    }
  }, [messages.length])

  const playNotificationSound = () => {
    // Simple beep sound using Web Audio API
    if (typeof window === 'undefined') return
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.1
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      console.log('Cannot play notification sound:', e)
    }
  }

  const socketInitializer = async () => {
    if (!io) {
      console.log('Socket.io not loaded yet')
      return
    }
    
    await fetch('/api/socket')
    socket = io({
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socket.on('connect', () => {
      console.log('✅ Connected to support chat')
      if (user) {
        socket.emit('join', user.id)
      }
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from support chat')
    })

    socket.on('receive-message', async (data) => {
      const { senderId, message } = data
      
      // Add message to current chat
      if (chat && (senderId === user.id || user.role === 'admin')) {
        setMessages(prev => {
          // Prevent duplicate messages
          if (prev.some(m => m.id === message.id)) {
            return prev
          }
          return [...prev, message]
        })
        
        if (!isOpen && senderId !== user.id) {
          setUnreadCount(prev => prev + 1)
          playNotificationSound()
        }
      }
    })

    socket.on('users-online', (users) => {
      setOnlineUsers(users)
    })

    socket.on('user-typing', (data) => {
      if (chat && data.userId !== user.id) {
        setIsTyping(true)
      }
    })

    socket.on('user-stop-typing', (data) => {
      if (chat && data.userId !== user.id) {
        setIsTyping(false)
      }
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function loadOrCreateChat() {
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setChat(data)
      }
    } catch (err) {
      console.error('Error loading chat:', err)
    }
  }

  async function loadMessages() {
    if (!chat) return
    
    try {
      setIsLoadingMessages(true)
      const res = await fetch(`/api/support/${chat.id}/messages`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
        setUnreadCount(0)
      } else {
        console.error('Failed to load messages')
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault()
    
    if (!newMessage.trim() || !chat || isSending) return

    const messageToSend = newMessage.trim()
    setNewMessage('')
    setIsSending(true)
    setSendError(null)

    // Optimistic UI update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageToSend,
      senderId: user.id,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      isTemp: true
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const res = await fetch(`/api/support/${chat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: messageToSend })
      })

      if (res.ok) {
        const message = await res.json()
        
        // Replace temp message with real message
        setMessages(prev => prev.map(m => 
          m.id === tempMessage.id ? message : m
        ))
        
        // Send via WebSocket
        const receiverId = user.role === 'admin' ? chat.userId : (chat.adminId || null)
        if (receiverId && socket && socket.connected) {
          socket.emit('send-message', {
            receiverId,
            message
          })
          socket.emit('stop-typing', { receiverId })
        }
        
        // Focus input
        setTimeout(() => inputRef.current?.focus(), 100)
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
        
        const error = await res.json()
        setSendError(error.error || 'Không thể gửi tin nhắn')
        setNewMessage(messageToSend) // Restore message
      }
    } catch (err) {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
      
      console.error('Error sending message:', err)
      setSendError('Lỗi kết nối. Vui lòng thử lại.')
      setNewMessage(messageToSend) // Restore message
    } finally {
      setIsSending(false)
    }
  }

  function handleTyping() {
    if (!chat || !socket || !socket.connected) return
    
    const receiverId = user.role === 'admin' ? chat.userId : (chat.adminId || null)
    if (!receiverId) return
    
    socket.emit('typing', { receiverId })
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { receiverId })
    }, 1000)
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function getOtherUserName() {
    if (user.role === 'admin') {
      return chat?.user?.name || 'Người dùng'
    }
    return chat?.admin?.name || 'Hỗ trợ CSKH'
  }

  function isAdminOnline() {
    if (!chat?.adminId) return false
    return onlineUsers.includes(chat.adminId)
  }

  function formatTime(date) {
    const msgDate = new Date(date)
    const now = new Date()
    const diffMs = now - msgDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    
    return msgDate.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) return null

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          setIsMinimized(false)
          if (!isOpen) {
            setUnreadCount(0)
          }
        }}
        aria-label="Chat hỗ trợ"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          zIndex: 9999,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          outline: 'none'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.5)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)'
        }}
      >
        <span style={{ fontSize: '32px' }}>{isOpen ? '✕' : '💬'}</span>
        {unreadCount > 0 && !isOpen && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '28px',
            height: '28px',
            borderRadius: '14px',
            background: '#ef4444',
            border: '3px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '700',
            color: 'white',
            padding: '0 8px',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Support Chat Popup */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '400px',
          maxWidth: 'calc(100vw - 48px)',
          height: isMinimized ? 'auto' : '640px',
          maxHeight: 'calc(100vh - 140px)',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: isMinimized ? 'pointer' : 'default'
          }} onClick={() => isMinimized && setIsMinimized(false)}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>💬</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {user.role === 'admin' ? 'Hỗ trợ khách hàng' : 'Chat hỗ trợ'}
                  </h3>
                  <div style={{ 
                    fontSize: '13px', 
                    marginTop: '4px', 
                    opacity: 0.95,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {user.role === 'admin' ? (
                      <span>{getOtherUserName()}</span>
                    ) : (
                      <>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isAdminOnline() ? '#4ade80' : '#9ca3af',
                          display: 'inline-block',
                          animation: isAdminOnline() ? 'blink 2s infinite' : 'none'
                        }}></span>
                        <span>{isAdminOnline() ? 'Đang hoạt động' : 'Ngoại tuyến'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMinimized(!isMinimized)
                }}
                aria-label={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                {isMinimized ? '▲' : '▼'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                aria-label="Đóng"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '20px',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                overflowX: 'hidden',
                padding: '20px', 
                background: 'linear-gradient(to bottom, #f0fdf4 0%, #f9fafb 100%)'
              }}>
                {isLoadingMessages ? (
                  <div style={{ textAlign: 'center', color: '#6b7280', paddingTop: '60px' }}>
                    <div style={{ 
                      fontSize: '48px', 
                      marginBottom: '16px',
                      animation: 'spin 1s linear infinite'
                    }}>⏳</div>
                    <p style={{ fontSize: '15px', fontWeight: '500' }}>Đang tải tin nhắn...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#6b7280', paddingTop: '60px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>👋</div>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      {user.role === 'admin' ? 'Chưa có tin nhắn' : 'Xin chào! Chúng tôi có thể giúp gì cho bạn?'}
                    </p>
                    {user.role !== 'admin' && (
                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6b7280', maxWidth: '280px', margin: '0 auto' }}>
                        Hãy gửi tin nhắn và chúng tôi sẽ phản hồi sớm nhất có thể 🚀
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isOwn = msg.senderId === user.id
                      const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId
                      const showName = !isOwn && (user.role === 'admin' || msg.sender?.role === 'admin') && showAvatar
                      
                      return (
                        <div
                          key={msg.id}
                          style={{
                            marginBottom: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isOwn ? 'flex-end' : 'flex-start',
                            animation: msg.isTemp ? 'fadeIn 0.2s ease' : 'slideIn 0.3s ease'
                          }}
                        >
                          {showName && (
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#059669',
                              marginBottom: '4px',
                              marginLeft: '12px'
                            }}>
                              {msg.sender?.name || 'Hỗ trợ viên'}
                            </div>
                          )}
                          <div style={{
                            maxWidth: '80%',
                            padding: '12px 16px',
                            borderRadius: isOwn 
                              ? '20px 20px 4px 20px' 
                              : '20px 20px 20px 4px',
                            background: isOwn
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'white',
                            color: isOwn ? 'white' : '#1f2937',
                            boxShadow: isOwn 
                              ? '0 4px 12px rgba(16, 185, 129, 0.3)' 
                              : '0 2px 8px rgba(0,0,0,0.1)',
                            fontSize: '15px',
                            lineHeight: '1.5',
                            wordWrap: 'break-word',
                            position: 'relative',
                            opacity: msg.isTemp ? 0.7 : 1
                          }}>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                            <div style={{
                              fontSize: '11px',
                              color: isOwn ? 'rgba(255,255,255,0.8)' : '#9ca3af',
                              marginTop: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '4px'
                            }}>
                              <span>{formatTime(msg.createdAt)}</span>
                              {msg.isTemp && <span>⏳</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {isTyping && (
                      <div style={{ 
                        marginTop: '12px',
                        marginLeft: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#10b981',
                        fontSize: '14px',
                        fontStyle: 'italic'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: '4px',
                          padding: '8px 12px',
                          background: 'white',
                          borderRadius: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <span style={{ animation: 'bounce 1.4s infinite 0.0s' }}>●</span>
                          <span style={{ animation: 'bounce 1.4s infinite 0.2s' }}>●</span>
                          <span style={{ animation: 'bounce 1.4s infinite 0.4s' }}>●</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </>
          )}

          {/* Input */}
          {!isMinimized && (
            <form onSubmit={handleSendMessage} style={{
              padding: '20px',
              borderTop: '1px solid #e5e7eb',
              background: 'white'
            }}>
              {sendError && (
                <div style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '12px',
                  fontSize: '13px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #fecaca'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span>
                    <span>{sendError}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSendError(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '0 4px',
                      lineHeight: '1'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={isSending ? 'Đang gửi...' : 'Nhập tin nhắn...'}
                  disabled={isSending}
                  maxLength={1000}
                  rows={1}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '24px',
                    fontSize: '15px',
                    outline: 'none',
                    background: isSending ? '#f9fafb' : 'white',
                    cursor: isSending ? 'not-allowed' : 'text',
                    transition: 'all 0.2s',
                    resize: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    minHeight: '48px',
                    maxHeight: '120px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981'
                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  aria-label="Gửi tin nhắn"
                  style={{
                    padding: '12px',
                    background: (!newMessage.trim() || isSending) 
                      ? '#e5e7eb' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: (!newMessage.trim() || isSending) ? 'not-allowed' : 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.2s',
                    minWidth: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => {
                    if (newMessage.trim() && !isSending) {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)'
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {isSending ? '⏳' : '🚀'}
                </button>
              </div>
              {newMessage.length > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: newMessage.length > 900 ? '#dc2626' : '#9ca3af',
                  marginTop: '8px',
                  textAlign: 'right',
                  fontWeight: newMessage.length > 900 ? '600' : '400'
                }}>
                  {newMessage.length}/1000 ký tự
                </div>
              )}
              <div style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginTop: '8px',
                textAlign: 'center'
              }}>
                Nhấn Enter để gửi • Shift+Enter để xuống dòng
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}
