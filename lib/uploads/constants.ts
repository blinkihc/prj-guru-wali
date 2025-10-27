// Upload constants - Shared configuration for R2 assets
// Created: 2025-10-19 - Base URLs for cover and photo storage

export const R2_PUBLIC_URL = "https://april.tigasama.com";

export function buildPublicUrl(path: string): string {
  return `${R2_PUBLIC_URL}/${path}`;
}

export function extractStorageKeyFromUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  if (!url.startsWith(`${R2_PUBLIC_URL}/`)) {
    return null;
  }

  return url.slice(R2_PUBLIC_URL.length + 1);
}

export function stripPrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}
