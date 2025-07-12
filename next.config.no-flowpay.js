/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Usar apenas client-side rendering
  output: 'export',
  
  // Desabilitar SSR
  trailingSlash: true,
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom'],
    scrollRestoration: true
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: false
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Desabilitar funcionalidades de pagamento
  env: {
    DISABLE_FLOWPAY: 'true',
    DISABLE_PAYMENTS: 'true',
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5
          }
        }
      };
    }

    // Excluir módulos do interbox-flowpay
    config.resolve.alias = {
      ...config.resolve.alias,
      'interbox-flowpay': false,
      './interbox-flowpay': false,
      '../interbox-flowpay': false,
      '../../interbox-flowpay': false
    };

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/service-worker.js',
        destination: '/sw.js'
      }
    ];
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      }
    ];
  },

  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2
  }
};

export default nextConfig; 