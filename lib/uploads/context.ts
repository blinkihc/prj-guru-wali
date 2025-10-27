// Upload bindings helper - Access Cloudflare DB & R2 for uploads
// Created: 2025-10-19 - Shared across upload API routes

import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { type Database, getDb } from "@/lib/db/client";

export interface UploadBindings {
  bucket: R2Bucket;
  db: Database;
}

// Mock R2 bucket for local development
class MockR2Bucket {
  private storage = new Map<
    string,
    { value: ArrayBuffer; metadata: Record<string, string> }
  >();

  async put(
    key: string,
    value: ArrayBuffer | ArrayBufferView,
    options?: { contentType?: string },
  ) {
    const buffer: ArrayBuffer =
      value instanceof ArrayBuffer ? value : (value.buffer as ArrayBuffer);
    this.storage.set(key, {
      value: buffer,
      metadata: {
        contentType: options?.contentType || "application/octet-stream",
      },
    });
    console.log(`[MockR2] Stored: ${key} (${buffer.byteLength} bytes)`);
  }

  async get(key: string) {
    const item = this.storage.get(key);
    if (!item) return null;
    return {
      arrayBuffer: async () => item.value,
      text: async () => new TextDecoder().decode(item.value),
    };
  }

  async delete(key: string) {
    const deleted = this.storage.delete(key);
    console.log(
      `[MockR2] Deleted: ${key} (${deleted ? "success" : "not found"})`,
    );
  }
}

const mockBucket = new MockR2Bucket();

export async function getUploadBindings(): Promise<UploadBindings> {
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    const ctx = getRequestContext();
    type UploadEnv = { DB?: D1Database; STORAGE?: R2Bucket };
    const env = ctx?.env as UploadEnv | undefined;

    if (!env?.DB) {
      throw new Error("Database binding unavailable");
    }

    // Use mock R2 for local dev if STORAGE not available
    if (!env?.STORAGE) {
      console.warn(
        "[UploadBindings] Using mock R2 bucket for local development",
      );
      return {
        bucket: mockBucket as unknown as R2Bucket,
        db: getDb(env.DB),
      };
    }

    return {
      bucket: env.STORAGE,
      db: getDb(env.DB),
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Cloudflare bindings unavailable",
    );
  }
}
