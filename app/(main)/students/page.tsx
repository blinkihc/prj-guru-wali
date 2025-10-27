// Students Page - List and manage students
// Created: 2025-10-14
// Updated: 2025-10-20 - Refinement fetch response typing untuk lint compliance

"use client";

export const runtime = "edge";

import { FileUp, Plus, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DeleteConfirmDialog } from "@/components/students/delete-confirm-dialog";
import { StudentDialog } from "@/components/students/student-dialog";
import { StudentTable } from "@/components/students/student-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { RippleButton } from "@/components/ui/ripple-button";
import { SkeletonTable } from "@/components/ui/skeleton";
import type { Student } from "@/drizzle/schema/students";
import { toast } from "@/lib/toast";

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Fetch students
  const fetchStudents = async (searchQuery = "") => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/students?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data: { students?: Student[] } = await response.json();
      setStudents(data.students ?? []);
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle search with debounce
  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchStudents is stable
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle add student
  const handleAdd = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  // Handle edit student
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  // Handle delete student
  const handleDelete = (student: Student) => {
    setDeletingStudent(student);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingStudent) return;

    try {
      const response = await fetch(`/api/students/${deletingStudent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      toast.success("Siswa berhasil dihapus");
      setDeletingStudent(null);
      fetchStudents(search);
    } catch (err) {
      console.error("Delete student error:", err);
      toast.error("Gagal menghapus siswa");
    }
  };

  // Handle dialog success (add/edit completed)
  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    fetchStudents(search);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Siswa</h1>
        <p className="text-muted-foreground">
          Kelola data siswa yang Anda dampingi
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari nama, NISN, atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <RippleButton
            variant="outline"
            onClick={() => router.push("/students/import")}
          >
            <FileUp className="h-4 w-4 mr-2" />
            Import CSV
          </RippleButton>
          <RippleButton onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Siswa
          </RippleButton>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState
          title="Gagal Memuat Data"
          message={error}
          onRetry={() => fetchStudents(search)}
        />
      ) : isLoading ? (
        <SkeletonTable rows={5} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={User}
          title={search ? "Tidak Ada Hasil" : "Belum Ada Siswa"}
          message={
            search
              ? "Tidak ditemukan siswa dengan pencarian tersebut"
              : "Tambahkan siswa pertama Anda untuk memulai"
          }
          actionLabel={!search ? "Tambah Siswa" : undefined}
          onAction={!search ? handleAdd : undefined}
        />
      ) : (
        <StudentTable
          students={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add/Edit Dialog */}
      <StudentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        student={editingStudent}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingStudent}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
        student={deletingStudent}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
