// Welcome Step - Introduction to the application
// Last updated: 2025-10-13

"use client";

import { BarChart3, BookOpen, FileText, Users } from "lucide-react";
import { RippleButton } from "@/components/ui/ripple-button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          Selamat Datang di Guru Wali Digital Companion
        </h1>
        <p className="text-muted-foreground text-lg">
          Aplikasi pendamping untuk mendokumentasikan dan memantau perkembangan
          siswa secara sistematis
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 my-8">
        <div className="border rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Manajemen Data Siswa</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Kelola profil siswa dengan mudah, lengkap dengan data pribadi dan
            kontak orangtua.
          </p>
        </div>

        <div className="border rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Jurnal Bulanan</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Catat perkembangan siswa dalam 5 aspek pemantauan setiap bulannya.
          </p>
        </div>

        <div className="border rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Log Pertemuan</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Dokumentasikan setiap pertemuan dengan siswa atau orangtua secara
            detail.
          </p>
        </div>

        <div className="border rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Laporan & Analytics</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate laporan profesional dan lihat visualisasi progress siswa.
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <p className="text-center text-sm text-muted-foreground mb-6">
          Mari kita mulai dengan melengkapi informasi dasar Anda
        </p>
        <div className="flex justify-center">
          <RippleButton onClick={onNext} size="lg" className="px-8">
            Mulai Setup
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
