const cookie = require('cookie')

export default async function handler(req, res) {
  // Clear cookie
  res.setHeader('Set-Cookie', cookie.serialize('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0
  }))
  
  res.status(200).json({ message: 'Logged out' })
}
