/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Améliore la compatibilité avec Vercel
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  // Configuration pour les API routes doit être dans apiConfig
  apiConfig: {
    bodyParser: {
      sizeLimit: '8mb', // Limite la taille des requêtes pour éviter les abus
    },
  },
  // En-têtes HTTP
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
