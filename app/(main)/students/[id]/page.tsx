// Student Detail Page - View student profile, journals, meetings, and interventions
// Created: 2025-01-14
// Updated: 2025-10-20 - Integrate biodata form & social usage management
// Updated: 2025-10-20 - Rapikan hook order & response typing untuk lint compliance
// Tabs: Profil | Jurnal | Pertemuan | Intervensi

"use client";

export const runtime = "edge";

import {
  ArrowLeft,
  Camera,
  Download,
  FileText,
  Loader2,
  Target,
  Trash2,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BiodataForm } from "@/components/students/biodata-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { RippleButton } from "@/components/ui/ripple-button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Intervention } from "@/drizzle/schema/interventions";
import type { MeetingLog } from "@/drizzle/schema/meeting-logs";
import type { MonthlyJournal } from "@/drizzle/schema/monthly-journals";
import type { StudentSocialUsage } from "@/drizzle/schema/student-social-usages";
import type { Student } from "@/drizzle/schema/students";
import { toast } from "@/lib/toast";
import { normalizeImageToThreeByFour } from "@/lib/uploads/image-normalize";

interface PageProps {
  params: Promise<{ id: string }>;
}

const ALLOWED_PHOTO_TYPES = new Set(["image/png", "image/jpeg"]);
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB sesuai batas backend

export default function StudentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string>("");
  const [student, setStudent] = useState<Student | null>(null);
  const [journals, setJournals] = useState<MonthlyJournal[]>([]);
  const [meetings, setMeetings] = useState<MeetingLog[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [socialUsages, setSocialUsages] = useState<StudentSocialUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [tempPhotoFile, setTempPhotoFile] = useState<File | null>(null);
  const [photoCacheKey, setPhotoCacheKey] = useState<string>("");
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStudentUpdated = useCallback((updated: Student) => {
    setStudent(updated);
  }, []);

  const handleSocialUsagesUpdated = useCallback(
    (updated: StudentSocialUsage[]) => {
      setSocialUsages(updated);
    },
    [],
  );

  const currentPhotoUrl = useMemo(
    () => student?.photoUrl ?? null,
    [student?.photoUrl],
  );

  useEffect(() => {
    if (currentPhotoUrl) {
      setPhotoCacheKey(Date.now().toString());
    } else {
      setPhotoCacheKey("");
    }
  }, [currentPhotoUrl]);

  const studentPhotoSrc = useMemo(() => {
    if (!studentId || !currentPhotoUrl) {
      return null;
    }

    const params = new URLSearchParams({ studentId });
    if (photoCacheKey) {
      params.set("v", photoCacheKey);
    }

    return `/api/students/photo?${params.toString()}`;
  }, [currentPhotoUrl, photoCacheKey, studentId]);

  const displayPhotoUrl = useMemo(() => {
    return localPhotoUrl ?? studentPhotoSrc ?? currentPhotoUrl;
  }, [currentPhotoUrl, localPhotoUrl, studentPhotoSrc]);

  const refreshStudentData = useCallback(async () => {
    if (!studentId) return;

    try {
      const studentRes = await fetch(`/api/students/${studentId}`);
      if (!studentRes.ok) {
        throw new Error("Student not found");
      }
      const studentData: {
        student?: Student;
        socialUsages?: StudentSocialUsage[];
      } = await studentRes.json();
      setStudent(studentData.student ?? null);
      setSocialUsages(studentData.socialUsages ?? []);
    } catch (err) {
      console.error("Refresh student error:", err);
      toast.error("Gagal memuat ulang data siswa");
    }
  }, [studentId]);

  // Handle file selection from hidden input
  const resetTempPhotoState = useCallback(() => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setTempPhotoFile(null);
  }, [photoPreviewUrl]);

  const handlePhotoDialogOpenChange = useCallback(
    (open: boolean) => {
      setIsPhotoDialogOpen(open);
      if (!open) {
        resetTempPhotoState();
      }
    },
    [resetTempPhotoState],
  );

  const handlePhotoFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
          toast.error("Foto harus format PNG atau JPG");
          return;
        }

        if (file.size > MAX_PHOTO_BYTES) {
          toast.error("Ukuran foto maksimal 2MB");
          return;
        }

        if (photoPreviewUrl) {
          URL.revokeObjectURL(photoPreviewUrl);
        }

        const normalized = await normalizeImageToThreeByFour(file, {
          maxWidth: 600,
          format: file.type === "image/png" ? "image/png" : "image/jpeg",
          fileName: `${studentId}-photo`,
        });

        const preview = URL.createObjectURL(normalized);
        setTempPhotoFile(normalized);
        setPhotoPreviewUrl(preview);
        handlePhotoDialogOpenChange(true);
      } catch (err) {
        console.error("Normalize photo error:", err);
        toast.error("Gagal memproses foto, coba file lain");
      } finally {
        // Reset input value supaya pilih file sama pun bisa
        event.target.value = "";
      }
    },
    [handlePhotoDialogOpenChange, photoPreviewUrl, studentId],
  );

  const handleUploadPhoto = useCallback(async () => {
    if (!tempPhotoFile || !studentId) return;

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("file", tempPhotoFile);

    try {
      setIsPhotoUploading(true);

      const uploadPromise: Promise<{ url?: string }> = (async () => {
        const response = await fetch("/api/students/photo", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
            url?: string;
          };
          throw new Error(payload.error || "Gagal mengunggah foto siswa");
        }

        return (await response.json()) as { url?: string };
      })();

      await toast.promise(uploadPromise, {
        loading: "Mengunggah foto siswa...",
        success: "Foto siswa berhasil diperbarui",
        error: "Gagal mengunggah foto siswa",
      });

      const localUrl = URL.createObjectURL(tempPhotoFile);
      setLocalPhotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return localUrl;
      });

      handlePhotoDialogOpenChange(false);

      setPhotoCacheKey(Date.now().toString());

      await refreshStudentData();
      setLocalPhotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    } catch (err) {
      console.error("Upload photo error:", err);
    } finally {
      setIsPhotoUploading(false);
    }
  }, [
    handlePhotoDialogOpenChange,
    refreshStudentData,
    studentId,
    tempPhotoFile,
  ]);

  const handleDeletePhoto = useCallback(async () => {
    if (!studentId || !currentPhotoUrl) {
      return;
    }

    try {
      await toast.promise(
        (async () => {
          const response = await fetch("/api/students/photo", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId }),
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as {
              error?: string;
            };
            throw new Error(payload.error || "Gagal menghapus foto siswa");
          }

          return response;
        })(),
        {
          loading: "Menghapus foto siswa...",
          success: "Foto siswa berhasil dihapus",
          error: "Gagal menghapus foto siswa",
        },
      );

      setStudent((prev) => (prev ? { ...prev, photoUrl: null } : prev));
      setPhotoCacheKey("");
      await refreshStudentData();
    } catch (err) {
      console.error("Delete photo error:", err);
    }
  }, [currentPhotoUrl, refreshStudentData, studentId]);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setStudentId(p.id));
  }, [params]);

  // Fetch student data
  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch student
        const studentRes = await fetch(`/api/students/${studentId}`);
        if (!studentRes.ok) {
          throw new Error("Student not found");
        }
        const studentData = (await studentRes.json()) as {
          student?: Student;
          socialUsages?: StudentSocialUsage[];
        };
        setStudent(studentData.student ?? null);
        setSocialUsages(studentData.socialUsages ?? []);

        // Fetch journals
        const journalsRes = await fetch(`/api/journals?studentId=${studentId}`);
        if (journalsRes.ok) {
          const journalsData = (await journalsRes.json()) as {
            journals?: MonthlyJournal[];
          };
          setJournals(journalsData.journals ?? []);
        }

        // Fetch meetings
        const meetingsRes = await fetch(`/api/meetings?studentId=${studentId}`);
        if (meetingsRes.ok) {
          const meetingsData = (await meetingsRes.json()) as {
            meetings?: MeetingLog[];
          };
          setMeetings(meetingsData.meetings ?? []);
        }

        // Fetch interventions
        const interventionsRes = await fetch(
          `/api/interventions?studentId=${studentId}`,
        );
        if (interventionsRes.ok) {
          const interventionsData = (await interventionsRes.json()) as {
            interventions?: Intervention[];
          };
          setInterventions(interventionsData.interventions ?? []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Download biodata PDF (full 32 fields)
  const handleDownloadBiodata = async () => {
    if (!studentId) return;

    try {
      setIsDownloading(true);

      const response = await fetch(`/api/reports/biodata/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to generate biodata");
      }

      // Get filename from headers or use default
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `Biodata_Siswa_${new Date().toISOString().split("T")[0]}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Biodata PDF berhasil diunduh");
    } catch (error) {
      console.error("Download biodata error:", error);
      toast.error("Gagal mengunduh biodata PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download PDF report (journals/meetings/interventions)
  const handleDownloadPDF = async () => {
    if (!studentId) return;

    try {
      setIsDownloading(true);

      const response = await fetch(`/api/reports/student/${studentId}`);
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      // Get filename from headers or use default
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `Laporan_Siswa_${new Date().toISOString().split("T")[0]}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh laporan. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="container mx-auto py-6">
        <ErrorState
          title="Student Not Found"
          message={error || "Unable to load student data"}
          onRetry={() => router.push("/students")}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Hidden file input untuk pemilihan foto siswa. Simpan di sini supaya tombol custom bisa memicunya. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      {/* Header + manajemen foto siswa */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <RippleButton
            variant="outline"
            size="icon"
            onClick={() => router.push("/students")}
            className="mt-1 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </RippleButton>
          <div className="flex items-start gap-4">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Foto Siswa</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                  {displayPhotoUrl ? (
                    <div className="relative h-full max-h-[600px] w-full">
                      <Image
                        src={displayPhotoUrl}
                        alt={student.fullName}
                        fill
                        className="rounded-xl object-contain"
                        sizes="(max-width: 768px) 90vw, 600px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-full max-h-[600px] w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                      Tidak ada foto
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex flex-col items-center gap-2">
              <div className="aspect-[3/4] w-[165px] overflow-hidden rounded-lg border bg-muted">
                {displayPhotoUrl ? (
                  <Image
                    src={displayPhotoUrl}
                    alt={student.fullName}
                    width={165}
                    height={220}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-lg font-semibold text-muted-foreground">
                    {student.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {currentPhotoUrl && (
                <RippleButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  Lihat Foto
                </RippleButton>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <h1 className="text-3xl font-bold">{student.fullName}</h1>
                <p className="text-muted-foreground mt-1">
                  {student.classroom && `Kelas ${student.classroom}`}
                  {student.classroom && student.nisn && " • "}
                  {student.nisn && `NISN: ${student.nisn}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RippleButton
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPhotoUploading}
                >
                  {isPhotoUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Ganti Foto
                    </>
                  )}
                </RippleButton>
                <RippleButton
                  variant="destructive"
                  onClick={handleDeletePhoto}
                  disabled={!currentPhotoUrl || isPhotoUploading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Foto
                </RippleButton>
              </div>
              <p className="text-xs text-muted-foreground">
                Gunakan foto rasio 3:4 (maks 2MB). Sistem otomatis crop & resize
                ke tengah.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <RippleButton
            variant="outline"
            onClick={handleDownloadBiodata}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Mengunduh..." : "Unduh Biodata PDF"}
          </RippleButton>
          <RippleButton
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            <FileText className="mr-2 h-4 w-4" />
            {isDownloading ? "Mengunduh..." : "Unduh Laporan PDF"}
          </RippleButton>
          <RippleButton onClick={() => router.push("/journals/new")}>
            <FileText className="mr-2 h-4 w-4" />
            Buat Jurnal Baru
          </RippleButton>
        </div>
      </div>

      <Dialog
        open={isPhotoDialogOpen}
        onOpenChange={handlePhotoDialogOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Foto Siswa</DialogTitle>
            <DialogDescription>
              Periksa kembali foto sebelum menyimpannya. Foto akan otomatis
              disimpan ke R2.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {photoPreviewUrl ? (
              <div className="mx-auto h-48 w-36 overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={photoPreviewUrl}
                  alt="Preview foto siswa"
                  width={144}
                  height={192}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="mx-auto flex h-48 w-36 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Tidak ada preview
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Jika hasil crop belum sesuai, pilih ulang foto sebelum menyimpan.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <RippleButton
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPhotoUploading}
            >
              Pilih Foto Lain
            </RippleButton>
            <RippleButton
              onClick={handleUploadPhoto}
              disabled={isPhotoUploading}
            >
              {isPhotoUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Foto"
              )}
            </RippleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="journals">
            <FileText className="mr-2 h-4 w-4" />
            Jurnal ({journals.length})
          </TabsTrigger>
          <TabsTrigger value="meetings">
            <Users className="mr-2 h-4 w-4" />
            Pertemuan ({meetings.length})
          </TabsTrigger>
          <TabsTrigger value="interventions">
            <Target className="mr-2 h-4 w-4" />
            Intervensi ({interventions.length})
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Siswa</CardTitle>
              <CardDescription>Data profil lengkap siswa</CardDescription>
            </CardHeader>
            <CardContent>
              {student ? (
                <BiodataForm
                  student={student}
                  socialUsages={socialUsages}
                  onUpdated={handleStudentUpdated}
                  onSocialUsagesUpdated={handleSocialUsagesUpdated}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Data siswa tidak tersedia.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journals Tab */}
        <TabsContent value="journals" className="space-y-4">
          {journals.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Belum Ada Jurnal"
              message="Belum ada catatan jurnal bulanan untuk siswa ini"
              actionLabel="Buat Jurnal"
              onAction={() => router.push("/journals/new")}
            />
          ) : (
            <div className="space-y-4">
              {journals.map((journal) => (
                <Card key={journal.id}>
                  <CardHeader>
                    <CardTitle>{journal.monitoringPeriod}</CardTitle>
                    <CardDescription>
                      Jurnal Bulanan •{" "}
                      {new Date(journal.createdAt).toLocaleDateString("id-ID")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {journal.academicDesc && (
                      <div>
                        <p className="text-sm font-semibold mb-1">
                          📚 Akademik
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {journal.academicDesc}
                        </p>
                      </div>
                    )}

                    {journal.characterDesc && (
                      <div>
                        <p className="text-sm font-semibold mb-1">
                          ⭐ Karakter
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {journal.characterDesc}
                        </p>
                      </div>
                    )}

                    {journal.socialEmotionalDesc && (
                      <div>
                        <p className="text-sm font-semibold mb-1">
                          🤝 Sosial-Emosional
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {journal.socialEmotionalDesc}
                        </p>
                      </div>
                    )}

                    {journal.disciplineDesc && (
                      <div>
                        <p className="text-sm font-semibold mb-1">
                          📋 Kedisiplinan
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {journal.disciplineDesc}
                        </p>
                      </div>
                    )}

                    {journal.potentialInterestDesc && (
                      <div>
                        <p className="text-sm font-semibold mb-1">
                          🎯 Potensi & Minat
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {journal.potentialInterestDesc}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          {meetings.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Belum Ada Log Pertemuan"
              message="Belum ada catatan pertemuan untuk siswa ini"
              actionLabel="Buat Log Pertemuan"
              onAction={() => router.push("/journals/new")}
            />
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader>
                    <CardTitle>{meeting.topic}</CardTitle>
                    <CardDescription>
                      Pertemuan •{" "}
                      {new Date(meeting.meetingDate).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {meeting.followUp && (
                      <div>
                        <p className="text-sm font-semibold mb-1">
                          📝 Tindak Lanjut
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {meeting.followUp}
                        </p>
                      </div>
                    )}

                    {meeting.notes && (
                      <div>
                        <p className="text-sm font-semibold mb-1">💬 Catatan</p>
                        <p className="text-sm text-muted-foreground">
                          {meeting.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-4">
          {interventions.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Belum Ada Rencana Intervensi"
              message="Belum ada rencana intervensi untuk siswa ini"
              actionLabel="Buat Rencana Intervensi"
              onAction={() =>
                router.push(`/interventions/new?studentId=${studentId}`)
              }
            />
          ) : (
            <div className="space-y-4">
              {interventions.map((intervention) => {
                const statusColor =
                  intervention.status === "completed"
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : intervention.status === "cancelled"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-blue-500/10 text-blue-600 border-blue-500/20";

                const statusLabel =
                  intervention.status === "completed"
                    ? "✅ Selesai"
                    : intervention.status === "cancelled"
                      ? "❌ Dibatalkan"
                      : "🔵 Aktif";

                return (
                  <Card key={intervention.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle>{intervention.title}</CardTitle>
                          <CardDescription>
                            Mulai:{" "}
                            {new Date(
                              intervention.startDate,
                            ).toLocaleDateString("id-ID")}
                            {intervention.endDate && (
                              <>
                                {" • "}
                                Target:{" "}
                                {new Date(
                                  intervention.endDate,
                                ).toLocaleDateString("id-ID")}
                              </>
                            )}
                          </CardDescription>
                        </div>
                        <Badge className={statusColor}>{statusLabel}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {intervention.issue && (
                        <div>
                          <p className="text-sm font-semibold mb-1">
                            🔍 Masalah
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {intervention.issue}
                          </p>
                        </div>
                      )}

                      {intervention.goal && (
                        <div>
                          <p className="text-sm font-semibold mb-1">
                            🎯 Tujuan
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {intervention.goal}
                          </p>
                        </div>
                      )}

                      {intervention.actionSteps && (
                        <div>
                          <p className="text-sm font-semibold mb-1">
                            📋 Langkah Tindakan
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {intervention.actionSteps}
                          </p>
                        </div>
                      )}

                      {intervention.notes && (
                        <div>
                          <p className="text-sm font-semibold mb-1">
                            💬 Catatan
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {intervention.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
