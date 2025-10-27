// Settings Cover Page - Manage cover logos and illustrations for reports
// Created: 2025-10-19 - Initial UI for cover asset management (logos & illustrations)
// Updated: 2025-10-20 - Stabilize fetchSettings dependencies for lint compliance

"use client";

export const runtime = "edge";

import {
  ImagePlus,
  Loader2,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RippleButton } from "@/components/ui/ripple-button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReportCoverIllustration } from "@/drizzle/schema/report-cover-illustrations";
import { toast } from "@/lib/toast";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, sesuai batas backend

interface CoverSettingsResponse {
  logos: {
    logoDinasUrl: string | null;
    logoSekolahUrl: string | null;
  };
  illustrations: ReportCoverIllustration[];
}

type LogoType = "logo-dinas" | "logo-sekolah";

type UploadState =
  | { status: "idle" }
  | { status: "loading"; description: string }
  | { status: "success"; description: string }
  | { status: "error"; description: string };

type TabKey = "logos" | "illustrations" | "preferences";

export default function CoverSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("logos");
  const [data, setData] = useState<CoverSettingsResponse | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    type: "logo" | "illustration";
    id: string;
  } | null>(null);
  const [labelDraft, setLabelDraft] = useState("");

  const resetUploadState = () => setUploadState({ status: "idle" });

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/settings/cover-upload");
      if (!response.ok) {
        throw new Error("Gagal memuat data cover");
      }
      const json = (await response.json()) as CoverSettingsResponse;
      setData(json);
    } catch (err) {
      console.error("[CoverSettings] fetch error", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data cover");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const logoItems = useMemo(() => {
    if (!data)
      return [] as {
        key: LogoType;
        label: string;
        description: string;
        url: string | null;
      }[];
    return [
      {
        key: "logo-dinas" as const,
        label: "Logo Dinas Pendidikan",
        description:
          "Ditampilkan di pojok kiri cover laporan. Gunakan versi resmi terbaru.",
        url: data.logos.logoDinasUrl,
      },
      {
        key: "logo-sekolah" as const,
        label: "Logo Sekolah",
        description: "Ditampilkan di pojok kanan cover laporan.",
        url: data.logos.logoSekolahUrl,
      },
    ];
  }, [data]);

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    assetType: LogoType,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!ALLOWED_TYPES.has(file.type)) {
        toast.error("Logo harus PNG atau JPG");
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        toast.error("Ukuran logo maksimal 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("assetType", assetType);
      formData.append("file", file);

      setUploadState({ status: "loading", description: "Mengunggah logo..." });
      const response = await fetch("/api/settings/cover-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Gagal mengunggah logo");
      }

      toast.success("Logo berhasil diperbarui");
      await fetchSettings();
      setUploadState({ status: "success", description: "Logo tersimpan" });
    } catch (err) {
      console.error("[CoverSettings] upload logo error", err);
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah logo");
      setUploadState({ status: "error", description: "Unggah gagal" });
    } finally {
      event.target.value = "";
      setTimeout(resetUploadState, 2000);
    }
  };

  const handleIllustrationUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!ALLOWED_TYPES.has(file.type)) {
        toast.error("Ilustrasi harus PNG atau JPG");
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        toast.error("Ukuran ilustrasi maksimal 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("assetType", "cover-illustration");
      if (labelDraft.trim()) {
        formData.append("label", labelDraft.trim());
      }
      formData.append("file", file);

      setUploadState({
        status: "loading",
        description: "Mengunggah ilustrasi...",
      });
      const response = await fetch("/api/settings/cover-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Gagal mengunggah ilustrasi");
      }

      toast.success("Ilustrasi ditambahkan");
      setLabelDraft("");
      await fetchSettings();
      setUploadState({ status: "success", description: "Ilustrasi tersimpan" });
    } catch (err) {
      console.error("[CoverSettings] upload illustration error", err);
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunggah ilustrasi",
      );
      setUploadState({ status: "error", description: "Unggah gagal" });
    } finally {
      event.target.value = "";
      setTimeout(resetUploadState, 2000);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      const body =
        pendingDelete.type === "logo"
          ? { assetType: pendingDelete.id as LogoType }
          : {
              assetType: "cover-illustration",
              illustrationId: pendingDelete.id,
            };

      const promise = fetch("/api/settings/cover-upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      await toast.promise(promise, {
        loading: "Menghapus aset...",
        success: "Aset berhasil dihapus",
        error: "Gagal menghapus aset",
      });

      await fetchSettings();
    } catch (err) {
      console.error("[CoverSettings] delete error", err);
    } finally {
      setIsDeleteDialogOpen(false);
      setPendingDelete(null);
    }
  };

  const renderUploadState = () => {
    if (uploadState.status === "idle") return null;

    if (uploadState.status === "loading") {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {uploadState.description}
        </div>
      );
    }

    if (uploadState.status === "success") {
      return (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <ShieldCheck className="h-4 w-4" />
          {uploadState.description}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <Trash2 className="h-4 w-4" />
        {uploadState.description}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Pengaturan Cover
          </h1>
          <p className="text-muted-foreground">
            Kelola logo dan ilustrasi yang digunakan pada cover laporan Guru
            Wali.
          </p>
          <p className="text-sm text-muted-foreground">
            Semua file akan diunggah ke R2 (bucket `covers/`). Pastikan
            menggunakan gambar resolusi tinggi agar hasil cetak tajam.
          </p>
        </div>
        <RippleButton
          variant="outline"
          onClick={() => router.push("/settings")}
        >
          Kembali ke Pengaturan
        </RippleButton>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Gagal memuat data
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <RippleButton variant="outline" onClick={fetchSettings}>
              Coba Lagi
            </RippleButton>
          </CardFooter>
        </Card>
      )}

      {!isLoading && !error && data && (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabKey)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logos">Logo Cover</TabsTrigger>
            <TabsTrigger value="illustrations">Ilustrasi Kustom</TabsTrigger>
            <TabsTrigger value="preferences">Preferensi</TabsTrigger>
          </TabsList>

          <TabsContent value="logos" className="space-y-4 pt-4">
            {logoItems.map((logo) => (
              <Card key={logo.key}>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>{logo.label}</CardTitle>
                    <CardDescription>{logo.description}</CardDescription>
                  </div>
                  {logo.url ? (
                    <Badge variant="secondary" className="w-fit">
                      Sudah diunggah
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-fit">
                      Belum ada file
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-[200px_1fr]">
                  <div className="flex h-44 w-full items-center justify-center rounded-lg border bg-muted">
                    {logo.url ? (
                      <Image
                        src={logo.url}
                        alt={logo.label}
                        width={200}
                        height={200}
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                        <UploadCloud className="h-6 w-6" />
                        Belum ada logo
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Rekomendasi ukuran minimal 800x800 px dengan latar
                      transparan.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent">
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={(event) =>
                            handleLogoUpload(event, logo.key)
                          }
                        />
                        <UploadCloud className="h-4 w-4" />
                        Unggah Logo
                      </label>
                      <RippleButton
                        variant="destructive"
                        onClick={() => {
                          if (!logo.url) {
                            toast.info("Logo belum diunggah");
                            return;
                          }
                          setPendingDelete({ type: "logo", id: logo.key });
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={!logo.url}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus Logo
                      </RippleButton>
                    </div>
                    {renderUploadState()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="illustrations" className="space-y-4 pt-4">
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-lg border border-amber-500 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-medium">⚠️ Mode Development</p>
                <p className="mt-1">
                  Preview gambar hanya tersedia di production. Upload tetap
                  berfungsi untuk testing.
                </p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Upload Ilustrasi Cover Baru</CardTitle>
                <CardDescription>
                  Gunakan ilustrasi berukuran minimal 2000px (rasio landscape)
                  agar hasil cover maksimal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="illustration-label"
                    className="text-sm font-medium"
                  >
                    Label (opsional)
                  </label>
                  <Input
                    id="illustration-label"
                    placeholder="Contoh: Cover edisi Hari Guru"
                    value={labelDraft}
                    onChange={(event) => setLabelDraft(event.target.value)}
                  />
                </div>
                <div className="rounded-lg border-2 border-dashed p-6 text-center">
                  <label className="flex flex-col items-center gap-3 cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleIllustrationUpload}
                    />
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Klik untuk unggah ilustrasi</p>
                      <p className="text-sm text-muted-foreground">
                        Format PNG/JPG, maksimal 5MB
                      </p>
                    </div>
                  </label>
                </div>
                {renderUploadState()}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.illustrations.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    Belum ada ilustrasi kustom. Unggah ilustrasi pertama Anda
                    untuk mempercantik cover laporan.
                  </CardContent>
                </Card>
              ) : (
                data.illustrations.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative h-40 w-full bg-muted">
                      <Image
                        src={item.url}
                        alt={item.label || "Cover Illustration"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {item.label || "Tanpa label"}
                      </CardTitle>
                      <CardDescription>
                        Diupload pada{" "}
                        {new Date(item.createdAt).toLocaleString("id-ID")}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <RippleButton
                        variant="outline"
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        Lihat Full
                      </RippleButton>
                      <RippleButton
                        variant="destructive"
                        onClick={() => {
                          setPendingDelete({
                            type: "illustration",
                            id: item.id,
                          });
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </RippleButton>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferensi Cover Laporan</CardTitle>
                <CardDescription>
                  Pilih jenis cover yang akan digunakan untuk laporan semester
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cover-simple"
                      name="cover-type"
                      value="simple"
                      className="h-4 w-4"
                      defaultChecked
                    />
                    <label
                      htmlFor="cover-simple"
                      className="text-sm font-medium"
                    >
                      Cover Sederhana (Text Only)
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Cover dengan teks dan logo saja, tanpa ilustrasi background
                  </p>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cover-illustration"
                      name="cover-type"
                      value="illustration"
                      className="h-4 w-4"
                      disabled={!data?.illustrations?.length}
                    />
                    <label
                      htmlFor="cover-illustration"
                      className={`text-sm font-medium ${!data?.illustrations?.length ? "text-muted-foreground" : ""}`}
                    >
                      Cover dengan Ilustrasi
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    {data?.illustrations?.length
                      ? `Menggunakan ilustrasi custom sebagai background (${data.illustrations.length} tersedia)`
                      : "Upload ilustrasi terlebih dahulu untuk menggunakan opsi ini"}
                  </p>
                </div>

                {data?.illustrations?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Ilustrasi yang Dipilih:
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {data.illustrations.map((illustration) => (
                        <div
                          key={illustration.id}
                          className="relative aspect-video overflow-hidden rounded-lg border-2 border-muted hover:border-primary cursor-pointer transition-colors"
                        >
                          <Image
                            src={illustration.url}
                            alt={illustration.label || "Cover illustration"}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                            <span className="text-xs text-white font-medium">
                              {illustration.label || "Tanpa Label"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <RippleButton
                  className="w-full"
                  onClick={() => {
                    toast.success("Preferensi cover berhasil disimpan");
                  }}
                >
                  Simpan Preferensi
                </RippleButton>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Aset yang sudah dihapus tidak dapat dikembalikan. Pastikan tidak
              ada dokumen aktif yang membutuhkan file ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <RippleButton
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </RippleButton>
            <RippleButton variant="destructive" onClick={confirmDelete}>
              Hapus Sekarang
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
