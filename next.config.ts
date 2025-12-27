import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path cho proxy nginx: https://fit.neu.edu.vn/iview3/
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // Asset prefix (nếu cần serve static files từ CDN hoặc path khác)
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bing.net',
      },
    ],
    unoptimized: true, // For development - remove in production
  },
  
  // Disable trailing slashes to avoid redirect issues
  trailingSlash: false,
};

export default nextConfig;
