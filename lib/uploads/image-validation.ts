// Upload image validation helpers - Shared file validation logic
// Created: 2025-10-19 - Enforces mime type, size, and file naming rules

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);

export function assertImageType(contentType: string): void {
  const normalized = contentType.toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(normalized)) {
    throw new Error("File harus berupa PNG atau JPG");
  }
}

export function assertMaxSize(size: number, maxBytes: number): void {
  if (size > maxBytes) {
    throw new Error("Ukuran file melebihi batas maksimum");
  }
}

export function resolveImageExtension(contentType: string): string {
  const normalized = contentType.toLowerCase();
  if (normalized === "image/png") {
    return "png";
  }
  return "jpg";
}
