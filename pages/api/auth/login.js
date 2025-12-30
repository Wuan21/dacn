// pages/api/auth/login.js - Legacy endpoint (NextAuth handles this)
// This endpoint is kept for backward compatibility but should use NextAuth

export default async function handler(req, res){
  // NextAuth handles login via POST to /api/auth/callback/credentials
  // This is just a compatibility endpoint
  res.status(200).json({ 
    message: 'Please use NextAuth signIn',
    info: 'Use signIn("credentials", { email, password }) from next-auth/react'
  })
}

