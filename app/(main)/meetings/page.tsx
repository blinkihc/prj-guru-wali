// Meetings Page - List all meeting logs
// Created: 2025-01-14

"use client";

export const runtime = "edge";

import { Plus, Users } from "lucide-react";
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
import type { MeetingLog } from "@/drizzle/schema/meeting-logs";
import type { Student } from "@/drizzle/schema/students";

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all meetings
        const meetingsRes = await fetch("/api/meetings");
        if (meetingsRes.ok) {
          const meetingsData = (await meetingsRes.json()) as {
            meetings?: any[];
          };
          setMeetings(meetingsData.meetings || []);
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
          err instanceof Error ? err.message : "Failed to load meetings",
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
          <h1 className="text-3xl font-bold">Log Pertemuan</h1>
          <p className="text-muted-foreground mt-1">
            Semua catatan pertemuan dengan siswa atau orang tua
          </p>
        </div>
        <RippleButton onClick={() => router.push("/meetings/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Log Pertemuan
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
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum Ada Log Pertemuan"
          message="Mulai buat log pertemuan untuk mendokumentasikan diskusi dengan siswa atau orang tua"
          actionLabel="Buat Log Pertemuan"
          onAction={() => router.push("/meetings/new")}
        />
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                const student = students.find(
                  (s) => s.id === meeting.studentId,
                );
                if (student) {
                  router.push(`/students/${student.id}?tab=meetings`);
                }
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle>{meeting.topic}</CardTitle>
                    <CardDescription>
                      <span className="font-semibold text-foreground">
                        {getStudentName(meeting.studentId)}
                      </span>
                      {" • "}
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
                  </div>
                </div>
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
    </div>
  );
}
