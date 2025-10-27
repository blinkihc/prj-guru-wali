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

// Setup Cloudflare bindings for local development
// This allows getRequestContext() to work with Wrangler D1
if (process.env.NODE_ENV === "development") {
  // Use dynamic import without top-level await
  import("@cloudflare/next-on-pages/next-dev").then(({ setupDevPlatform }) => {
    setupDevPlatform().catch((e) =>
      console.error("Failed to setup dev platform:", e),
    );
  });
}

export default nextConfig;
