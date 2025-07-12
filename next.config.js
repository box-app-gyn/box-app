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
  
  // Configuração condicional para export estático (apenas em produção)
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
  }),
  
  // Configurações de produção
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  
  // Configurações de imagens otimizadas para export estático
  images: {
    unoptimized: true, // Necessário para export estático
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Configurações de webpack para produção e export estático
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
      
      // Otimizações específicas para export estático
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Configurações de performance
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Configurações para PWA em export estático
  experimental: {
    // Otimizações para export estático
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'react-apexcharts'],
  },
}

export default nextConfig 