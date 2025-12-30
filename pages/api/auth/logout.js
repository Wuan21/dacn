// pages/api/auth/logout.js - Legacy endpoint (NextAuth handles this via /api/auth/signout)
// This endpoint is kept for backward compatibility but redirects to NextAuth signout

export default async function handler(req, res) {
  // NextAuth handles logout via POST to /api/auth/signout
  // This is just a compatibility endpoint
  res.status(200).json({ 
    message: 'Please use NextAuth signout',
    redirect: '/api/auth/signout' 
  })
}

