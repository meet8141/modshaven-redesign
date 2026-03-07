import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
