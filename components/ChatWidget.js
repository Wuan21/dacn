import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socket

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
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (user) {
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

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io({
      path: '/socket.io'
    })

    socket.on('connect', () => {
      console.log('Connected to support chat')
      if (user) {
        socket.emit('join', user.id)
      }
    })

    socket.on('receive-message', async (data) => {
      const { senderId, message } = data
      
      // Add message to current chat
      if (chat && (senderId === user.id || user.role === 'admin')) {
        setMessages(prev => [...prev, message])
        if (!isOpen && senderId !== user.id) {
          setUnreadCount(prev => prev + 1)
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

    try {
      const res = await fetch(`/api/support/${chat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: messageToSend })
      })

      if (res.ok) {
        const message = await res.json()
        setMessages(prev => [...prev, message])
        
        // Send via WebSocket
        const receiverId = user.role === 'admin' ? chat.userId : (chat.adminId || null)
        if (receiverId && socket) {
          socket.emit('send-message', {
            receiverId,
            message
          })
          socket.emit('stop-typing', { receiverId })
        }
        
        // Focus input
        inputRef.current?.focus()
      } else {
        const error = await res.json()
        setSendError(error.error || 'Không thể gửi tin nhắn')
        setNewMessage(messageToSend) // Restore message
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setSendError('Lỗi kết nối. Vui lòng thử lại.')
      setNewMessage(messageToSend) // Restore message
    } finally {
      setIsSending(false)
    }
  }

  function handleTyping() {
    if (!chat) return
    
    const receiverId = user.role === 'admin' ? chat.userId : (chat.adminId || null)
    if (!receiverId || !socket) return
    
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

  if (!user) return null

  return (
    <>
      {/* Floating Support Button */}
      <div
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            setUnreadCount(0)
          }
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.5)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)'
        }}
      >
        <span style={{ fontSize: '28px' }}>💬</span>
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '24px',
            height: '24px',
            borderRadius: '12px',
            background: '#ef4444',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            color: 'white',
            padding: '0 6px'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      {/* Support Chat Popup */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '380px',
          height: '600px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {user.role === 'admin' ? '💬 Hỗ trợ khách hàng' : '💬 Chat hỗ trợ'}
              </h3>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                {user.role === 'admin' ? getOtherUserName() : (
                  isAdminOnline() ? '● Đang hoạt động' : '○ Ngoại tuyến'
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f9fafb' }}>
            {isLoadingMessages ? (
              <div style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                <p>Đang tải tin nhắn...</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {user.role === 'admin' ? 'Chưa có tin nhắn' : 'Xin chào! Chúng tôi có thể giúp gì cho bạn?'}
                </p>
                {user.role !== 'admin' && (
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>
                    Hãy gửi tin nhắn và chúng tôi sẽ phản hồi sớm nhất có thể
                  </p>
                )}
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                      animation: 'slideIn 0.3s ease'
                    }}
                  >
                    <div style={{
                      maxWidth: '75%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: msg.senderId === user.id
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'white',
                      color: msg.senderId === user.id ? 'white' : '#1a1a1a',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      fontSize: '14px',
                      wordWrap: 'break-word'
                    }}>
                      {user.role === 'admin' && msg.senderId !== user.id && (
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          marginBottom: '4px',
                          opacity: 0.8
                        }}>
                          {msg.sender.name}
                        </div>
                      )}
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      <div style={{
                        fontSize: '10px',
                        color: msg.senderId === user.id ? 'rgba(255,255,255,0.7)' : '#999',
                        marginTop: '4px',
                        textAlign: 'right'
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ 
                    color: '#10b981', 
                    fontSize: '13px', 
                    fontStyle: 'italic', 
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>●</span>
                    <span>●</span>
                    <span>●</span>
                    <span>Đang nhập...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} style={{
            padding: '16px',
            borderTop: '1px solid #f0f0f0',
            background: 'white'
          }}>
            {sendError && (
              <div style={{
                padding: '8px 12px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>❌ {sendError}</span>
                <button
                  type="button"
                  onClick={() => setSendError(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyPress={handleKeyPress}
                placeholder={isSending ? 'Đang gửi...' : 'Nhập tin nhắn... (Enter để gửi)'}
                disabled={isSending}
                maxLength={1000}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '20px',
                  fontSize: '14px',
                  outline: 'none',
                  background: isSending ? '#f9fafb' : 'white',
                  cursor: isSending ? 'not-allowed' : 'text',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                style={{
                  padding: '10px 16px',
                  background: (!newMessage.trim() || isSending) ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: (!newMessage.trim() || isSending) ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s',
                  minWidth: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  if (newMessage.trim() && !isSending) {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {isSending ? '⏳' : '📤'}
              </button>
            </div>
            {newMessage.length > 0 && (
              <div style={{
                fontSize: '11px',
                color: '#999',
                marginTop: '6px',
                textAlign: 'right'
              }}>
                {newMessage.length}/1000 ký tự
              </div>
            )}
          </form>

          <style jsx>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
