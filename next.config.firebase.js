/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Habilitado para Firebase Hosting
  trailingSlash: true,
  experimental: {
    // appDir: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Headers removidos pois não funcionam com output: 'export'
  // async headers() { ... },
  
  // Configurações de segurança adicionais
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  // Configurações de build
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig 