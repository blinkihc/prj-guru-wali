// Upload storage helpers - Factory functions for R2 storage services
// Created: 2025-10-19 - Provides cover & student photo storage configuration

import type { R2Bucket } from "@cloudflare/workers-types";
import { R2StorageService } from "@/lib/services/r2-storage";
import { resolveImageExtension } from "./image-validation";

export const COVER_PREFIX = "covers/";
export const STUDENT_PHOTO_PREFIX = "students/";

export function createCoverStorage(bucket: R2Bucket) {
  return new R2StorageService({
    bucket,
    prefix: COVER_PREFIX,
    defaultContentType: "image/png",
  });
}

export function createStudentPhotoStorage(bucket: R2Bucket) {
  return new R2StorageService({
    bucket,
    prefix: STUDENT_PHOTO_PREFIX,
    defaultContentType: "image/png",
  });
}

export function buildLogoKey(
  userId: string,
  type: "logo-dinas" | "logo-sekolah",
  contentType: string,
): string {
  const extension = resolveImageExtension(contentType);
  return `${userId}/${type}.${extension}`;
}

export function buildCoverIllustrationKey(contentType: string): {
  key: string;
  id: string;
} {
  const extension = resolveImageExtension(contentType);
  const id = crypto.randomUUID();
  return {
    id,
    key: `illustrations/${id}.${extension}`,
  };
}

export function buildStudentPhotoKey(
  studentId: string,
  contentType: string,
): string {
  const extension = resolveImageExtension(contentType);
  return `${studentId}/photo.${extension}`;
}
