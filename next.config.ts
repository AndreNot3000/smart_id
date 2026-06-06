import type { NextConfig } from "next";

// When NEXT_PUBLIC_API_URL is empty (the proxy setup), Next.js forwards
// /api/* to the backend. Production defaults to Fly.io; override with
// BACKEND_PROXY_URL if you change hosts.
const BACKEND_PROXY_TARGET =
  process.env.BACKEND_PROXY_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://campus-id-backend.fly.dev'
    : 'http://localhost:8000');
const USE_PROXY = !process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  // Use Windows/system TLS certs during Turbopack build (avoids Google Fonts fetch
  // failures when antivirus TLS inspection is enabled).
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  async rewrites() {
    if (!USE_PROXY) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
