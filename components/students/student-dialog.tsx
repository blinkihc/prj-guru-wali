// StudentDialog component - Add/Edit student form dialog
// Created: 2025-10-14
// Last updated: 2025-10-21
// - Refactor: HeroUI Tabs dengan 4 section (Data Diri, Orang Tua, Kesehatan, Sifat/Perilaku)
// - Menambahkan seluruh 32 field schema + form manajemen social usage
// - Nilai default semua field di-normalisasi ke "-" untuk mencegah null
// - Struktur state baru agar mudah dikirim ke API fase 2

"use client";

import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { StudentSocialUsage } from "@/drizzle/schema/student-social-usages";
import type { Student } from "@/drizzle/schema/students";
import { toast } from "@/lib/toast";

const DEFAULT_VALUE = "-";
const TAB_KEYS = {
  dataDiri: "data-diri",
  orangTua: "orang-tua",
  kesehatan: "kesehatan",
  karakter: "karakter",
} as const;

type TabKey = (typeof TAB_KEYS)[keyof typeof TAB_KEYS];

type SocialUsageFormRow = {
  rowId: string;
  id?: string;
  platform: string;
  username: string;
  isActive: "active" | "inactive";
};

type SocialUsageFieldEditable = "platform" | "username" | "isActive";

type StudentFormData = {
  fullName: string;
  nis: string;
  nisn: string;
  classroom: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  religion: string;
  bloodType: string;
  economicStatus: string;
  address: string;
  phoneNumber: string;
  dream: string;
  extracurricular: string;
  hobby: string;
  photoUrl: string;
  parentName: string;
  parentContact: string;
  fatherName: string;
  fatherJob: string;
  fatherIncome: string;
  motherName: string;
  motherJob: string;
  motherIncome: string;
  healthHistoryPast: string;
  healthHistoryCurrent: string;
  healthHistoryOften: string;
  characterStrength: string;
  characterImprovement: string;
  specialNotes: string;
  socialUsages: SocialUsageFormRow[];
};

type StudentSubmitPayload = Omit<StudentFormData, "socialUsages"> & {
  socialUsages: Array<{
    id?: string;
    platform: string;
    username: string;
    isActive: boolean;
  }>;
};

type StudentDialogStudent = Student & {
  socialUsages?: StudentSocialUsage[];
};

const ensureValue = (value: string | number | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : DEFAULT_VALUE;
  }
  return DEFAULT_VALUE;
};

const createSocialUsageRow = (overrides?: Partial<SocialUsageFormRow>) => ({
  rowId: overrides?.rowId ?? overrides?.id ?? nanoid(),
  id: overrides?.id,
  platform: ensureValue(overrides?.platform ?? DEFAULT_VALUE),
  username: ensureValue(overrides?.username ?? DEFAULT_VALUE),
  isActive: overrides?.isActive ?? "inactive",
});

const mapStudentSocialUsages = (
  usages: StudentSocialUsage[] | undefined,
): SocialUsageFormRow[] => {
  if (!usages || usages.length === 0) {
    return [createSocialUsageRow()];
  }

  return usages.map((usage) =>
    createSocialUsageRow({
      rowId: `${usage.id}-row`,
      id: usage.id,
      platform: usage.platform,
      username: usage.username ?? DEFAULT_VALUE,
      isActive: usage.isActive === 1 ? "active" : "inactive",
    }),
  );
};

const createInitialFormData = (student: StudentDialogStudent | null) =>
  ({
    fullName: ensureValue(student?.fullName),
    nis: ensureValue(student?.nis),
    nisn: ensureValue(student?.nisn),
    classroom: ensureValue(student?.classroom),
    gender: ensureValue(student?.gender),
    birthPlace: ensureValue(student?.birthPlace),
    birthDate: ensureValue(student?.birthDate),
    religion: ensureValue(student?.religion),
    bloodType: ensureValue(student?.bloodType),
    economicStatus: ensureValue(student?.economicStatus),
    address: ensureValue(student?.address),
    phoneNumber: ensureValue(student?.phoneNumber),
    dream: ensureValue(student?.dream),
    extracurricular: ensureValue(student?.extracurricular),
    hobby: ensureValue(student?.hobby),
    photoUrl: ensureValue(student?.photoUrl),
    parentName: ensureValue(student?.parentName),
    parentContact: ensureValue(student?.parentContact),
    fatherName: ensureValue(student?.fatherName),
    fatherJob: ensureValue(student?.fatherJob),
    fatherIncome: ensureValue(student?.fatherIncome),
    motherName: ensureValue(student?.motherName),
    motherJob: ensureValue(student?.motherJob),
    motherIncome: ensureValue(student?.motherIncome),
    healthHistoryPast: ensureValue(student?.healthHistoryPast),
    healthHistoryCurrent: ensureValue(student?.healthHistoryCurrent),
    healthHistoryOften: ensureValue(student?.healthHistoryOften),
    characterStrength: ensureValue(student?.characterStrength),
    characterImprovement: ensureValue(student?.characterImprovement),
    specialNotes: ensureValue(student?.specialNotes),
    socialUsages: mapStudentSocialUsages(student?.socialUsages),
  }) satisfies StudentFormData;

const normalizeText = (value: string) =>
  value && value.trim() !== "" ? value.trim() : DEFAULT_VALUE;

type SectionProps = {
  value: StudentFormData;
  isSubmitting: boolean;
  onChange: <Key extends keyof StudentFormData>(
    key: Key,
    value: StudentFormData[Key],
  ) => void;
};

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentDialogStudent | null;
  onSuccess: () => void;
}

function DataDiriTab({ value, isSubmitting, onChange }: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="fullName"
          label="Nama Siswa"
          required
          placeholder="Nama lengkap"
          value={value.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="nis"
          label="NIS"
          placeholder="Nomor Induk Siswa"
          value={value.nis}
          onChange={(e) => onChange("nis", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="nisn"
          label="NISN"
          placeholder="0012345678"
          value={value.nisn}
          onChange={(e) => onChange("nisn", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="classroom"
          label="Kelas"
          placeholder="7A"
          value={value.classroom}
          onChange={(e) => onChange("classroom", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Jenis Kelamin</Label>
          <Select
            value={value.gender}
            onValueChange={(v) => onChange("gender", v)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
              <SelectItem value={DEFAULT_VALUE}>-</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field
          id="birthPlace"
          label="Tempat Lahir"
          value={value.birthPlace}
          onChange={(e) => onChange("birthPlace", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="birthDate"
          label="Tanggal Lahir"
          placeholder="cth. 12 Des 2010"
          value={value.birthDate}
          onChange={(e) => onChange("birthDate", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="religion"
          label="Agama"
          value={value.religion}
          onChange={(e) => onChange("religion", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="bloodType"
          label="Golongan Darah"
          value={value.bloodType}
          onChange={(e) => onChange("bloodType", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="economicStatus"
          label="Status Ekonomi"
          value={value.economicStatus}
          onChange={(e) => onChange("economicStatus", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <Field
        id="address"
        label="Alamat Lengkap"
        value={value.address}
        onChange={(e) => onChange("address", e.target.value)}
        disabled={isSubmitting}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="phoneNumber"
          label="Nomor Telepon/WA Siswa"
          value={value.phoneNumber}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="photoUrl"
          label="URL Foto"
          placeholder="https://..."
          value={value.photoUrl}
          onChange={(e) => onChange("photoUrl", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="dream"
          label="Cita-cita"
          value={value.dream}
          onChange={(e) => onChange("dream", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="extracurricular"
          label="Ekstrakurikuler"
          value={value.extracurricular}
          onChange={(e) => onChange("extracurricular", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <Field
        id="hobby"
        label="Hobi"
        value={value.hobby}
        onChange={(e) => onChange("hobby", e.target.value)}
        disabled={isSubmitting}
      />
    </div>
  );
}

function OrangTuaTab({ value, isSubmitting, onChange }: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="parentName"
          label="Nama Orang Tua/Wali"
          value={value.parentName}
          onChange={(e) => onChange("parentName", e.target.value)}
          disabled={isSubmitting}
        />
        <div className="space-y-2">
          <Label htmlFor="parentContact">Telepon/WA Orang Tua</Label>
          <PhoneInput
            id="parentContact"
            value={value.parentContact}
            onChange={(input) =>
              onChange("parentContact", input ?? DEFAULT_VALUE)
            }
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="fatherName"
          label="Nama Ayah"
          value={value.fatherName}
          onChange={(e) => onChange("fatherName", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="fatherJob"
          label="Pekerjaan Ayah"
          value={value.fatherJob}
          onChange={(e) => onChange("fatherJob", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="fatherIncome"
          label="Penghasilan Ayah"
          placeholder="cth. 3000000 atau -"
          value={value.fatherIncome}
          onChange={(e) => onChange("fatherIncome", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="motherIncome"
          label="Penghasilan Ibu"
          placeholder="cth. 2500000 atau -"
          value={value.motherIncome}
          onChange={(e) => onChange("motherIncome", e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="motherName"
          label="Nama Ibu"
          value={value.motherName}
          onChange={(e) => onChange("motherName", e.target.value)}
          disabled={isSubmitting}
        />
        <Field
          id="motherJob"
          label="Pekerjaan Ibu"
          value={value.motherJob}
          onChange={(e) => onChange("motherJob", e.target.value)}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}

function KesehatanTab({ value, isSubmitting, onChange }: SectionProps) {
  return (
    <div className="space-y-4">
      <TextareaField
        id="healthHistoryPast"
        label="Riwayat Penyakit (Masa Lalu)"
        value={value.healthHistoryPast}
        onChange={(e) => onChange("healthHistoryPast", e.target.value)}
        disabled={isSubmitting}
      />
      <TextareaField
        id="healthHistoryCurrent"
        label="Kondisi Kesehatan Saat Ini"
        value={value.healthHistoryCurrent}
        onChange={(e) => onChange("healthHistoryCurrent", e.target.value)}
        disabled={isSubmitting}
      />
      <TextareaField
        id="healthHistoryOften"
        label="Keluhan yang Sering Dialami"
        value={value.healthHistoryOften}
        onChange={(e) => onChange("healthHistoryOften", e.target.value)}
        disabled={isSubmitting}
      />
    </div>
  );
}

type KarakterProps = SectionProps & {
  socialUsageCount: number;
  onAddSocialUsage: () => void;
  onRemoveSocialUsage: (rowId: string) => void;
  onSocialUsageChange: (
    rowId: string,
    field: SocialUsageFieldEditable,
    value: string,
  ) => void;
};

function KarakterTab({
  value,
  isSubmitting,
  onChange,
  socialUsageCount,
  onAddSocialUsage,
  onRemoveSocialUsage,
  onSocialUsageChange,
}: KarakterProps) {
  return (
    <div className="space-y-6">
      <TextareaField
        id="characterStrength"
        label="Sifat/Perilaku Positif"
        value={value.characterStrength}
        onChange={(e) => onChange("characterStrength", e.target.value)}
        disabled={isSubmitting}
      />
      <TextareaField
        id="characterImprovement"
        label="Hal yang Perlu Diperbaiki"
        value={value.characterImprovement}
        onChange={(e) => onChange("characterImprovement", e.target.value)}
        disabled={isSubmitting}
      />
      <TextareaField
        id="specialNotes"
        label="Catatan Khusus"
        value={value.specialNotes}
        onChange={(e) => onChange("specialNotes", e.target.value)}
        disabled={isSubmitting}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Aktivitas Media Sosial</Label>
          <RippleButton
            type="button"
            variant="outline"
            onClick={onAddSocialUsage}
            disabled={isSubmitting}
          >
            Tambah Platform
          </RippleButton>
        </div>

        <div className="space-y-4">
          {value.socialUsages.map((row) => (
            <div
              key={row.rowId}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 rounded-md border p-4"
            >
              <Field
                id={`platform-${row.rowId}`}
                label="Platform"
                value={row.platform}
                onChange={(e) =>
                  onSocialUsageChange(row.rowId, "platform", e.target.value)
                }
                disabled={isSubmitting}
              />
              <Field
                id={`username-${row.rowId}`}
                label="Username"
                value={row.username}
                onChange={(e) =>
                  onSocialUsageChange(row.rowId, "username", e.target.value)
                }
                disabled={isSubmitting}
              />
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={row.isActive}
                  onValueChange={(v) =>
                    onSocialUsageChange(
                      row.rowId,
                      "isActive",
                      v as SocialUsageFormRow["isActive"],
                    )
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <RippleButton
                  type="button"
                  variant="outline"
                  onClick={() => onRemoveSocialUsage(row.rowId)}
                  disabled={isSubmitting || socialUsageCount === 1}
                >
                  Hapus
                </RippleButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
};

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

type TextareaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
};

function TextareaField({
  id,
  label,
  value,
  onChange,
  disabled,
}: TextareaFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={3}
        disabled={disabled}
        className="resize-none"
      />
    </div>
  );
}

export function StudentDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: StudentDialogProps) {
  const isEdit = !!student;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>(TAB_KEYS.dataDiri);
  const [formData, setFormData] = useState<StudentFormData>(() =>
    createInitialFormData(student),
  );

  // Reset form when dialog opens/closes or student changes
  useEffect(() => {
    if (open) {
      setActiveTab(TAB_KEYS.dataDiri);
      setFormData(createInitialFormData(student));
    }
  }, [open, student]);

  const socialUsageCount = formData.socialUsages.length;

  const handleFieldChange = <Key extends keyof StudentFormData>(
    key: Key,
    value: StudentFormData[Key],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]:
        key === "socialUsages"
          ? (value as StudentFormData["socialUsages"])
          : (value as string),
    }));
  };

  const handleSocialUsageChange = (
    id: string,
    field: SocialUsageFieldEditable,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      socialUsages: prev.socialUsages.map((row) =>
        row.rowId === id
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    }));
  };

  const addSocialUsageRow = () => {
    setFormData((prev) => ({
      ...prev,
      socialUsages: [...prev.socialUsages, createSocialUsageRow()],
    }));
  };

  const removeSocialUsageRow = (id: string) => {
    if (formData.socialUsages.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      socialUsages: prev.socialUsages.filter((row) => row.rowId !== id),
    }));
  };

  const normalizedPayload = useMemo(() => {
    const { socialUsages, ...rest } = formData;
    const normalizedEntries = Object.entries(rest).map(([key, value]) => [
      key,
      normalizeText(value),
    ]);

    const normalizedUsages = socialUsages.map((row) => ({
      id: row.id,
      platform: normalizeText(row.platform),
      username: normalizeText(row.username),
      isActive: row.isActive === "active",
    }));

    return {
      ...(Object.fromEntries(normalizedEntries) as Omit<
        StudentSubmitPayload,
        "socialUsages"
      >),
      socialUsages: normalizedUsages,
    } satisfies StudentSubmitPayload;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !normalizedPayload.fullName ||
      normalizedPayload.fullName === DEFAULT_VALUE
    ) {
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
        body: JSON.stringify(normalizedPayload),
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
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Siswa" : "Tambah Siswa Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data siswa di bawah ini"
              : "Isi formulir lengkap sesuai template biodata"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabKey)}
          >
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value={TAB_KEYS.dataDiri}>
                Data Diri Siswa
              </TabsTrigger>
              <TabsTrigger value={TAB_KEYS.orangTua}>
                Orang Tua Kandung
              </TabsTrigger>
              <TabsTrigger value={TAB_KEYS.kesehatan}>
                Riwayat Kesehatan
              </TabsTrigger>
              <TabsTrigger value={TAB_KEYS.karakter}>
                Sifat / Perilaku
              </TabsTrigger>
            </TabsList>

            <TabsContent value={TAB_KEYS.dataDiri} className="pt-4">
              <DataDiriTab
                isSubmitting={isSubmitting}
                value={formData}
                onChange={handleFieldChange}
              />
            </TabsContent>

            <TabsContent value={TAB_KEYS.orangTua} className="pt-4">
              <OrangTuaTab
                isSubmitting={isSubmitting}
                value={formData}
                onChange={handleFieldChange}
              />
            </TabsContent>

            <TabsContent value={TAB_KEYS.kesehatan} className="pt-4">
              <KesehatanTab
                isSubmitting={isSubmitting}
                value={formData}
                onChange={handleFieldChange}
              />
            </TabsContent>

            <TabsContent value={TAB_KEYS.karakter} className="pt-4">
              <KarakterTab
                isSubmitting={isSubmitting}
                value={formData}
                onChange={handleFieldChange}
                onAddSocialUsage={addSocialUsageRow}
                onRemoveSocialUsage={removeSocialUsageRow}
                onSocialUsageChange={handleSocialUsageChange}
                socialUsageCount={socialUsageCount}
              />
            </TabsContent>
          </Tabs>

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
