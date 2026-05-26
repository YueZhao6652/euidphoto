import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ⚠️ Next.js 15+ 推荐写法（避免 experimental serverActions 报警）
  serverActions: {
    bodySizeLimit: '10mb',
  },

  images: {
    remotePatterns: [],
  },

  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig