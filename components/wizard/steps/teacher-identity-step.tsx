// Teacher Identity Step - Teacher personal information form
// Last updated: 2025-10-13

"use client";

import { useState } from "react";
import type { WizardData } from "@/app/(auth)/setup/page";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RippleButton } from "@/components/ui/ripple-button";

interface TeacherIdentityStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function TeacherIdentityStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: TeacherIdentityStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.fullName.trim()) {
      newErrors.fullName = "Nama lengkap harus diisi";
    } else if (data.fullName.trim().length < 3) {
      newErrors.fullName = "Nama lengkap minimal 3 karakter";
    }

    if (!data.nipNuptk.trim()) {
      newErrors.nipNuptk = "NIP/NUPTK harus diisi";
    } else if (!/^\d+$/.test(data.nipNuptk)) {
      newErrors.nipNuptk = "NIP/NUPTK harus berupa angka";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Identitas Guru</h2>
        <p className="text-muted-foreground">
          Masukkan data identitas Anda sebagai guru wali
        </p>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nama Lengkap <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Masukkan nama lengkap Anda"
            value={data.fullName}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Nama ini akan muncul di laporan dan dokumen resmi
          </p>
        </div>

        {/* NIP/NUPTK */}
        <div className="space-y-2">
          <Label htmlFor="nipNuptk">
            NIP/NUPTK <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nipNuptk"
            placeholder="Contoh: 198012312005011001"
            value={data.nipNuptk}
            onChange={(e) => onUpdate({ nipNuptk: e.target.value })}
            aria-invalid={!!errors.nipNuptk}
            maxLength={18}
          />
          {errors.nipNuptk && (
            <p className="text-sm text-destructive">{errors.nipNuptk}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Nomor Induk Pegawai atau Nomor Unik Pendidik dan Tenaga Kependidikan
          </p>
        </div>
      </div>

      <div className="border-t pt-6 flex justify-between">
        <RippleButton type="button" variant="outline" onClick={onPrevious}>
          Kembali
        </RippleButton>
        <RippleButton type="button" onClick={handleNext}>
          Lanjutkan
        </RippleButton>
      </div>
    </div>
  );
}
