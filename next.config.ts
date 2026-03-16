import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "650mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.modshaven.com',
      },
    ],
  },
};

export default nextConfig;
