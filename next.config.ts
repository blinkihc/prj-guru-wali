import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization disabled for Cloudflare
  images: {
    unoptimized: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: "Guru Wali Digital Companion",
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
