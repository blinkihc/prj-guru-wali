// Phone number validation utilities
// Created: 2025-01-14
// Indonesian phone number validation with Zod

import { z } from "zod";

/**
 * Validates Indonesian phone numbers
 * Format: 62 + 8-13 digits starting with 8
 * Examples: 628123456789, 628987654321
 */
export const phoneSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val) return true; // Optional field
      // Must start with 62
      if (!val.startsWith("62")) return false;
      // Get digits after 62
      const number = val.slice(2);
      // Must be 8-13 digits
      if (number.length < 8 || number.length > 13) return false;
      // Must start with 8
      if (!number.startsWith("8")) return false;
      // Must be all digits
      return /^\d+$/.test(number);
    },
    {
      message: "Nomor HP tidak valid. Format: 628xxxxxxxx (8-13 digit)",
    },
  );

/**
 * Validates Indonesian phone number (stricter - required)
 */
export const phoneRequiredSchema = z
  .string()
  .min(1, "Nomor HP wajib diisi")
  .refine(
    (val) => {
      // Must start with 62
      if (!val.startsWith("62")) return false;
      // Get digits after 62
      const number = val.slice(2);
      // Must be 8-13 digits
      if (number.length < 8 || number.length > 13) return false;
      // Must start with 8
      if (!number.startsWith("8")) return false;
      // Must be all digits
      return /^\d+$/.test(number);
    },
    {
      message: "Nomor HP tidak valid. Format: 628xxxxxxxx (8-13 digit)",
    },
  );

/**
 * Format phone number for display
 * @param phone - Phone number (628xxx or 8xxx format)
 * @returns Formatted phone number with +62 prefix
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";

  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // If starts with 62, return with + prefix
  if (digits.startsWith("62")) {
    return `+${digits}`;
  }

  // If starts with 8, add 62 prefix
  if (digits.startsWith("8")) {
    return `+62${digits}`;
  }

  // If starts with 0, replace with 62
  if (digits.startsWith("0")) {
    return `+62${digits.slice(1)}`;
  }

  return digits ? `+62${digits}` : "";
}

/**
 * Normalize phone number to 62xxx format
 * @param phone - Phone number in any format
 * @returns Normalized phone number (62xxx) or null
 */
export function normalizePhoneNumber(
  phone: string | null | undefined,
): string | null {
  if (!phone) return null;

  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  if (!digits) return null;

  // Already in 62xxx format
  if (digits.startsWith("62")) {
    return digits;
  }

  // Starts with 8 (valid Indonesian mobile)
  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  // Starts with 0 (local format)
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  // Default: assume it's after 62
  return `62${digits}`;
}

/**
 * Validate phone number (non-Zod version for inline validation)
 */
export function validatePhoneNumber(phone: string | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!phone) {
    return { valid: true }; // Optional
  }

  const normalized = normalizePhoneNumber(phone);

  if (!normalized) {
    return { valid: false, error: "Nomor HP tidak valid" };
  }

  // Must start with 62
  if (!normalized.startsWith("62")) {
    return { valid: false, error: "Nomor HP harus dimulai dengan 62" };
  }

  // Get digits after 62
  const number = normalized.slice(2);

  // Must start with 8
  if (!number.startsWith("8")) {
    return {
      valid: false,
      error: "Nomor HP Indonesia harus diawali angka 8",
    };
  }

  // Must be 8-13 digits
  if (number.length < 8 || number.length > 13) {
    return { valid: false, error: "Nomor HP harus 8-13 digit" };
  }

  // Must be all digits
  if (!/^\d+$/.test(number)) {
    return { valid: false, error: "Nomor HP hanya boleh berisi angka" };
  }

  return { valid: true };
}
