// R2 Storage Service - Single Responsibility Principle
// Handles Cloudflare R2 object operations with configurable prefixes & content types
// Created: 2025-10-15
// Updated: 2025-10-19 - Support generic binary uploads (images, PDFs, etc.)

import type { R2Bucket, R2Object } from "@cloudflare/workers-types";

export interface R2StorageConfig {
  bucket: R2Bucket;
  prefix?: string;
  defaultContentType?: string;
}

export interface StorageMetadata {
  contentType: string;
  generatedAt: string;
  version: string;
  hash: string;
}

type BinaryContent = Buffer | Uint8Array | ArrayBuffer;

/**
 * R2 Storage Service
 * Abstraction layer for Cloudflare R2 operations
 */
export class R2StorageService {
  private bucket: R2Bucket;
  private prefix: string;
  private defaultContentType: string;

  constructor(config: R2StorageConfig) {
    this.bucket = config.bucket;
    this.prefix = config.prefix || "pdfs/";
    this.defaultContentType = config.defaultContentType || "application/pdf";
  }

  /**
   * Generate storage key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private toUint8Array(content: BinaryContent): Uint8Array {
    if (content instanceof Uint8Array) {
      return content;
    }

    if (typeof Buffer !== "undefined" && content instanceof Buffer) {
      return new Uint8Array(content);
    }

    return new Uint8Array(content);
  }

  /**
   * Calculate content hash for cache validation using Web Crypto API
   */
  private async calculateHash(content: Uint8Array): Promise<string> {
    // Convert to ArrayBuffer for crypto.subtle.digest
    const buffer = content.buffer.slice(
      content.byteOffset,
      content.byteOffset + content.byteLength,
    ) as ArrayBuffer;
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Store PDF in R2 bucket
   */
  async put(
    key: string,
    content: BinaryContent,
    metadata?: Partial<StorageMetadata> & { contentType?: string },
  ): Promise<void> {
    const fullKey = this.getKey(key);
    const bytes = this.toUint8Array(content);
    const hash = await this.calculateHash(bytes);
    const contentType = metadata?.contentType || this.defaultContentType;

    const customMetadata: StorageMetadata = {
      contentType,
      generatedAt: new Date().toISOString(),
      version: metadata?.version || "1.0",
      hash: metadata?.hash || hash,
      ...metadata,
    };

    // Ensure metadata reflects actual content type & hash
    customMetadata.contentType = contentType;
    customMetadata.hash = metadata?.hash || hash;

    await this.bucket.put(fullKey, content, {
      httpMetadata: {
        contentType,
      },
      customMetadata: customMetadata as unknown as Record<string, string>,
    });
  }

  /**
   * Retrieve PDF from R2 bucket
   */
  async get(key: string): Promise<Buffer | null> {
    const fullKey = this.getKey(key);
    const object = await this.bucket.get(fullKey);

    if (!object) {
      return null;
    }

    const arrayBuffer = await object.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Get storage metadata without downloading content
   */
  async getMetadata(key: string): Promise<StorageMetadata | null> {
    const fullKey = this.getKey(key);
    const object = await this.bucket.head(fullKey);

    if (!object) {
      return null;
    }

    return (object.customMetadata || {
      contentType: object.httpMetadata?.contentType,
      generatedAt: object.uploaded?.toISOString() ?? new Date().toISOString(),
      version: "1.0",
      hash: "",
    }) as unknown as StorageMetadata;
  }

  /**
   * Check if key exists in bucket
   */
  async exists(key: string): Promise<boolean> {
    const metadata = await this.getMetadata(key);
    return metadata !== null;
  }

  /**
   * Delete object from bucket
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.getKey(key);
    await this.bucket.delete(fullKey);
  }

  /**
   * List objects by optional suffix (relative key)
   */
  async list(suffixPrefix = ""): Promise<string[]> {
    const fullPrefix = this.getKey(suffixPrefix);
    const objects = await this.bucket.list({ prefix: fullPrefix });
    return objects.objects.map((obj: R2Object) => obj.key);
  }

  /**
   * Delete multiple objects by absolute keys
   */
  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await Promise.all(keys.map((key) => this.bucket.delete(key)));
  }
}
