// R2 Storage Service - Single Responsibility Principle
// Handles all R2 bucket operations for PDF storage
// Created: 2025-10-15
// Updated: 2025-10-15 - Use Web Crypto API for Edge Runtime compatibility

import type { R2Bucket } from "@cloudflare/workers-types";

export interface R2StorageConfig {
  bucket: R2Bucket;
  prefix?: string;
}

export interface StorageMetadata {
  contentType: string;
  generatedAt: string;
  version: string;
  hash: string;
}

/**
 * R2 Storage Service
 * Abstraction layer for Cloudflare R2 operations
 */
export class R2StorageService {
  private bucket: R2Bucket;
  private prefix: string;

  constructor(config: R2StorageConfig) {
    this.bucket = config.bucket;
    this.prefix = config.prefix || "pdfs/";
  }

  /**
   * Generate storage key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Calculate content hash for cache validation using Web Crypto API
   */
  private async calculateHash(content: Buffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new Uint8Array(content),
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Store PDF in R2 bucket
   */
  async put(
    key: string,
    content: Buffer,
    metadata?: Partial<StorageMetadata>,
  ): Promise<void> {
    const fullKey = this.getKey(key);
    const hash = await this.calculateHash(content);

    const customMetadata: StorageMetadata = {
      contentType: "application/pdf",
      generatedAt: new Date().toISOString(),
      version: "1.0",
      hash,
      ...metadata,
    };

    await this.bucket.put(fullKey, content, {
      httpMetadata: {
        contentType: "application/pdf",
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

    return object.customMetadata as unknown as StorageMetadata;
  }

  /**
   * Check if key exists in bucket
   */
  async exists(key: string): Promise<boolean> {
    const metadata = await this.getMetadata(key);
    return metadata !== null;
  }

  /**
   * Delete PDF from bucket
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.getKey(key);
    await this.bucket.delete(fullKey);
  }

  /**
   * List all PDFs with optional prefix
   */
  async list(prefix?: string): Promise<string[]> {
    const searchPrefix = prefix ? this.getKey(prefix) : this.prefix;

    const listed = await this.bucket.list({ prefix: searchPrefix });

    return listed.objects.map((obj) => obj.key.replace(this.prefix, ""));
  }

  /**
   * Delete multiple keys (batch operation)
   */
  async deleteMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.delete(key)));
  }
}
