// StudentDialog component - Add/Edit student form dialog
// Created: 2025-10-14
// Last updated: 2025-01-14
// - Fixed controlled input warnings
// - Added PhoneInput & Textarea
// - Improved responsive layout with proportional sizing (500px max-width)
// - ALL fields in 2-column grid for compact layout:
//   Row 1: Nama Siswa | NISN
//   Row 2: Kelas | Jenis Kelamin
//   Row 3: Nama Orangtua | Telepon WA
//   Row 4: Catatan Khusus (full width)
// - Close button (X) positioned with proper spacing (tidak mepet)

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Student } from "@/drizzle/schema/students";
import { toast } from "@/lib/toast";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null; // null = add mode, Student = edit mode
  onSuccess: () => void;
}

export function StudentDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: StudentDialogProps) {
  const isEdit = !!student;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => ({
    fullName: student?.fullName || "",
    nisn: student?.nisn || "",
    classroom: student?.classroom || "",
    gender: student?.gender || "",
    parentName: student?.parentName || "",
    parentContact: student?.parentContact || "",
    specialNotes: student?.specialNotes || "",
  }));

  // Reset form when dialog opens/closes or student changes
  useEffect(() => {
    if (open) {
      if (student) {
        // Edit mode - populate form
        setFormData({
          fullName: student.fullName || "",
          nisn: student.nisn || "",
          classroom: student.classroom || "",
          gender: student.gender || "",
          parentName: student.parentName || "",
          parentContact: student.parentContact || "",
          specialNotes: student.specialNotes || "",
        });
      } else {
        // Add mode - reset form
        setFormData({
          fullName: "",
          nisn: "",
          classroom: "",
          gender: "",
          parentName: "",
          parentContact: "",
          specialNotes: "",
        });
      }
    }
  }, [open, student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Nama lengkap harus diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEdit ? `/api/students/${student.id}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || "Failed to save student");
      }

      toast.success(
        isEdit ? "Siswa berhasil diperbarui" : "Siswa berhasil ditambahkan",
      );
      onSuccess();
    } catch (err) {
      console.error("Save student error:", err);
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Siswa" : "Tambah Siswa Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data siswa di bawah ini"
              : "Isi formulir untuk menambah siswa baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Row 1: Nama Siswa | NISN */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Nama Siswa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Nama lengkap"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input
                  id="nisn"
                  value={formData.nisn || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nisn: e.target.value })
                  }
                  placeholder="0012345678"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Row 2: Kelas | Jenis Kelamin */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classroom">Kelas</Label>
                <Input
                  id="classroom"
                  value={formData.classroom || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, classroom: e.target.value })
                  }
                  placeholder="7A"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Nama Orangtua | Telepon WA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Nama Orang Tua/Wali</Label>
                <Input
                  id="parentName"
                  value={formData.parentName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                  placeholder="Nama orang tua"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentContact">Telepon WA Orang Tua</Label>
                <PhoneInput
                  id="parentContact"
                  value={formData.parentContact || ""}
                  onChange={(value) =>
                    setFormData({ ...formData, parentContact: value })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Row 4: Catatan Khusus (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="specialNotes">Catatan Khusus (bila ada)</Label>
              <Textarea
                id="specialNotes"
                value={formData.specialNotes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, specialNotes: e.target.value })
                }
                placeholder="Catatan yang perlu diperhatikan"
                disabled={isSubmitting}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <RippleButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </RippleButton>
            <RippleButton type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Menyimpan..."
                : isEdit
                  ? "Perbarui"
                  : "Tambah Siswa"}
            </RippleButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
