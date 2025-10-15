// StudentTable component - Display students in table format
// Created: 2025-10-14
// Updated: 2025-01-14 - Added click to view student detail

"use client";

import { Edit, Eye, MoreVertical, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student } from "@/drizzle/schema/students";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentTable({
  students,
  onEdit,
  onDelete,
}: StudentTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Lengkap</TableHead>
            <TableHead>NISN</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Jenis Kelamin</TableHead>
            <TableHead>Nama Orang Tua</TableHead>
            <TableHead>Kontak Ortu</TableHead>
            <TableHead className="w-[80px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow
              key={student.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/students/${student.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{student.fullName}</div>
                    {student.specialNotes && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {student.specialNotes}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">{student.nisn || "-"}</span>
              </TableCell>
              <TableCell>{student.classroom || "-"}</TableCell>
              <TableCell>
                {student.gender === "L"
                  ? "Laki-laki"
                  : student.gender === "P"
                    ? "Perempuan"
                    : "-"}
              </TableCell>
              <TableCell>
                <span className="text-sm">{student.parentName || "-"}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{student.parentContact || "-"}</span>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <RippleButton variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Menu aksi</span>
                    </RippleButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/students/${student.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(student)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(student)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
