// Utility helpers - Updated 2025-10-21: add `isBoolean` type guard for biodata normalization
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
