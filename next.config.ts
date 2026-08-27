import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
