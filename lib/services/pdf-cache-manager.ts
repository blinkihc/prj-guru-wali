// PDF Cache Manager - Open/Closed Principle
// Manages PDF caching strategy with smart invalidation
// Created: 2025-10-15
// Updated: 2025-10-15 - Use Web Crypto API for Edge Runtime compatibility

import type { R2StorageService } from "./r2-storage";

export interface CacheKey {
  type: "semester" | "student";
  semester?: string;
  tahunAjaran?: string;
  studentId?: string;
  dataHash?: string;
}

export interface CacheOptions {
  ttl?: number; // Time-to-live in seconds (0 = no expiry)
  forceRefresh?: boolean;
}

export interface CachedPDF {
  content: Buffer;
  metadata: {
    generatedAt: Date;
    isStale: boolean;
    cacheKey: string;
  };
}

/**
 * PDF Cache Manager
 * Handles intelligent caching with invalidation strategies
 */
export class PDFCacheManager {
  private storage: R2StorageService;
  private defaultTTL: number;

  constructor(storage: R2StorageService, defaultTTL = 3600) {
    this.storage = storage;
    this.defaultTTL = defaultTTL; // 1 hour default
  }

  /**
   * Generate deterministic cache key from parameters
   */
  generateCacheKey(params: CacheKey): string {
    const parts: string[] = [params.type];

    if (params.semester) parts.push(params.semester);
    if (params.tahunAjaran) parts.push(params.tahunAjaran.replace("/", "-"));
    if (params.studentId) parts.push(params.studentId);
    if (params.dataHash) parts.push(params.dataHash);

    return parts.join("_");
  }

  /**
   * Generate hash from data to detect changes
   * Uses simple string hash for Edge Runtime compatibility
   */
  generateDataHash(data: unknown): string {
    const stringified = JSON.stringify(data);
    // Simple but fast hash function compatible with Edge Runtime
    let hash = 0;
    for (let i = 0; i < stringified.length; i++) {
      const char = stringified.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).slice(0, 8);
  }

  /**
   * Check if cached PDF is still valid
   */
  private isValid(generatedAt: string, ttl: number): boolean {
    if (ttl === 0) return true; // No expiry

    const generated = new Date(generatedAt);
    const now = new Date();
    const ageInSeconds = (now.getTime() - generated.getTime()) / 1000;

    return ageInSeconds < ttl;
  }

  /**
   * Get cached PDF if exists and valid
   */
  async get(
    params: CacheKey,
    options: CacheOptions = {},
  ): Promise<CachedPDF | null> {
    if (options.forceRefresh) {
      return null; // Skip cache
    }

    const cacheKey = this.generateCacheKey(params);

    // Check existence first
    const metadata = await this.storage.getMetadata(cacheKey);
    if (!metadata) {
      return null;
    }

    // Validate TTL
    const ttl = options.ttl ?? this.defaultTTL;
    const isValid = this.isValid(metadata.generatedAt, ttl);

    if (!isValid) {
      // Stale cache, delete it
      await this.storage.delete(cacheKey);
      return null;
    }

    // Get content
    const content = await this.storage.get(cacheKey);
    if (!content) {
      return null;
    }

    return {
      content,
      metadata: {
        generatedAt: new Date(metadata.generatedAt),
        isStale: false,
        cacheKey,
      },
    };
  }

  /**
   * Store PDF in cache
   */
  async set(params: CacheKey, content: Buffer): Promise<void> {
    const cacheKey = this.generateCacheKey(params);

    await this.storage.put(cacheKey, content, {
      generatedAt: new Date().toISOString(),
      version: "1.0",
      hash: this.generateDataHash(params),
    });
  }

  /**
   * Invalidate specific cache entry
   */
  async invalidate(params: CacheKey): Promise<void> {
    const cacheKey = this.generateCacheKey(params);
    await this.storage.delete(cacheKey);
  }

  /**
   * Invalidate all semester reports for a specific period
   */
  async invalidateSemester(
    semester: string,
    tahunAjaran: string,
  ): Promise<void> {
    const pattern = `semester_${semester}_${tahunAjaran.replace("/", "-")}`;
    const keys = await this.storage.list(pattern);
    await this.storage.deleteMany(keys);
  }

  /**
   * Invalidate all student reports for a specific student
   */
  async invalidateStudent(studentId: string): Promise<void> {
    const pattern = `student_${studentId}`;
    const keys = await this.storage.list(pattern);
    await this.storage.deleteMany(keys);
  }

  /**
   * Invalidate all caches (use with caution!)
   */
  async invalidateAll(): Promise<void> {
    const allKeys = await this.storage.list();
    await this.storage.deleteMany(allKeys);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalCached: number;
    semesterReports: number;
    studentReports: number;
  }> {
    const allKeys = await this.storage.list();

    return {
      totalCached: allKeys.length,
      semesterReports: allKeys.filter((k) => k.startsWith("semester_")).length,
      studentReports: allKeys.filter((k) => k.startsWith("student_")).length,
    };
  }
}
