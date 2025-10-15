// School Data Step - School information form
// Last updated: 2025-10-13

"use client";

import { useState } from "react";
import type { WizardData } from "@/app/(auth)/setup/page";
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

interface SchoolDataStepProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function SchoolDataStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: SchoolDataStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.schoolName.trim()) {
      newErrors.schoolName = "Nama sekolah harus diisi";
    }
    if (!data.educationStage) {
      newErrors.educationStage = "Jenjang pendidikan harus dipilih";
    }
    if (!data.cityDistrict.trim()) {
      newErrors.cityDistrict = "Kota/Kabupaten harus diisi";
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
        <h2 className="text-2xl font-bold">Data Sekolah</h2>
        <p className="text-muted-foreground">
          Masukkan informasi sekolah tempat Anda mengajar
        </p>
      </div>

      <div className="space-y-6">
        {/* School Name */}
        <div className="space-y-2">
          <Label htmlFor="schoolName">
            Nama Sekolah <span className="text-destructive">*</span>
          </Label>
          <Input
            id="schoolName"
            placeholder="Contoh: SMA Negeri 1 Jakarta"
            value={data.schoolName}
            onChange={(e) => onUpdate({ schoolName: e.target.value })}
            aria-invalid={!!errors.schoolName}
          />
          {errors.schoolName && (
            <p className="text-sm text-destructive">{errors.schoolName}</p>
          )}
        </div>

        {/* Education Stage */}
        <div className="space-y-2">
          <Label htmlFor="educationStage">
            Jenjang Pendidikan <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.educationStage}
            onValueChange={(value) => onUpdate({ educationStage: value })}
          >
            <SelectTrigger id="educationStage">
              <SelectValue placeholder="Pilih jenjang pendidikan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SD">SD (Sekolah Dasar)</SelectItem>
              <SelectItem value="SMP">
                SMP (Sekolah Menengah Pertama)
              </SelectItem>
              <SelectItem value="SMA">SMA (Sekolah Menengah Atas)</SelectItem>
              <SelectItem value="SMK">
                SMK (Sekolah Menengah Kejuruan)
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.educationStage && (
            <p className="text-sm text-destructive">{errors.educationStage}</p>
          )}
        </div>

        {/* City/District */}
        <div className="space-y-2">
          <Label htmlFor="cityDistrict">
            Kota/Kabupaten <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cityDistrict"
            placeholder="Contoh: Jakarta Selatan"
            value={data.cityDistrict}
            onChange={(e) => onUpdate({ cityDistrict: e.target.value })}
            aria-invalid={!!errors.cityDistrict}
          />
          {errors.cityDistrict && (
            <p className="text-sm text-destructive">{errors.cityDistrict}</p>
          )}
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
