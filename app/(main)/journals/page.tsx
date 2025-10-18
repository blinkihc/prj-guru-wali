// Journals Page - List all monthly journals
// Created: 2025-01-14
// Updated: 2025-10-15 - Implemented with real data

"use client";

import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import type { MonthlyJournal } from "@/drizzle/schema/monthly-journals";
import type { Student } from "@/drizzle/schema/students";

export default function JournalsPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<MonthlyJournal[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all journals
        const journalsRes = await fetch("/api/journals");
        if (journalsRes.ok) {
          const journalsData = (await journalsRes.json()) as {
            journals?: any[];
          };
          setJournals(journalsData.journals || []);
        }

        // Fetch students for mapping
        const studentsRes = await fetch("/api/students");
        if (studentsRes.ok) {
          const studentsData = (await studentsRes.json()) as {
            students?: any[];
          };
          setStudents(studentsData.students || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load journals",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.fullName || "Unknown Student";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jurnal Bulanan</h1>
          <p className="text-muted-foreground mt-1">
            Catatan perkembangan 5 aspek pemantauan siswa
          </p>
        </div>
        <RippleButton onClick={() => router.push("/journals/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Jurnal Baru
        </RippleButton>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState
          title="Gagal Memuat Data"
          message={error}
          onRetry={() => window.location.reload()}
        />
      ) : journals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum Ada Jurnal Bulanan"
          message="Mulai buat jurnal bulanan untuk mendokumentasikan perkembangan siswa"
          actionLabel="Buat Jurnal Baru"
          onAction={() => router.push("/journals/new")}
        />
      ) : (
        <div className="space-y-4">
          {journals.map((journal) => (
            <Card
              key={journal.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                const student = students.find(
                  (s) => s.id === journal.studentId,
                );
                if (student) {
                  router.push(`/students/${student.id}?tab=journals`);
                }
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle>{journal.monitoringPeriod}</CardTitle>
                    <CardDescription>
                      <span className="font-semibold text-foreground">
                        {getStudentName(journal.studentId)}
                      </span>
                      {" • "}
                      {new Date(journal.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {journal.academicDesc && (
                  <div>
                    <p className="text-sm font-semibold mb-1">📚 Akademik</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {journal.academicDesc}
                    </p>
                  </div>
                )}

                {journal.characterDesc && (
                  <div>
                    <p className="text-sm font-semibold mb-1">⭐ Karakter</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {journal.characterDesc}
                    </p>
                  </div>
                )}

                {journal.socialEmotionalDesc && (
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      🤝 Sosial-Emosional
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {journal.socialEmotionalDesc}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
