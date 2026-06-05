import type { NextConfig } from "next";

// When NEXT_PUBLIC_API_URL is empty (the proxy setup), Next.js forwards
// /api/* to the local backend itself. This lets the frontend be exposed via
// a single Cloudflare tunnel and mobile devices talk to the SAME origin --
// no separate backend tunnel, no CORS, no ngrok.
const BACKEND_PROXY_TARGET =
  process.env.BACKEND_PROXY_URL || 'http://localhost:8000';
const USE_PROXY = !process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
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
