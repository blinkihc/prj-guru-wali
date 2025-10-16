// Cloudflare bindings helper
// Access R2, D1, and other Cloudflare resources
// Updated: 2025-10-16

import type { R2Bucket } from "@cloudflare/workers-types";

export interface CloudflareEnv {
  STORAGE?: R2Bucket;
  DB?: any; // D1 database
  ENVIRONMENT?: string;
}

/**
 * Get Cloudflare environment from request context
 * Works with Cloudflare Pages (Next.js) and Edge Runtime
 */
export function getCloudflareEnv(): CloudflareEnv | null {
  try {
    // Try to get from @cloudflare/next-on-pages
    // @ts-ignore
    const { getRequestContext } = require("@cloudflare/next-on-pages");
    if (typeof getRequestContext === "function") {
      const ctx = getRequestContext();
      if (ctx?.env) {
        console.log("[Cloudflare] Got bindings from getRequestContext");
        return {
          STORAGE: ctx.env.STORAGE,
          DB: ctx.env.DB,
          ENVIRONMENT: ctx.env.ENVIRONMENT || "production",
        };
      }
    }
  } catch (e) {
    // @cloudflare/next-on-pages not available or getRequestContext failed
    console.log("[Cloudflare] getRequestContext not available, trying globalThis");
  }

  // Fallback: Check globalThis for bindings
  if (typeof globalThis !== "undefined") {
    const hasAnyBinding =
      (globalThis as any).DB ||
      (globalThis as any).STORAGE ||
      (globalThis as any).ENVIRONMENT;

    if (hasAnyBinding) {
      return {
        STORAGE: (globalThis as any).STORAGE,
        DB: (globalThis as any).DB,
        ENVIRONMENT: (globalThis as any).ENVIRONMENT || "production",
      };
    }
  }

  // Local development fallback
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[Cloudflare] Running in development mode. Cloudflare bindings not available.",
    );
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
