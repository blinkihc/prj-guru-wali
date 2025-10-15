// ImportPreviewTable component - Preview and edit imported data
// Created: 2025-10-14
// Updated: 2025-01-14 - Refactored for StudentImportRow interface

"use client";

import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudentImportRow } from "@/types/student-import";

interface ImportPreviewTableProps {
  data: StudentImportRow[];
  onUpdateRow: (rowIndex: number, field: string, value: string | null) => void;
}

export function ImportPreviewTable({
  data,
  onUpdateRow,
}: ImportPreviewTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-[400px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted z-10">
            <TableRow>
              <TableHead className="w-[50px]">Baris</TableHead>
              <TableHead className="min-w-[180px]">Nama Lengkap</TableHead>
              <TableHead className="min-w-[120px]">NISN</TableHead>
              <TableHead className="min-w-[100px]">Kelas</TableHead>
              <TableHead className="min-w-[120px]">Jenis Kelamin</TableHead>
              <TableHead className="min-w-[150px]">Nama Orang Tua</TableHead>
              <TableHead className="min-w-[140px]">Kontak Ortu</TableHead>
              <TableHead className="min-w-[180px]">Catatan Khusus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const hasErrors = Object.keys(row._errors).length > 0;

              return (
                <TableRow
                  key={row._rowId}
                  className={hasErrors ? "bg-destructive/5" : ""}
                >
                  {/* Row Number */}
                  <TableCell className="text-xs text-muted-foreground">
                    {row._rowId}
                  </TableCell>

                  {/* Full Name (Editable) */}
                  <TableCell>
                    <div className="space-y-1">
                      <Input
                        value={row.fullName}
                        onChange={(e) =>
                          onUpdateRow(index, "fullName", e.target.value)
                        }
                        className={`h-8 ${hasErrors && !row.fullName ? "border-destructive" : ""}`}
                        placeholder="Nama lengkap..."
                      />
                      {hasErrors && !row.fullName && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Wajib diisi
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* NISN (Editable) */}
                  <TableCell>
                    <Input
                      value={row.nisn || ""}
                      onChange={(e) =>
                        onUpdateRow(index, "nisn", e.target.value || null)
                      }
                      className="h-8 font-mono text-sm"
                      placeholder="NISN..."
                    />
                  </TableCell>

                  {/* Classroom (Editable) */}
                  <TableCell>
                    <Input
                      value={row.classroom || ""}
                      onChange={(e) =>
                        onUpdateRow(index, "classroom", e.target.value || null)
                      }
                      className="h-8"
                      placeholder="7A"
                    />
                  </TableCell>

                  {/* Gender (Editable Select) */}
                  <TableCell>
                    <Select
                      value={row.gender || undefined}
                      onValueChange={(value) =>
                        onUpdateRow(
                          index,
                          "gender",
                          value === "EMPTY" ? null : value,
                        )
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPTY">-</SelectItem>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasErrors &&
                      row.gender &&
                      !["L", "P"].includes(row.gender) && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />L atau P
                        </p>
                      )}
                  </TableCell>

                  {/* Parent Name (Editable) */}
                  <TableCell>
                    <Input
                      value={row.parentName || ""}
                      onChange={(e) =>
                        onUpdateRow(index, "parentName", e.target.value || null)
                      }
                      className="h-8"
                      placeholder="Nama orang tua..."
                    />
                  </TableCell>

                  {/* Parent Contact (Editable) */}
                  <TableCell>
                    <PhoneInput
                      value={row.parentContact || ""}
                      onChange={(value) =>
                        onUpdateRow(index, "parentContact", value || null)
                      }
                      showValidation={false}
                    />
                  </TableCell>

                  {/* Special Notes (Editable) */}
                  <TableCell>
                    <Input
                      value={row.specialNotes || ""}
                      onChange={(e) =>
                        onUpdateRow(
                          index,
                          "specialNotes",
                          e.target.value || null,
                        )
                      }
                      className="h-8"
                      placeholder="Catatan..."
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {data.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          Tidak ada data
        </div>
      )}
    </div>
  );
}
