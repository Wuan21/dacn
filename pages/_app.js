import '../styles.css'
import { useEffect, useState } from 'react'
import ChatWidget from '../components/ChatWidget'

export default function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current user
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setUser(data)
        }
      })
      .catch(err => console.error('Error fetching user:', err))
  }, [])

  return (
    <>
      <Component {...pageProps} />
      {user && user.role !== 'admin' && (
        <ChatWidget user={user} />
      )}
    </>
  )
}
