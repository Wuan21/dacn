// Debug endpoint - REMOVE IN PRODUCTION or add authentication
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const debugInfo = {
    nodeEnv: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseProvider: process.env.DATABASE_URL ? process.env.DATABASE_URL.split(':')[0] : 'not set',
    cookieSettings: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer,
    }
  }

  res.status(200).json(debugInfo)
}
