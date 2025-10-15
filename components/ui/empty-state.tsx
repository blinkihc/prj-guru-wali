// EmptyState component - Visual feedback for empty data states
// Created: 2025-10-14
// Used when lists or collections have no items

import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { RippleButton } from "@/components/ui/ripple-button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * EmptyState - Displays empty state messages with optional action
 *
 * @example
 * <EmptyState
 *   icon={Users}
 *   title="Belum ada siswa"
 *   message="Tambahkan siswa pertama Anda untuk memulai"
 *   actionLabel="Tambah Siswa"
 *   onAction={() => router.push('/students/new')}
 * />
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = "Belum Ada Data",
  message = "Mulai dengan menambahkan item pertama Anda.",
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{message}</p>
      {actionLabel && onAction && (
        <RippleButton onClick={onAction}>{actionLabel}</RippleButton>
      )}
    </div>
  );
}
