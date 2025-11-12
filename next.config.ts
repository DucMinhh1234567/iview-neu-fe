import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bing.net',
      },
    ],
    unoptimized: true, // For development - remove in production
  },
  async rewrites() {
    // Proxy API requests to backend
    // Cấu hình backend URL theo thứ tự ưu tiên:
    // 1. BACKEND_INTERNAL_URL (URL đầy đủ, ví dụ: http://localhost:5000 hoặc http://backend:8080)
    // 2. BACKEND_PORT (chỉ cần cổng, mặc định localhost và http) - CÁCH DỄ NHẤT
    // 3. BACKEND_HOST + BACKEND_PORT (tách riêng host và port)
    // 4. Mặc định: http://localhost:5000 (cho development)
    
    let backendUrl: string;
    
    if (process.env.BACKEND_INTERNAL_URL) {
      // Ưu tiên 1: URL đầy đủ
      backendUrl = process.env.BACKEND_INTERNAL_URL;
    } else if (process.env.BACKEND_PORT) {
      // Ưu tiên 2: Chỉ cần cổng (dễ nhất cho deploy)
      // Mặc định: localhost và http
      const host = process.env.BACKEND_HOST || '127.0.0.1';
      const port = process.env.BACKEND_PORT;
      const protocol = process.env.BACKEND_PROTOCOL || 'http';
      backendUrl = `${protocol}://${host}:${port}`;
    } else if (process.env.BACKEND_HOST) {
      // Ưu tiên 3: Có HOST nhưng không có PORT
      const host = process.env.BACKEND_HOST;
      const port = process.env.BACKEND_PORT || '5000';
      const protocol = process.env.BACKEND_PROTOCOL || 'http';
      backendUrl = `${protocol}://${host}:${port}`;
    } else {
      // Mặc định cho development
      backendUrl = 'http://localhost:5000';
    }
    
    console.log(`[Next.js Config] Backend URL: ${backendUrl}`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
