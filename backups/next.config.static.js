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
  
  // Configuração para export estático (Firebase Hosting)
  output: 'export',
  
  // Configurações de produção
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  
  // Configurações de imagens otimizadas
  images: {
    unoptimized: true, // Necessário para export estático
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
  },
  
  // Configurações de webpack para produção
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Otimizações para produção
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
    }
    
    return config;
  },
  
  // Configurações de performance
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig 