import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: [
        "nontolerable-untenuous-rozella.ngrok-free.dev",
        "https://nontolerable-untenuous-rozella.ngrok-free.dev"
      ],
    },
  },
};

export default nextConfig;
