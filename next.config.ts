import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/iview3",
  assetPrefix: "/iview3/",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.bing.net",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;