/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', 'localhost', '.trae.cn', '.agent-sandbox-bj-d2-gw.trae.cn'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;