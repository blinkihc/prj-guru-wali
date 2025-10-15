// Skeleton component - Loading placeholder with pulse animation
// Created: 2025-10-14
// Used for loading states across the application

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

/**
 * Skeleton - Animated loading placeholder
 * Variants:
 * - default: Rectangle with rounded corners
 * - circular: Circle (for avatars, icons)
 * - text: Text line with reduced height
 */
export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variant === "default" && "rounded-md",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded",
        className,
      )}
      {...props}
    />
  );
}

/**
 * SkeletonCard - Pre-styled skeleton for dashboard cards
 */
export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/3" variant="text" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-3 w-2/3" variant="text" />
    </div>
  );
}

/**
 * SkeletonTable - Pre-styled skeleton for table rows
 */
export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static and won't reorder
        <div key={`skeleton-row-${i}`} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" variant="text" />
            <Skeleton className="h-3 w-1/3" variant="text" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
