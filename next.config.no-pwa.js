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
  
  // Configurações de produção sem export estático
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  
  // Configurações de imagens otimizadas
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Configurações de webpack
  webpack: (config, { dev, isServer }) => {
    // Excluir pasta functions/lib do build
    config.externals = config.externals || [];
    config.externals.push({
      'functions/lib': 'commonjs functions/lib',
    });
    
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
  
  // Configurações experimentais
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'react-apexcharts'],
  },
}

export default nextConfig 