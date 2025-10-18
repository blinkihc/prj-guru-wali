// Settings Form - Edit user profile and school data
// Includes password change functionality
// Last updated: 2025-10-17

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsData {
  email: string;
  fullName: string;
  nipNuptk: string;
  schoolName: string;
  educationStage: string;
  cityDistrict: string;
}

interface SettingsFormProps {
  initialData: SettingsData;
  onSuccess?: () => void;
}

export function SettingsForm({ initialData, onSuccess }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate password change if provided
      if (passwordData.currentPassword || passwordData.newPassword) {
        if (!passwordData.currentPassword) {
          toast.error("Password lama harus diisi");
          setIsSubmitting(false);
          return;
        }
        if (!passwordData.newPassword) {
          toast.error("Password baru harus diisi");
          setIsSubmitting(false);
          return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error("Konfirmasi password tidak sesuai");
          setIsSubmitting(false);
          return;
        }
        if (passwordData.newPassword.length < 6) {
          toast.error("Password baru minimal 6 karakter");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare request body
      const body: any = {
        fullName: formData.fullName,
        nipNuptk: formData.nipNuptk,
        schoolName: formData.schoolName,
        educationStage: formData.educationStage,
        cityDistrict: formData.cityDistrict,
      };

      // Add password if changing
      if (passwordData.currentPassword && passwordData.newPassword) {
        body.currentPassword = passwordData.currentPassword;
        body.newPassword = passwordData.newPassword;
      }

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || "Gagal menyimpan pengaturan");
      }

      toast.success("Pengaturan berhasil disimpan!");

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan pengaturan",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    toast.info("Form direset");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Info - Read Only */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nipNuptk">NIP/NUPTK</Label>
            <Input
              id="nipNuptk"
              type="text"
              value={formData.nipNuptk}
              onChange={(e) =>
                setFormData({ ...formData, nipNuptk: e.target.value })
              }
              placeholder="Opsional"
            />
          </div>
        </CardContent>
      </Card>

      {/* School Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sekolah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName">
              Nama Sekolah <span className="text-destructive">*</span>
            </Label>
            <Input
              id="schoolName"
              type="text"
              value={formData.schoolName}
              onChange={(e) =>
                setFormData({ ...formData, schoolName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="educationStage">
              Jenjang Pendidikan <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.educationStage}
              onValueChange={(value) =>
                setFormData({ ...formData, educationStage: value })
              }
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityDistrict">
              Kota/Kabupaten <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cityDistrict"
              type="text"
              value={formData.cityDistrict}
              onChange={(e) =>
                setFormData({ ...formData, cityDistrict: e.target.value })
              }
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Kosongkan jika tidak ingin mengubah password
          </p>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Lama</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Masukkan password lama"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Ulangi password baru"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
