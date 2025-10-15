// ErrorState component - Visual feedback for error conditions
// Created: 2025-10-14
// Used for error messages across the application

import { AlertCircle, RefreshCw } from "lucide-react";
import { RippleButton } from "@/components/ui/ripple-button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorState - Displays error messages with optional retry action
 *
 * @example
 * <ErrorState
 *   title="Failed to load data"
 *   message="Please check your connection and try again"
 *   onRetry={() => refetch()}
 * />
 */
export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Maaf, terjadi kesalahan. Silakan coba lagi.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{message}</p>
      {onRetry && (
        <RippleButton onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </RippleButton>
      )}
    </div>
  );
}
