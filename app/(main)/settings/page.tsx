// Settings Page - User profile and school settings
// Last updated: 2025-10-19 - Stabilized fetchSettings with useCallback

"use client";

export const runtime = "edge";

import { ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SettingsForm } from "@/components/settings/settings-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton";

interface SettingsData {
  email: string;
  fullName: string;
  nipNuptk: string;
  schoolName: string;
  educationStage: string;
  cityDistrict: string;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Gagal memuat pengaturan");
      }

      const data = (await response.json()) as SettingsData;
      setSettings(data);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat pengaturan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola profil dan informasi sekolah Anda
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!isLoading && !error && settings && (
        <>
          <SettingsForm initialData={settings} onSuccess={fetchSettings} />

          {/* Cover Settings Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Pengaturan Cover Laporan
              </CardTitle>
              <CardDescription>
                Kelola logo dan ilustrasi untuk cover laporan semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/cover">
                <Button className="w-full sm:w-auto">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Buka Pengaturan Cover
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Reset Data Navigation */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Reset Data
              </CardTitle>
              <CardDescription>
                Hapus semua data siswa, jurnal, pertemuan, dan laporan (untuk
                development/testing)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings/reset">
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Buka Reset Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
