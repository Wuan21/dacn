/** Next.js config for Render deployment */
module.exports = {
  reactStrictMode: true,
  // Optimize for production
  swcMinify: true,
  // Ensure proper handling of environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
};
