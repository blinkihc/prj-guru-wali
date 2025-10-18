// Student Detail Page - View student profile, journals, meetings, and interventions
// Created: 2025-01-14
// Updated: 2025-01-14 - Added Interventions tab, PDF download
// Tabs: Profil | Jurnal | Pertemuan | Intervensi

"use client";

import {
  ArrowLeft,
  Download,
  FileText,
  Target,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { RippleButton } from "@/components/ui/ripple-button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Intervention } from "@/drizzle/schema/interventions";
import type { MeetingLog } from "@/drizzle/schema/meeting-logs";
import type { MonthlyJournal } from "@/drizzle/schema/monthly-journals";
import type { Student } from "@/drizzle/schema/students";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string>("");
  const [student, setStudent] = useState<Student | null>(null);
  const [journals, setJournals] = useState<MonthlyJournal[]>([]);
  const [meetings, setMeetings] = useState<MeetingLog[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const studentData = (await studentRes.json()) as { student?: any };
        setStudent(studentData.student);

        // Fetch journals
        const journalsRes = await fetch(`/api/journals?studentId=${studentId}`);
        if (journalsRes.ok) {
          const journalsData = (await journalsRes.json()) as {
            journals?: any[];
          };
          setJournals(journalsData.journals || []);
        }

        // Fetch meetings
        const meetingsRes = await fetch(`/api/meetings?studentId=${studentId}`);
        if (meetingsRes.ok) {
          const meetingsData = (await meetingsRes.json()) as {
            meetings?: any[];
          };
          setMeetings(meetingsData.meetings || []);
        }

        // Fetch interventions
        const interventionsRes = await fetch(
          `/api/interventions?studentId=${studentId}`,
        );
        if (interventionsRes.ok) {
          const interventionsData = (await interventionsRes.json()) as {
            interventions?: any[];
          };
          setInterventions(interventionsData.interventions || []);
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

  // Download PDF report
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <RippleButton
          variant="outline"
          size="icon"
          onClick={() => router.push("/students")}
        >
          <ArrowLeft className="h-4 w-4" />
        </RippleButton>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{student.fullName}</h1>
          <p className="text-muted-foreground mt-1">
            {student.classroom && `Kelas ${student.classroom}`}
            {student.classroom && student.nisn && " • "}
            {student.nisn && `NISN: ${student.nisn}`}
          </p>
        </div>
        <div className="flex gap-2">
          <RippleButton
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Mengunduh..." : "Unduh Laporan PDF"}
          </RippleButton>
          <RippleButton onClick={() => router.push("/journals/new")}>
            <FileText className="mr-2 h-4 w-4" />
            Buat Jurnal Baru
          </RippleButton>
        </div>
      </div>

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
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nama Lengkap
                  </p>
                  <p className="text-base font-semibold">{student.fullName}</p>
                </div>

                {student.nisn && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      NISN
                    </p>
                    <p className="text-base font-mono">{student.nisn}</p>
                  </div>
                )}

                {student.classroom && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Kelas
                    </p>
                    <p className="text-base font-semibold">
                      {student.classroom}
                    </p>
                  </div>
                )}

                {student.gender && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Jenis Kelamin
                    </p>
                    <p className="text-base">
                      {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                )}

                {student.parentName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nama Orang Tua/Wali
                    </p>
                    <p className="text-base">{student.parentName}</p>
                  </div>
                )}

                {student.parentContact && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Kontak Orang Tua
                    </p>
                    <p className="text-base font-mono">
                      +{student.parentContact}
                    </p>
                  </div>
                )}
              </div>

              {student.specialNotes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Catatan Khusus
                  </p>
                  <p className="text-base text-muted-foreground bg-muted p-3 rounded-md">
                    {student.specialNotes}
                  </p>
                </div>
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
