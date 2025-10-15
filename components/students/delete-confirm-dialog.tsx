// DeleteConfirmDialog component - Confirmation dialog for deleting student
// Created: 2025-10-14

"use client";

import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RippleButton } from "@/components/ui/ripple-button";
import type { Student } from "@/drizzle/schema/students";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  student,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Hapus Siswa</DialogTitle>
          </div>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus siswa berikut?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">Nama:</span>
            <p className="font-medium">{student.fullName}</p>
          </div>
          {student.nisn && (
            <div>
              <span className="text-sm text-muted-foreground">NISN:</span>
              <p className="font-mono text-sm">{student.nisn}</p>
            </div>
          )}
          {student.classroom && (
            <div>
              <span className="text-sm text-muted-foreground">Kelas:</span>
              <p className="text-sm">{student.classroom}</p>
            </div>
          )}
        </div>

        <p className="text-sm text-destructive">
          ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data terkait siswa ini
          akan terhapus.
        </p>

        <DialogFooter>
          <RippleButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </RippleButton>
          <RippleButton type="button" variant="destructive" onClick={onConfirm}>
            Hapus Siswa
          </RippleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
