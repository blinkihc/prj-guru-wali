// PDF Report Service - Dependency Inversion Principle
// High-level orchestrator for PDF generation with caching
// Created: 2025-10-15

import type { ReactElement } from "react";
import type { CacheKey, PDFCacheManager } from "./pdf-cache-manager";
import type {
  PDFGenerationOptions,
  PDFGeneratorService,
} from "./pdf-generator";

export interface ReportGenerationResult {
  content: Buffer;
  fromCache: boolean;
  generatedAt: Date;
  sizeBytes: number;
  metadata: {
    cacheKey: string;
    generationTimeMs?: number;
  };
}

/**
 * PDF Report Service
 * Main service for generating reports with intelligent caching
 */
export class PDFReportService {
  constructor(
    private cacheManager: PDFCacheManager,
    private generator: PDFGeneratorService,
  ) {}

  /**
   * Generate report with automatic caching
   */
  async generateReport(
    component: ReactElement,
    cacheParams: CacheKey,
    options: PDFGenerationOptions & { skipCache?: boolean } = {},
  ): Promise<ReportGenerationResult> {
    const startTime = Date.now();

    // Try cache first (unless skipped)
    if (!options.skipCache) {
      const cached = await this.cacheManager.get(cacheParams);

      if (cached) {
        return {
          content: cached.content,
          fromCache: true,
          generatedAt: cached.metadata.generatedAt,
          sizeBytes: cached.content.length,
          metadata: {
            cacheKey: cached.metadata.cacheKey,
          },
        };
      }
    }

    // Generate new PDF
    const content = await this.generator.generate(component, options);
    const generationTime = Date.now() - startTime;

    // Cache for future requests
    await this.cacheManager.set(cacheParams, content);

    return {
      content,
      fromCache: false,
      generatedAt: new Date(),
      sizeBytes: content.length,
      metadata: {
        cacheKey: this.cacheManager.generateCacheKey(cacheParams),
        generationTimeMs: generationTime,
      },
    };
  }

  /**
   * Generate report with streaming support
   */
  async *generateReportStream(
    component: ReactElement,
    cacheParams: CacheKey,
    options: PDFGenerationOptions & { skipCache?: boolean } = {},
  ): AsyncGenerator<Uint8Array, void, unknown> {
    // Try cache first
    if (!options.skipCache) {
      const cached = await this.cacheManager.get(cacheParams);

      if (cached) {
        // Stream cached content in chunks
        const chunkSize = 64 * 1024;
        for (let i = 0; i < cached.content.length; i += chunkSize) {
          const chunk = cached.content.slice(i, i + chunkSize);
          yield new Uint8Array(chunk);
        }
        return;
      }
    }

    // Generate and stream new PDF
    const streamGenerator = this.generator.generateStream(component, options);

    const chunks: Buffer[] = [];

    for await (const chunk of streamGenerator) {
      chunks.push(Buffer.from(chunk));
      yield chunk;
    }

    // Cache the complete PDF
    const fullContent = Buffer.concat(chunks);
    await this.cacheManager.set(cacheParams, fullContent);
  }

  /**
   * Invalidate cache for specific report
   */
  async invalidateCache(params: CacheKey): Promise<void> {
    await this.cacheManager.invalidate(params);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await this.cacheManager.getStats();
  }
}
