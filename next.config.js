/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  trailingSlash: false,
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.1.104', '*.local'],
  
  // Configurações para produção (removido output: 'export' para evitar conflito com API routes)
  experimental: {
    // Otimizações para Cloud Run (desabilitado temporariamente)
    // optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  
  // Configurações de compressão
  compress: true,
  
  // Configurações de cache
  generateEtags: true,
  
  // Configurações de imagens
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    dangerouslyAllowSVG: false, // Desabilitar SVG por segurança
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Configurações de webpack para otimização e segurança
  webpack: (config, { dev, isServer }) => {
    // Otimizações para produção
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
        },
      };
      
      // Configurações de segurança
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Configurações de segurança para desenvolvimento
    if (dev) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Configurações de compressão
  compress: true,
  
  // Configurações de performance
  poweredByHeader: false,
  
  // Configurações de segurança
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig 