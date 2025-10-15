// Toast helper utilities - Enhanced toast notifications with variants
// Created: 2025-10-14
// Wraps sonner toast with consistent styling

import { toast as sonnerToast } from "sonner";

/**
 * Enhanced toast utilities with consistent styling and variants
 *
 * @example
 * import { toast } from "@/lib/toast";
 *
 * toast.success("Data berhasil disimpan!");
 * toast.error("Gagal menyimpan data");
 * toast.warning("Pastikan semua field terisi");
 * toast.info("Data sedang diproses...");
 */

export const toast = {
  /**
   * Success toast - Green theme with checkmark
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Error toast - Red theme with alert icon
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Warning toast - Yellow/Orange theme with warning icon
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 3500,
    });
  },

  /**
   * Info toast - Blue theme with info icon
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Loading toast - Shows loading spinner
   * Returns toast ID for later dismissal
   */
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  /**
   * Promise toast - Automatically handles loading/success/error states
   *
   * @example
   * toast.promise(
   *   saveData(),
   *   {
   *     loading: "Menyimpan data...",
   *     success: "Data berhasil disimpan!",
   *     error: "Gagal menyimpan data"
   *   }
   * );
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};
