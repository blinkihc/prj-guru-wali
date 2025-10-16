// InterventionForm component - Form untuk Rencana Intervensi
// Created: 2025-01-14
// Simple intervention planning untuk siswa yang butuh perhatian khusus

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Intervention } from "@/drizzle/schema/interventions";
import type { Student } from "@/drizzle/schema/students";
import { toast } from "@/lib/toast";

interface InterventionFormProps {
  student: Student;
  intervention?: Intervention;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  issue: string;
  goal: string;
  actionSteps: string;
  status: "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  notes: string;
}

export function InterventionForm({
  student,
  intervention,
  onSuccess,
  onCancel,
}: InterventionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: intervention?.title || "",
    issue: intervention?.issue || "",
    goal: intervention?.goal || "",
    actionSteps: intervention?.actionSteps || "",
    status:
      (intervention?.status as "active" | "completed" | "cancelled") ||
      "active",
    startDate:
      intervention?.startDate || new Date().toISOString().split("T")[0],
    endDate: intervention?.endDate || "",
    notes: intervention?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Judul rencana intervensi wajib diisi");
      return;
    }

    if (!formData.issue.trim()) {
      toast.error("Deskripsi masalah wajib diisi");
      return;
    }

    if (!formData.goal.trim()) {
      toast.error("Tujuan intervensi wajib diisi");
      return;
    }

    if (!formData.actionSteps.trim()) {
      toast.error("Langkah tindakan wajib diisi");
      return;
    }

    if (!formData.startDate) {
      toast.error("Tanggal mulai wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = intervention
        ? `/api/interventions/${intervention.id}`
        : "/api/interventions";
      const method = intervention ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || "Gagal menyimpan rencana intervensi");
      }

      toast.success(
        intervention
          ? "Rencana intervensi berhasil diperbarui!"
          : "Rencana intervensi berhasil dibuat!",
      );
      onSuccess?.();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan rencana intervensi",
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
          <CardTitle>
            {intervention
              ? "Edit Rencana Intervensi"
              : "Rencana Intervensi Baru"}
          </CardTitle>
          <CardDescription>
            Siswa: {student.fullName}
            {student.classroom && ` • Kelas ${student.classroom}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Intervensi</CardTitle>
          <CardDescription>
            Isi detail rencana intervensi untuk siswa ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul Rencana <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Contoh: Perbaikan Nilai Matematika"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Issue */}
          <div className="space-y-2">
            <Label htmlFor="issue">
              Deskripsi Masalah <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="issue"
              value={formData.issue}
              onChange={(e) => updateField("issue", e.target.value)}
              placeholder="Contoh: Nilai matematika turun dari 80 menjadi 60 dalam 2 bulan terakhir..."
              rows={3}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">
              Tujuan Intervensi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="goal"
              value={formData.goal}
              onChange={(e) => updateField("goal", e.target.value)}
              placeholder="Contoh: Meningkatkan nilai matematika kembali ke minimal 75 dalam 1 bulan..."
              rows={3}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Action Steps */}
          <div className="space-y-2">
            <Label htmlFor="actionSteps">
              Langkah Tindakan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="actionSteps"
              value={formData.actionSteps}
              onChange={(e) => updateField("actionSteps", e.target.value)}
              placeholder="Contoh:&#10;1. Berikan soal latihan tambahan setiap hari&#10;2. Konsultasi dengan guru matematika&#10;3. Hubungi orang tua untuk monitoring di rumah..."
              rows={5}
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              Tip: Pisahkan setiap langkah dengan baris baru
            </p>
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Tanggal Mulai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Target Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "completed" | "cancelled") =>
                updateField("status", value)
              }
              disabled={isSubmitting}
              required
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">🔵 Aktif</SelectItem>
                <SelectItem value="completed">✅ Selesai</SelectItem>
                <SelectItem value="cancelled">❌ Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Catatan penting atau progress update..."
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
          {isSubmitting
            ? "Menyimpan..."
            : intervention
              ? "Update Rencana"
              : "Buat Rencana"}
        </RippleButton>
      </div>
    </form>
  );
}
