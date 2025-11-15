/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // الحفاظ على المسارات النسبية للعمل من USB
  basePath: '',
  assetPrefix: './',
  // إعدادات إضافية للحفاظ على التصميم
  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;