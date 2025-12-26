import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: '/iview3', // Chỉ prefix static assets, không ảnh hưởng routes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bing.net',
      },
    ],
    unoptimized: true, // For development - remove in production
  },
};

export default nextConfig;
