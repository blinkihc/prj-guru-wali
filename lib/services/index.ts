// Services Index - Factory Pattern & Dependency Injection
// Centralized service initialization
// Created: 2025-10-15

import type { R2Bucket } from "@cloudflare/workers-types";
import { PDFCacheManager } from "./pdf-cache-manager";
import { PDFGeneratorService } from "./pdf-generator";
import { PDFReportService } from "./pdf-report-service";
import { R2StorageService } from "./r2-storage";

/**
 * Service container for dependency injection
 */
export interface ServiceContainer {
  storage: R2StorageService;
  cacheManager: PDFCacheManager;
  generator: PDFGeneratorService;
  reportService: PDFReportService;
}

/**
 * Initialize all services with R2 bucket
 */
export function initializeServices(r2Bucket: R2Bucket): ServiceContainer {
  // Initialize R2 storage
  const storage = new R2StorageService({
    bucket: r2Bucket,
    prefix: "reports/",
  });

  // Initialize cache manager with 1 hour TTL
  const cacheManager = new PDFCacheManager(storage, 3600);

  // Initialize PDF generator
  const generator = new PDFGeneratorService();

  // Initialize main report service
  const reportService = new PDFReportService(cacheManager, generator);

  return {
    storage,
    cacheManager,
    generator,
    reportService,
  };
}

/**
 * Get services from Cloudflare env (for API routes)
 */
export function getServices(env: { STORAGE: R2Bucket }): ServiceContainer {
  return initializeServices(env.STORAGE);
}

export type { CacheKey, CacheOptions } from "./pdf-cache-manager";
export { PDFCacheManager } from "./pdf-cache-manager";
export type { PDFGenerationOptions, ProgressCallback } from "./pdf-generator";
export { PDFGeneratorService } from "./pdf-generator";
export type { ReportGenerationResult } from "./pdf-report-service";
export { PDFReportService } from "./pdf-report-service";
// Re-export all services and types
export { R2StorageService } from "./r2-storage";
