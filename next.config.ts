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

  // Webpack optimization for bundle splitting and tree shaking
  webpack: (config, { isServer }) => {
    // Enable tree shaking
    config.optimization.usedExports = true;

    // Simple chunk splitting for better caching
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // Headers for PWA and optimization
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/chunks/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
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
