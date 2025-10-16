// MeetingLogForm component - Form untuk Log Pertemuan
// Created: 2025-01-14
// Form mencatat pertemuan dengan siswa/orang tua

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RippleButton } from "@/components/ui/ripple-button";
import { Textarea } from "@/components/ui/textarea";
import type { Student } from "@/drizzle/schema/students";
import { toast } from "@/lib/toast";

interface MeetingLogFormProps {
  student: Student;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  meetingDate: string;
  topic: string;
  followUp: string;
  notes: string;
}

export function MeetingLogForm({
  student,
  onSuccess,
  onCancel,
}: MeetingLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    meetingDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD
    topic: "",
    followUp: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.meetingDate) {
      toast.error("Tanggal pertemuan wajib diisi");
      return;
    }

    if (!formData.topic.trim()) {
      toast.error("Topik pertemuan wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || "Gagal menyimpan log pertemuan");
      }

      toast.success("Log pertemuan berhasil disimpan!");
      onSuccess?.();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan log pertemuan",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Log Pertemuan: {student.fullName}</CardTitle>
          <CardDescription>
            Kelas: {student.classroom || "-"} • NISN: {student.nisn || "-"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Meeting Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Pertemuan</CardTitle>
          <CardDescription>
            Catatan pertemuan dengan siswa atau orang tua
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meeting Date */}
          <div className="space-y-2">
            <Label htmlFor="meetingDate">
              Tanggal Pertemuan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meetingDate"
              type="date"
              value={formData.meetingDate}
              onChange={(e) => updateField("meetingDate", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Topik Pertemuan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => updateField("topic", e.target.value)}
              placeholder="Contoh: Konsultasi penurunan nilai matematika"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Follow Up */}
          <div className="space-y-2">
            <Label htmlFor="followUp">Tindak Lanjut</Label>
            <Textarea
              id="followUp"
              value={formData.followUp}
              onChange={(e) => updateField("followUp", e.target.value)}
              placeholder="Contoh: Orang tua akan memberikan les tambahan di rumah..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Catatan penting dari pertemuan..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <RippleButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </RippleButton>
        )}
        <RippleButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Log Pertemuan"}
        </RippleButton>
      </div>
    </form>
  );
}
