import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90, 95],
    deviceSizes: [360, 390, 430, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
