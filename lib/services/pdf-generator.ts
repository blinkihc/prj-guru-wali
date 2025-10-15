// PDF Generator Service - Interface Segregation Principle
// Handles PDF generation with streaming and progress tracking
// Created: 2025-10-15

import { renderToBuffer } from "@react-pdf/renderer";
import type React from "react";
import type { ReactElement } from "react";

export interface PDFGenerationProgress {
  stage: "preparing" | "rendering" | "finalizing" | "complete";
  progress: number; // 0-100
  message: string;
}

export type ProgressCallback = (progress: PDFGenerationProgress) => void;

export interface PDFGenerationOptions {
  onProgress?: ProgressCallback;
  timeout?: number; // milliseconds
}

/**
 * PDF Generator Service
 * Handles PDF generation with progress tracking
 */
export class PDFGeneratorService {
  /**
   * Generate PDF from React component
   */
  async generate(
    component: ReactElement,
    options: PDFGenerationOptions = {},
  ): Promise<Buffer> {
    const { onProgress, timeout = 120000 } = options;

    // Stage 1: Preparing
    onProgress?.({
      stage: "preparing",
      progress: 10,
      message: "Preparing PDF template...",
    });

    // Stage 2: Rendering
    onProgress?.({
      stage: "rendering",
      progress: 30,
      message: "Rendering PDF content...",
    });

    // Generate PDF with timeout
    const buffer = await this.generateWithTimeout(component, timeout);

    // Stage 3: Finalizing
    onProgress?.({
      stage: "finalizing",
      progress: 90,
      message: "Finalizing PDF...",
    });

    // Stage 4: Complete
    onProgress?.({
      stage: "complete",
      progress: 100,
      message: "PDF generation complete",
    });

    return buffer;
  }

  /**
   * Generate PDF with timeout protection
   */
  private async generateWithTimeout(
    component: ReactElement,
    timeout: number,
  ): Promise<Buffer> {
    return Promise.race([
      renderToBuffer(component as React.ReactElement<any>),
      this.createTimeoutPromise(timeout),
    ]);
  }

  /**
   * Create timeout promise that rejects
   */
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`PDF generation timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Generate PDF stream for chunked transfer encoding
   */
  async *generateStream(
    component: ReactElement,
    options: PDFGenerationOptions = {},
  ): AsyncGenerator<Uint8Array, void, unknown> {
    const buffer = await this.generate(component, options);

    // Stream in chunks (64KB each)
    const chunkSize = 64 * 1024;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      yield new Uint8Array(chunk);
    }
  }

  /**
   * Estimate generation time based on complexity
   */
  estimateGenerationTime(pageCount: number): number {
    // Rough estimate: 500ms per page + 2s overhead
    return pageCount * 500 + 2000;
  }
}
