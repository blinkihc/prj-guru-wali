// BiodataForm component - Formulir biodata siswa (fase 2)
// Created: 2025-10-20 - Menangani update biodata lengkap termasuk sosial media

"use client";

import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Student, StudentSocialUsage } from "@/drizzle/schema";
import { normalizeStudentUpdates } from "@/lib/services/students/biodata-utils";
import { toast } from "@/lib/toast";

const GENDER_OPTIONS = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

const BLOOD_TYPES = ["A", "B", "AB", "O"];

const RELIGIONS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
];

const ECONOMIC_STATUS = ["TINGGI", "MENENGAH", "RENDAH"];

export interface BiodataFormProps {
  student: Student;
  socialUsages: StudentSocialUsage[];
  onUpdated: (student: Student) => void;
  onSocialUsagesUpdated: (usages: StudentSocialUsage[]) => void;
}

interface UiSocialUsage {
  id?: string;
  platform: string;
  username: string;
  isActive: boolean;
  isNew?: boolean;
  isDeleted?: boolean;
}

const DEFAULT_SOCIAL_USAGES: UiSocialUsage[] = [
  { platform: "Instagram", username: "", isActive: false },
  { platform: "TikTok", username: "", isActive: false },
  { platform: "YouTube", username: "", isActive: false },
];

function mapSocialUsages(usages: StudentSocialUsage[]): UiSocialUsage[] {
  if (usages.length === 0) {
    return DEFAULT_SOCIAL_USAGES;
  }

  return usages.map((usage) => ({
    id: usage.id,
    platform: usage.platform,
    username: usage.username ?? "",
    isActive: Boolean(usage.isActive),
  }));
}

function buildPayloadFromUi(usages: UiSocialUsage[]) {
  return usages
    .filter((usage) => !usage.isDeleted)
    .map((usage) => ({
      id: usage.id,
      platform: usage.platform,
      username: usage.username,
      isActive: usage.isActive,
    }));
}

export function BiodataForm({
  student,
  socialUsages,
  onUpdated,
  onSocialUsagesUpdated,
}: BiodataFormProps) {
  const [formState, setFormState] = useState(() => ({
    fullName: student.fullName,
    nis: student.nis ?? "",
    nisn: student.nisn ?? "",
    classroom: student.classroom ?? "",
    gender: student.gender ?? "",
    birthPlace: student.birthPlace ?? "",
    birthDate: student.birthDate ?? "",
    religion: student.religion ?? "",
    bloodType: student.bloodType ?? "",
    economicStatus: student.economicStatus ?? "",
    address: student.address ?? "",
    phoneNumber: student.phoneNumber ?? "",
    dream: student.dream ?? "",
    extracurricular: student.extracurricular ?? "",
    hobby: student.hobby ?? "",
    parentName: student.parentName ?? "",
    parentContact: student.parentContact ?? "",
    fatherName: student.fatherName ?? "",
    motherName: student.motherName ?? "",
    fatherJob: student.fatherJob ?? "",
    motherJob: student.motherJob ?? "",
    fatherIncome: student.fatherIncome?.toString() ?? "",
    motherIncome: student.motherIncome?.toString() ?? "",
    healthHistoryPast: student.healthHistoryPast ?? "",
    healthHistoryCurrent: student.healthHistoryCurrent ?? "",
    healthHistoryOften: student.healthHistoryOften ?? "",
    characterStrength: student.characterStrength ?? "",
    characterImprovement: student.characterImprovement ?? "",
    specialNotes: student.specialNotes ?? "",
  }));

  const [usagesState, setUsagesState] = useState<UiSocialUsage[]>(() =>
    mapSocialUsages(socialUsages),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = useMemo(() => {
    const normalized = normalizeStudentUpdates({
      ...formState,
      socialUsages: buildPayloadFromUi(usagesState),
    });
    return (
      Object.keys(normalized.studentUpdates).length > 0 ||
      normalized.socialUsages.length > 0
    );
  }, [formState, usagesState]);

  const handleInputChange =
    (field: keyof typeof formState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleSelectChange =
    (field: keyof typeof formState) => (value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleToggleUsage = (
    index: number,
    key: keyof UiSocialUsage,
    value: boolean,
  ) => {
    setUsagesState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const handleUsageInputChange =
    (index: number, key: keyof UiSocialUsage) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setUsagesState((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [key]: value };
        return next;
      });
    };

  const handleAddUsage = () => {
    setUsagesState((prev) => [
      ...prev,
      { platform: "", username: "", isActive: true, isNew: true },
    ]);
  };

  const handleDeleteUsage = (index: number) => {
    setUsagesState((prev) => {
      const next = [...prev];
      const target = next[index];
      if (target.id) {
        next[index] = { ...target, isDeleted: !target.isDeleted };
      } else {
        next.splice(index, 1);
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = normalizeStudentUpdates({
      ...formState,
      socialUsages: buildPayloadFromUi(usagesState),
    });

    console.log("DEBUG Form Submit:", {
      formState: formState,
      normalized: normalized,
      economicStatus: {
        form: formState.economicStatus,
        normalized: normalized.studentUpdates.economicStatus,
      },
    });

    if (
      Object.keys(normalized.studentUpdates).length === 0 &&
      normalized.socialUsages.length === 0
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestPayload = {
        ...normalized.studentUpdates,
        socialUsages: normalized.socialUsages,
      };

      console.log("DEBUG API Payload:", requestPayload);

      const response = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          errorPayload.error || "Gagal memperbarui biodata siswa",
        );
      }

      const responsePayload = (await response.json()) as {
        student: Student;
        socialUsages?: StudentSocialUsage[];
      };

      onUpdated(responsePayload.student);

      if (responsePayload.socialUsages) {
        onSocialUsagesUpdated(responsePayload.socialUsages);
        setUsagesState(mapSocialUsages(responsePayload.socialUsages));
      } else {
        setUsagesState(mapSocialUsages(socialUsages));
      }

      toast.success("Biodata siswa diperbarui");
    } catch (error) {
      console.error("Update biodata error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui biodata siswa",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input
            id="fullName"
            value={formState.fullName}
            onChange={handleInputChange("fullName")}
            placeholder="Nama lengkap siswa"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nis">NIS</Label>
          <Input
            id="nis"
            value={formState.nis}
            onChange={handleInputChange("nis")}
            placeholder="Nomor Induk Siswa"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nisn">NISN</Label>
          <Input
            id="nisn"
            value={formState.nisn}
            onChange={handleInputChange("nisn")}
            placeholder="Nomor Induk Siswa Nasional"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="classroom">Kelas</Label>
          <Input
            id="classroom"
            value={formState.classroom}
            onChange={handleInputChange("classroom")}
            placeholder="7A"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Jenis Kelamin</Label>
          <Select
            value={formState.gender}
            onValueChange={handleSelectChange("gender")}
            disabled={isSubmitting}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthPlace">Tempat Lahir</Label>
          <Input
            id="birthPlace"
            value={formState.birthPlace}
            onChange={handleInputChange("birthPlace")}
            placeholder="Kabupaten/Kota"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthDate">Tanggal Lahir</Label>
          <Input
            id="birthDate"
            type="date"
            value={formState.birthDate}
            onChange={handleInputChange("birthDate")}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="religion">Agama</Label>
          <Select
            value={formState.religion}
            onValueChange={handleSelectChange("religion")}
            disabled={isSubmitting}
          >
            <SelectTrigger id="religion">
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              {RELIGIONS.map((religion) => (
                <SelectItem key={religion} value={religion}>
                  {religion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bloodType">Golongan Darah</Label>
          <Select
            value={formState.bloodType}
            onValueChange={handleSelectChange("bloodType")}
            disabled={isSubmitting}
          >
            <SelectTrigger id="bloodType">
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Alamat Domisili</Label>
          <Textarea
            id="address"
            value={formState.address}
            onChange={handleInputChange("address")}
            placeholder="Alamat lengkap"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Nomor Telepon Siswa</Label>
          <Input
            id="phoneNumber"
            value={formState.phoneNumber}
            onChange={handleInputChange("phoneNumber")}
            placeholder="0812xxxx"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dream">Cita-cita</Label>
          <Input
            id="dream"
            value={formState.dream}
            onChange={handleInputChange("dream")}
            placeholder="Masukkan cita-cita"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="extracurricular">Ekstrakurikuler</Label>
          <Input
            id="extracurricular"
            value={formState.extracurricular}
            onChange={handleInputChange("extracurricular")}
            placeholder="Contoh: Pramuka"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hobby">Hobi</Label>
          <Input
            id="hobby"
            value={formState.hobby}
            onChange={handleInputChange("hobby")}
            placeholder="Masukkan hobi"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="economicStatus">Kondisi Ekonomi</Label>
          <Select
            value={formState.economicStatus}
            onValueChange={handleSelectChange("economicStatus")}
            disabled={isSubmitting}
          >
            <SelectTrigger id="economicStatus">
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              {ECONOMIC_STATUS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentName">Nama Orang Tua/Wali</Label>
          <Input
            id="parentName"
            value={formState.parentName}
            onChange={handleInputChange("parentName")}
            placeholder="Nama orang tua"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentContact">Nomor Kontak Orang Tua</Label>
          <Input
            id="parentContact"
            value={formState.parentContact}
            onChange={handleInputChange("parentContact")}
            placeholder="0812xxxx"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fatherName">Nama Ayah</Label>
          <Input
            id="fatherName"
            value={formState.fatherName}
            onChange={handleInputChange("fatherName")}
            placeholder="Nama lengkap"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherName">Nama Ibu</Label>
          <Input
            id="motherName"
            value={formState.motherName}
            onChange={handleInputChange("motherName")}
            placeholder="Nama lengkap"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fatherJob">Pekerjaan Ayah</Label>
          <Input
            id="fatherJob"
            value={formState.fatherJob}
            onChange={handleInputChange("fatherJob")}
            placeholder="Masukkan pekerjaan"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherJob">Pekerjaan Ibu</Label>
          <Input
            id="motherJob"
            value={formState.motherJob}
            onChange={handleInputChange("motherJob")}
            placeholder="Masukkan pekerjaan"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fatherIncome">Penghasilan Ayah</Label>
          <Input
            id="fatherIncome"
            type="number"
            value={formState.fatherIncome}
            onChange={handleInputChange("fatherIncome")}
            placeholder="Rupiah per bulan"
            min={0}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherIncome">Penghasilan Ibu</Label>
          <Input
            id="motherIncome"
            type="number"
            value={formState.motherIncome}
            onChange={handleInputChange("motherIncome")}
            placeholder="Rupiah per bulan"
            min={0}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="healthHistoryPast">Riwayat Kesehatan (Dulu)</Label>
          <Textarea
            id="healthHistoryPast"
            value={formState.healthHistoryPast}
            onChange={handleInputChange("healthHistoryPast")}
            placeholder="Kondisi kesehatan masa lalu"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="healthHistoryCurrent">Kesehatan Saat Ini</Label>
          <Textarea
            id="healthHistoryCurrent"
            value={formState.healthHistoryCurrent}
            onChange={handleInputChange("healthHistoryCurrent")}
            placeholder="Keluhan saat ini"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="healthHistoryOften">Keluhan yang Sering Muncul</Label>
          <Textarea
            id="healthHistoryOften"
            value={formState.healthHistoryOften}
            onChange={handleInputChange("healthHistoryOften")}
            placeholder="Keluhan berulang"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="characterStrength">Karakter yang Menonjol</Label>
          <Textarea
            id="characterStrength"
            value={formState.characterStrength}
            onChange={handleInputChange("characterStrength")}
            placeholder="Kekuatan karakter siswa"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="characterImprovement">
            Karakter yang Perlu Ditingkatkan
          </Label>
          <Textarea
            id="characterImprovement"
            value={formState.characterImprovement}
            onChange={handleInputChange("characterImprovement")}
            placeholder="Area pengembangan karakter"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="specialNotes">Catatan Khusus</Label>
          <Textarea
            id="specialNotes"
            value={formState.specialNotes}
            onChange={handleInputChange("specialNotes")}
            placeholder="Catatan tambahan"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Aktivitas Sosial Media</p>
            <p className="text-xs text-muted-foreground">
              Tandai platform yang aktif dan isi nama pengguna jika tersedia.
            </p>
          </div>
          <RippleButton
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddUsage}
            disabled={isSubmitting}
          >
            Tambah Platform
          </RippleButton>
        </div>

        <div className="space-y-3">
          {usagesState.map((usage, index) => (
            <div
              key={usage.id ? `${usage.id}-${index}` : `new-${index}`}
              className="rounded-lg border p-3 sm:grid sm:grid-cols-12 sm:items-center sm:gap-3"
            >
              <div className="sm:col-span-3">
                <Label
                  htmlFor={`platform-${index}`}
                  className="text-xs uppercase text-muted-foreground"
                >
                  Platform
                </Label>
                <Input
                  id={`platform-${index}`}
                  value={usage.platform}
                  onChange={handleUsageInputChange(index, "platform")}
                  placeholder="Contoh: Instagram"
                  disabled={isSubmitting || usage.isDeleted}
                />
              </div>
              <div className="sm:col-span-4">
                <Label
                  htmlFor={`username-${index}`}
                  className="text-xs uppercase text-muted-foreground"
                >
                  Nama Pengguna
                </Label>
                <Input
                  id={`username-${index}`}
                  value={usage.username}
                  onChange={handleUsageInputChange(index, "username")}
                  placeholder="Masukkan username"
                  disabled={isSubmitting || usage.isDeleted}
                />
              </div>
              <div className="sm:col-span-3 flex items-center gap-2 pt-4 sm:pt-7">
                <Switch
                  checked={usage.isActive}
                  onCheckedChange={(checked) =>
                    handleToggleUsage(index, "isActive", checked)
                  }
                  disabled={isSubmitting || usage.isDeleted}
                  aria-label="Aktif"
                />
                <span className="text-sm">Aktif</span>
              </div>
              <div className="sm:col-span-2 flex justify-end pt-4 sm:pt-7">
                <RippleButton
                  type="button"
                  variant={usage.isDeleted ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => handleDeleteUsage(index)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {usage.isDeleted ? "Pulihkan" : "Hapus"}
                </RippleButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <RippleButton type="submit" disabled={isSubmitting || !hasChanges}>
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </RippleButton>
      </div>
    </form>
  );
}
