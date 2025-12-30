// lib/hooks/useAuth.js - Custom hook để sử dụng authentication
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export function useAuth(requiredRole) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const loading = status === 'loading'

  useEffect(() => {
    if (!loading) {
      // Redirect to login if not authenticated
      if (!session) {
        router.push('/login?redirect=' + router.asPath)
        return
      }

      // Check role if required
      if (requiredRole && session.user.role !== requiredRole) {
        router.push('/login?error=unauthorized')
        return
      }
    }
  }, [session, loading, router, requiredRole])

  return {
    user: session?.user,
    loading,
    isAuthenticated: !!session,
  }
}

// Hook to get current session without redirecting
export function useCurrentUser() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    loading: status === 'loading',
    isAuthenticated: !!session,
  }
}
