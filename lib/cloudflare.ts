// Cloudflare bindings helper
// Access R2, D1, and other Cloudflare resources
// Created: 2025-10-15

import type { R2Bucket } from "@cloudflare/workers-types";

export interface CloudflareEnv {
  STORAGE: R2Bucket;
  DB?: any; // D1 database
  ENVIRONMENT?: string;
}

/**
 * Get Cloudflare environment from request context
 * Works with both Edge Runtime and local development
 */
export function getCloudflareEnv(): CloudflareEnv | null {
  // In Cloudflare Pages, bindings are in globalThis
  if (typeof globalThis !== "undefined" && (globalThis as any).STORAGE) {
    return {
      STORAGE: (globalThis as any).STORAGE,
      DB: (globalThis as any).DB,
      ENVIRONMENT: (globalThis as any).ENVIRONMENT || "development",
    };
  }

  // Fallback for local development (mock)
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[Cloudflare] Running in development mode without R2. PDF caching disabled.",
    );
    return null;
  }

  return null;
}

/**
 * Check if running on Cloudflare Edge
 */
export function isCloudflareEdge(): boolean {
  return (
    typeof globalThis !== "undefined" &&
    (globalThis as any).STORAGE !== undefined
  );
}
