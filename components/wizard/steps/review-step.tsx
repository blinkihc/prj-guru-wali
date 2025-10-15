// Review Step - Review and confirm all entered data
// Last updated: 2025-10-13

"use client";

import { Building2, GraduationCap, Hash, MapPin, User } from "lucide-react";
import type { WizardData } from "@/app/(auth)/setup/page";
import { RippleButton } from "@/components/ui/ripple-button";

interface ReviewStepProps {
  data: WizardData;
  onComplete: () => void;
  onPrevious: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({
  data,
  onComplete,
  onPrevious,
  isSubmitting,
}: ReviewStepProps) {
  const educationStageLabels: Record<string, string> = {
    SD: "SD (Sekolah Dasar)",
    SMP: "SMP (Sekolah Menengah Pertama)",
    SMA: "SMA (Sekolah Menengah Atas)",
    SMK: "SMK (Sekolah Menengah Kejuruan)",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Konfirmasi Data</h2>
        <p className="text-muted-foreground">
          Periksa kembali data yang Anda masukkan sebelum menyimpan
        </p>
      </div>

      <div className="space-y-6">
        {/* School Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Informasi Sekolah
          </h3>
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <div className="text-sm text-muted-foreground">
                  Nama Sekolah
                </div>
                <div className="font-medium">{data.schoolName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Jenjang
                </div>
                <div className="font-medium">
                  {educationStageLabels[data.educationStage]}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Kota/Kabupaten
                </div>
                <div className="font-medium">{data.cityDistrict}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Identitas Guru
          </h3>
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground">
                  Nama Lengkap
                </div>
                <div className="font-medium">{data.fullName}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  NIP/NUPTK
                </div>
                <div className="font-medium font-mono">{data.nipNuptk}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>Catatan:</strong> Data ini dapat diubah nanti melalui menu
          Pengaturan.
        </p>
      </div>

      <div className="border-t pt-6 flex justify-between">
        <RippleButton
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          Kembali
        </RippleButton>
        <RippleButton
          type="button"
          onClick={onComplete}
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? "Menyimpan..." : "Selesai & Mulai Menggunakan"}
        </RippleButton>
      </div>
    </div>
  );
}
