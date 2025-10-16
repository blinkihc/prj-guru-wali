// New Intervention Page - Create new intervention plan
// Created: 2025-01-14

"use client";

import { Target } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InterventionForm } from "@/components/interventions/intervention-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Label } from "@/components/ui/label";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { Student } from "@/drizzle/schema/students";

export default function NewInterventionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedStudentId = searchParams.get("studentId");

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preSelectedStudentId || "",
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        setError(null);

        const response = await fetch("/api/students");
        if (!response.ok) {
          throw new Error("Gagal memuat data siswa");
        }

        const data = (await response.json()) as { students?: any[] };
        setStudents(data.students || []);
      } catch (err) {
        console.error("Fetch students error:", err);
        setError(
          err instanceof Error ? err.message : "Gagal memuat data siswa",
        );
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleSuccess = () => {
    if (selectedStudent) {
      router.push(`/students/${selectedStudent.id}?tab=interventions`);
    } else {
      router.push("/students");
    }
  };

  const handleCancel = () => {
    if (selectedStudent) {
      router.push(`/students/${selectedStudent.id}?tab=interventions`);
    } else {
      router.push("/students");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buat Rencana Intervensi</h1>
          <p className="text-muted-foreground mt-1">
            Rencana tindakan untuk siswa yang membutuhkan perhatian khusus
          </p>
        </div>
        <RippleButton variant="outline" onClick={handleCancel}>
          Kembali
        </RippleButton>
      </div>

      {/* Select Student (if not pre-selected) */}
      {!selectedStudentId && (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Siswa</CardTitle>
            <CardDescription>
              Pilih siswa yang akan dibuatkan rencana intervensi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <ErrorState
                title="Gagal Memuat Data"
                message={error}
                onRetry={() => window.location.reload()}
              />
            ) : isLoadingStudents ? (
              <SkeletonCard />
            ) : students.length === 0 ? (
              <EmptyState
                icon={Target}
                title="Belum Ada Siswa"
                message="Tambahkan siswa terlebih dahulu untuk membuat rencana intervensi"
                actionLabel="Tambah Siswa"
                onAction={() => router.push("/students")}
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="student">
                  Pilih Siswa <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Pilih siswa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.fullName}
                        {student.classroom && ` (${student.classroom})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Intervention Form */}
      {selectedStudentId && selectedStudent && (
        <InterventionForm
          student={selectedStudent}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
