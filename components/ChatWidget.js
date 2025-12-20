export default function ChatWidget({ user }) {
  if (!user) return null

  // Zalo contact link - số hỗ trợ
  const zaloLink = `https://zalo.me/0366447692`

  const handleZaloClick = () => {
    window.open(zaloLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* Floating Zalo Support Button */}
      <button
        onClick={handleZaloClick}
        aria-label="Liên hệ qua Zalo"
        title="Liên hệ hỗ trợ qua Zalo"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0068FF 0%, #0052CC 100%)',
          boxShadow: '0 8px 24px rgba(0, 104, 255, 0.4)',
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
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 104, 255, 0.5)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 104, 255, 0.4)'
        }}
      >
        <span style={{ fontSize: '32px' }}>💬</span>
      </button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
      `}</style>
    </>
  )
}
