// Upload API shared types
// Created: 2025-10-20 - Shared payload definitions for cover & student photo uploads
// Updated: 2025-10-20 - Tambah alias asset type & payload spesifik untuk delete

export interface StudentPhotoDeletePayload {
  studentId: string;
}

export interface StudentPhotoUploadPayload {
  studentId: string;
  file: File;
}

export type CoverAssetType =
  | "logo-dinas"
  | "logo-sekolah"
  | "cover-illustration";

export interface CoverLogoUploadPayload {
  assetType: Extract<CoverAssetType, "logo-dinas" | "logo-sekolah">;
}

export interface CoverIllustrationUploadPayload {
  assetType: Extract<CoverAssetType, "cover-illustration">;
  illustrationId?: string;
  label?: string;
}

export type CoverUploadDeletePayload =
  | CoverLogoUploadPayload
  | (CoverIllustrationUploadPayload & { illustrationId: string });
