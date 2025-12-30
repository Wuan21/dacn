import '../styles.css'
import { SessionProvider, useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'

// Disable SSR for ChatWidget to avoid hydration issues
const ChatWidget = dynamic(() => import('../components/ChatWidget'), {
  ssr: false
})

function AppContent({ Component, pageProps }) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <>
      <Component {...pageProps} />
      {user && user.role !== 'admin' && (
        <ChatWidget user={user} />
      )}
    </>
  )
}

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  )
}
