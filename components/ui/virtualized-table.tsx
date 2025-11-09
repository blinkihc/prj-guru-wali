// VirtualizedTable Component
// Created: 2025-11-09
// Purpose: Efficiently render large datasets with virtual scrolling

"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VirtualizedTableProps<T> {
  data: T[];
  itemHeight?: number;
  containerHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  overscan?: number;
}

export function VirtualizedTable<T>({
  data,
  itemHeight = 52,
  containerHeight = 400,
  renderItem,
  className,
  loading = false,
  emptyMessage = "Tidak ada data",
  overscan = 5,
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border border-border rounded-lg",
          className,
        )}
        style={{ height: containerHeight }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-muted-foreground border border-border rounded-lg",
          className,
        )}
        style={{ height: containerHeight }}
      >
        {emptyMessage}
      </div>
    );
  }

  const totalHeight = data.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    data.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );
  const visibleItems = [];

  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      item: data[i],
      top: i * itemHeight,
    });
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto border border-border rounded-lg", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ index, item, top }) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: top,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Specialized VirtualizedTable for Students
interface StudentRow {
  id: string;
  name: string;
  nis: string;
  className: string;
  photoUrl?: string;
}

interface StudentTableProps {
  students: StudentRow[];
  loading?: boolean;
  onStudentClick?: (student: StudentRow) => void;
}

export function StudentVirtualizedTable({
  students,
  loading,
  onStudentClick,
}: StudentTableProps) {
  return (
    <VirtualizedTable
      data={students}
      itemHeight={64}
      containerHeight={500}
      renderItem={(student, index) => (
        <button
          type="button"
          className={cn(
            "flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors text-left w-full",
            index % 2 === 0 && "bg-muted/20",
          )}
          onClick={() => onStudentClick?.(student)}
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{student.name}</p>
            <p className="text-sm text-muted-foreground">{student.nis}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{student.className}</p>
          </div>
        </button>
      )}
      loading={loading}
      emptyMessage="Belum ada data siswa"
    />
  );
}

// Specialized VirtualizedTable for Journals
interface JournalRow {
  id: string;
  studentName: string;
  date: string;
  type: string;
  description: string;
}

interface JournalTableProps {
  journals: JournalRow[];
  loading?: boolean;
  onJournalClick?: (journal: JournalRow) => void;
}

export function JournalVirtualizedTable({
  journals,
  loading,
  onJournalClick,
}: JournalTableProps) {
  return (
    <VirtualizedTable
      data={journals}
      itemHeight={72}
      containerHeight={400}
      renderItem={(journal, index) => (
        <button
          type="button"
          className={cn(
            "flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors text-left w-full",
            index % 2 === 0 && "bg-muted/20",
          )}
          onClick={() => onJournalClick?.(journal)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium truncate">{journal.studentName}</p>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                {journal.type}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {journal.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{journal.date}</p>
          </div>
        </button>
      )}
      loading={loading}
      emptyMessage="Belum ada jurnal penilaian"
    />
  );
}
