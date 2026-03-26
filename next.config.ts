import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "650mb",
  },
  async headers() {
    return [
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 24, 32, 48, 64, 96],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.modshaven.com',
      },
    ],
  },
};

export default nextConfig;
