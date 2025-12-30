// middleware.js - Đơn giản hóa cho Pages Router
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { nextUrl, cookies } = req
  
  // Check if user has session cookie
  const sessionToken = cookies.get('next-auth.session-token') || cookies.get('__Secure-next-auth.session-token')
  const isLoggedIn = !!sessionToken

  // Define route patterns
  const isPatientRoute = nextUrl.pathname.startsWith('/patient')
  const isDoctorRoute = nextUrl.pathname.startsWith('/doctor')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isBookingRoute = nextUrl.pathname.startsWith('/booking')
  const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register'
  const isApiRoute = nextUrl.pathname.startsWith('/api')

  // Handle CORS for API routes (but skip auth API routes)
  if (isApiRoute && !nextUrl.pathname.startsWith('/api/auth')) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
    return response
  }

  // Protect patient routes
  if (isPatientRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login?redirect=' + nextUrl.pathname, nextUrl))
  }

  // Protect doctor routes
  if (isDoctorRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login?redirect=' + nextUrl.pathname, nextUrl))
  }

  // Protect admin routes
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login?redirect=' + nextUrl.pathname, nextUrl))
  }

  // Protect booking route
  if (isBookingRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login?redirect=' + nextUrl.pathname, nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
