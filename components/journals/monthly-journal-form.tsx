// MonthlyJournalForm component - Form untuk Jurnal Bulanan 5 Aspek
// Created: 2025-01-14
// Form mencakup 5 aspek pemantauan: Akademik, Karakter, Sosial-Emosional, Kedisiplinan, Potensi & Minat

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
import type { Student } from "@/drizzle/schema/students";
import { toast } from "@/lib/toast";

interface MonthlyJournalFormProps {
  student: Student;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  monitoringPeriod: string;

  // Aspek 1: Akademik
  academicDesc: string;
  academicFollowUp: string;
  academicNotes: string;

  // Aspek 2: Karakter
  characterDesc: string;
  characterFollowUp: string;
  characterNotes: string;

  // Aspek 3: Sosial-Emosional
  socialEmotionalDesc: string;
  socialEmotionalFollowUp: string;
  socialEmotionalNotes: string;

  // Aspek 4: Kedisiplinan
  disciplineDesc: string;
  disciplineFollowUp: string;
  disciplineNotes: string;

  // Aspek 5: Potensi & Minat
  potentialInterestDesc: string;
  potentialInterestFollowUp: string;
  potentialInterestNotes: string;
}

export function MonthlyJournalForm({
  student,
  onSuccess,
  onCancel,
}: MonthlyJournalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    monitoringPeriod: getCurrentPeriod(),
    academicDesc: "",
    academicFollowUp: "",
    academicNotes: "",
    characterDesc: "",
    characterFollowUp: "",
    characterNotes: "",
    socialEmotionalDesc: "",
    socialEmotionalFollowUp: "",
    socialEmotionalNotes: "",
    disciplineDesc: "",
    disciplineFollowUp: "",
    disciplineNotes: "",
    potentialInterestDesc: "",
    potentialInterestFollowUp: "",
    potentialInterestNotes: "",
  });

  // Generate current period (e.g., "Januari 2025")
  function getCurrentPeriod() {
    const now = new Date();
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  // Generate period options (current + 3 months back)
  function getPeriodOptions() {
    const options: string[] = [];
    const now = new Date();
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    for (let i = 0; i < 4; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push(`${months[date.getMonth()]} ${date.getFullYear()}`);
    }

    return options;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menyimpan jurnal");
      }

      toast.success("Jurnal bulanan berhasil disimpan!");
      onSuccess?.();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan jurnal",
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
          <CardTitle>Jurnal Bulanan: {student.fullName}</CardTitle>
          <CardDescription>
            Kelas: {student.classroom || "-"} • NISN: {student.nisn || "-"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="monitoringPeriod">
              Periode Pemantauan <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.monitoringPeriod}
              onValueChange={(value) => updateField("monitoringPeriod", value)}
              disabled={isSubmitting}
              required
            >
              <SelectTrigger id="monitoringPeriod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getPeriodOptions().map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Aspek 1: Akademik */}
      <Card>
        <CardHeader>
          <CardTitle>1. Aspek Akademik</CardTitle>
          <CardDescription>
            Perkembangan prestasi akademik dan kemampuan belajar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="academicDesc">Deskripsi Perkembangan</Label>
            <Textarea
              id="academicDesc"
              value={formData.academicDesc}
              onChange={(e) => updateField("academicDesc", e.target.value)}
              placeholder="Contoh: Nilai matematika meningkat dari 70 menjadi 85..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="academicFollowUp">Tindak Lanjut</Label>
            <Textarea
              id="academicFollowUp"
              value={formData.academicFollowUp}
              onChange={(e) => updateField("academicFollowUp", e.target.value)}
              placeholder="Contoh: Berikan soal latihan tambahan untuk PR..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="academicNotes">Catatan Tambahan</Label>
            <Input
              id="academicNotes"
              value={formData.academicNotes}
              onChange={(e) => updateField("academicNotes", e.target.value)}
              placeholder="Catatan penting..."
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aspek 2: Karakter */}
      <Card>
        <CardHeader>
          <CardTitle>2. Aspek Karakter</CardTitle>
          <CardDescription>
            Perkembangan sikap, nilai, dan perilaku
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="characterDesc">Deskripsi Perkembangan</Label>
            <Textarea
              id="characterDesc"
              value={formData.characterDesc}
              onChange={(e) => updateField("characterDesc", e.target.value)}
              placeholder="Contoh: Mulai menunjukkan sikap peduli terhadap teman..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="characterFollowUp">Tindak Lanjut</Label>
            <Textarea
              id="characterFollowUp"
              value={formData.characterFollowUp}
              onChange={(e) => updateField("characterFollowUp", e.target.value)}
              placeholder="Contoh: Libatkan dalam kegiatan gotong royong kelas..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="characterNotes">Catatan Tambahan</Label>
            <Input
              id="characterNotes"
              value={formData.characterNotes}
              onChange={(e) => updateField("characterNotes", e.target.value)}
              placeholder="Catatan penting..."
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aspek 3: Sosial-Emosional */}
      <Card>
        <CardHeader>
          <CardTitle>3. Aspek Sosial-Emosional</CardTitle>
          <CardDescription>
            Kemampuan berinteraksi dan mengelola emosi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="socialEmotionalDesc">Deskripsi Perkembangan</Label>
            <Textarea
              id="socialEmotionalDesc"
              value={formData.socialEmotionalDesc}
              onChange={(e) =>
                updateField("socialEmotionalDesc", e.target.value)
              }
              placeholder="Contoh: Lebih mudah bergaul dengan teman sebaya..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialEmotionalFollowUp">Tindak Lanjut</Label>
            <Textarea
              id="socialEmotionalFollowUp"
              value={formData.socialEmotionalFollowUp}
              onChange={(e) =>
                updateField("socialEmotionalFollowUp", e.target.value)
              }
              placeholder="Contoh: Ajak diskusi kelompok dalam project..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialEmotionalNotes">Catatan Tambahan</Label>
            <Input
              id="socialEmotionalNotes"
              value={formData.socialEmotionalNotes}
              onChange={(e) =>
                updateField("socialEmotionalNotes", e.target.value)
              }
              placeholder="Catatan penting..."
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aspek 4: Kedisiplinan */}
      <Card>
        <CardHeader>
          <CardTitle>4. Aspek Kedisiplinan</CardTitle>
          <CardDescription>
            Kepatuhan terhadap aturan dan tanggung jawab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disciplineDesc">Deskripsi Perkembangan</Label>
            <Textarea
              id="disciplineDesc"
              value={formData.disciplineDesc}
              onChange={(e) => updateField("disciplineDesc", e.target.value)}
              placeholder="Contoh: Jarang terlambat, selalu mengumpulkan tugas tepat waktu..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disciplineFollowUp">Tindak Lanjut</Label>
            <Textarea
              id="disciplineFollowUp"
              value={formData.disciplineFollowUp}
              onChange={(e) =>
                updateField("disciplineFollowUp", e.target.value)
              }
              placeholder="Contoh: Berikan reward untuk pencapaian kedisiplinan..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disciplineNotes">Catatan Tambahan</Label>
            <Input
              id="disciplineNotes"
              value={formData.disciplineNotes}
              onChange={(e) => updateField("disciplineNotes", e.target.value)}
              placeholder="Catatan penting..."
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aspek 5: Potensi & Minat */}
      <Card>
        <CardHeader>
          <CardTitle>5. Aspek Potensi & Minat</CardTitle>
          <CardDescription>
            Bakat, minat, dan potensi yang perlu dikembangkan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="potentialInterestDesc">
              Deskripsi Perkembangan
            </Label>
            <Textarea
              id="potentialInterestDesc"
              value={formData.potentialInterestDesc}
              onChange={(e) =>
                updateField("potentialInterestDesc", e.target.value)
              }
              placeholder="Contoh: Menunjukkan minat tinggi dalam seni musik..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="potentialInterestFollowUp">Tindak Lanjut</Label>
            <Textarea
              id="potentialInterestFollowUp"
              value={formData.potentialInterestFollowUp}
              onChange={(e) =>
                updateField("potentialInterestFollowUp", e.target.value)
              }
              placeholder="Contoh: Rekomendasikan untuk ikut ekstrakurikuler paduan suara..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="potentialInterestNotes">Catatan Tambahan</Label>
            <Input
              id="potentialInterestNotes"
              value={formData.potentialInterestNotes}
              onChange={(e) =>
                updateField("potentialInterestNotes", e.target.value)
              }
              placeholder="Catatan penting..."
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
          {isSubmitting ? "Menyimpan..." : "Simpan Jurnal"}
        </RippleButton>
      </div>
    </form>
  );
}
