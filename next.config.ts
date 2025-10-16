import type { NextConfig } from "next";

// Setup Cloudflare Pages dev platform
if (process.env.NODE_ENV === "development") {
  const { setupDevPlatform } = await import(
    "@cloudflare/next-on-pages/next-dev"
  );
  await setupDevPlatform();
}

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
