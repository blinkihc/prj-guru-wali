// ImportPreviewTable component - Preview and edit imported data
// Created: 2025-10-14
// Last updated: 2025-10-22 - Tabbed detail view untuk 32 field biodata + social usages

"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { StudentImportRow } from "@/types/student-import";

interface ImportPreviewTableProps {
  data: StudentImportRow[];
  onUpdateRow: (rowId: string, patch: Partial<StudentImportRow>) => void;
}

export function ImportPreviewTable({
  data,
  onUpdateRow,
}: ImportPreviewTableProps) {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(
    data[0]?._rowId ?? null,
  );

  useEffect(() => {
    if (!selectedRowId && data.length > 0) {
      setSelectedRowId(data[0]._rowId);
    }
  }, [data, selectedRowId]);

  useEffect(() => {
    if (selectedRowId && !data.some((row) => row._rowId === selectedRowId)) {
      setSelectedRowId(data[0]?._rowId ?? null);
    }
  }, [data, selectedRowId]);

  const selectedRow = useMemo(
    () => data.find((row) => row._rowId === selectedRowId) ?? null,
    [data, selectedRowId],
  );

  const errorCountForRow = (row: StudentImportRow) =>
    Object.keys(row._errors).length;

  const handleFieldChange = (
    rowId: string,
    patch: Partial<StudentImportRow>,
  ) => {
    onUpdateRow(rowId, patch);
  };

  if (!selectedRow) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted-foreground">
        Tidak ada data untuk ditampilkan
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Daftar Baris CSV
        </p>
        <div className="space-y-2">
          {data.map((row) => {
            const isActive = row._rowId === selectedRowId;
            const hasErrors = errorCountForRow(row) > 0;
            return (
              <button
                key={row._rowId}
                type="button"
                onClick={() => setSelectedRowId(row._rowId)}
                className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${isActive ? "border-primary bg-primary/10" : "hover:border-primary/50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Baris {row._rowNumber}
                  </span>
                  <span
                    className={`text-xs font-medium ${hasErrors ? "text-destructive" : "text-success-foreground"}`}
                  >
                    {hasErrors ? `Error (${errorCountForRow(row)})` : "Valid"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {row.fullName || "(Nama belum diisi)"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(selectedRow._errors).length > 0 && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Perlu diperbaiki:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(selectedRow._errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
        )}

        <Tabs defaultValue="data-diri" className="space-y-4">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="data-diri">Data Diri</TabsTrigger>
            <TabsTrigger value="orang-tua">Orang Tua</TabsTrigger>
            <TabsTrigger value="kesehatan">Kesehatan</TabsTrigger>
            <TabsTrigger value="karakter">Karakter</TabsTrigger>
          </TabsList>

          <TabsContent value="data-diri">
            <DataDiriTab
              row={selectedRow}
              onChange={(patch) => handleFieldChange(selectedRow._rowId, patch)}
            />
          </TabsContent>

          <TabsContent value="orang-tua">
            <OrangTuaTab
              row={selectedRow}
              onChange={(patch) => handleFieldChange(selectedRow._rowId, patch)}
            />
          </TabsContent>

          <TabsContent value="kesehatan">
            <KesehatanTab
              row={selectedRow}
              onChange={(patch) => handleFieldChange(selectedRow._rowId, patch)}
            />
          </TabsContent>

          <TabsContent value="karakter">
            <KarakterTab
              row={selectedRow}
              onChange={(patch) => handleFieldChange(selectedRow._rowId, patch)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface TabProps {
  row: StudentImportRow;
  onChange: (patch: Partial<StudentImportRow>) => void;
}

function DataDiriTab({ row, onChange }: TabProps) {
  const genderId = useId();
  const phoneId = useId();
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nama Lengkap"
          value={row.fullName}
          onChange={(value) => onChange({ fullName: value })}
          required
        />
        <TextField
          label="NIS"
          value={row.nis ?? ""}
          onChange={(value) => onChange({ nis: value || null })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="NISN"
          value={row.nisn ?? ""}
          onChange={(value) => onChange({ nisn: value || null })}
        />
        <TextField
          label="Kelas"
          value={row.classroom ?? ""}
          onChange={(value) => onChange({ classroom: value || null })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={genderId}>Jenis Kelamin</Label>
          <Select
            value={row.gender ?? "NONE"}
            onValueChange={(value) =>
              onChange({
                gender: value === "NONE" ? null : (value as "L" | "P"),
              })
            }
          >
            <SelectTrigger id={genderId}>
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">-</SelectItem>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TextField
          label="Tempat Lahir"
          value={row.birthPlace ?? ""}
          onChange={(value) => onChange({ birthPlace: value || null })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Tanggal Lahir"
          value={row.birthDate ?? ""}
          onChange={(value) => onChange({ birthDate: value || null })}
          placeholder="YYYY-MM-DD"
        />
        <TextField
          label="Agama"
          value={row.religion ?? ""}
          onChange={(value) => onChange({ religion: value || null })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Golongan Darah"
          value={row.bloodType ?? ""}
          onChange={(value) => onChange({ bloodType: value || null })}
        />
        <TextField
          label="Status Ekonomi"
          value={row.economicStatus ?? ""}
          onChange={(value) => onChange({ economicStatus: value || null })}
        />
      </div>
      <TextField
        label="Alamat Lengkap"
        value={row.address ?? ""}
        onChange={(value) => onChange({ address: value || null })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={phoneId}>Nomor Telepon Siswa</Label>
          <PhoneInput
            id={phoneId}
            value={row.phoneNumber ?? ""}
            onChange={(value) => onChange({ phoneNumber: value || null })}
            showValidation={false}
          />
        </div>
        <TextField
          label="URL Foto"
          value={row.photoUrl ?? ""}
          onChange={(value) => onChange({ photoUrl: value || null })}
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Cita-cita"
          value={row.dream ?? ""}
          onChange={(value) => onChange({ dream: value || null })}
        />
        <TextField
          label="Ekstrakurikuler"
          value={row.extracurricular ?? ""}
          onChange={(value) => onChange({ extracurricular: value || null })}
        />
        <TextField
          label="Hobi"
          value={row.hobby ?? ""}
          onChange={(value) => onChange({ hobby: value || null })}
        />
      </div>
    </div>
  );
}

function OrangTuaTab({ row, onChange }: TabProps) {
  const parentContactId = useId();
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nama Orang Tua/Wali"
          value={row.parentName ?? ""}
          onChange={(value) => onChange({ parentName: value || null })}
        />
        <div className="space-y-2">
          <Label htmlFor={parentContactId}>Kontak Orang Tua</Label>
          <PhoneInput
            id={parentContactId}
            value={row.parentContact ?? ""}
            onChange={(value) => onChange({ parentContact: value || null })}
            showValidation={false}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nama Ayah"
          value={row.fatherName ?? ""}
          onChange={(value) => onChange({ fatherName: value || null })}
        />
        <TextField
          label="Pekerjaan Ayah"
          value={row.fatherJob ?? ""}
          onChange={(value) => onChange({ fatherJob: value || null })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Penghasilan Ayah"
          value={row.fatherIncome?.toString() ?? ""}
          onChange={(value) =>
            onChange({
              fatherIncome: value ? Number.parseInt(value, 10) || null : null,
            })
          }
          placeholder="cth. 3000000"
        />
        <TextField
          label="Penghasilan Ibu"
          value={row.motherIncome?.toString() ?? ""}
          onChange={(value) =>
            onChange({
              motherIncome: value ? Number.parseInt(value, 10) || null : null,
            })
          }
          placeholder="cth. 2500000"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nama Ibu"
          value={row.motherName ?? ""}
          onChange={(value) => onChange({ motherName: value || null })}
        />
        <TextField
          label="Pekerjaan Ibu"
          value={row.motherJob ?? ""}
          onChange={(value) => onChange({ motherJob: value || null })}
        />
      </div>
    </div>
  );
}

function KesehatanTab({ row, onChange }: TabProps) {
  return (
    <div className="grid gap-4">
      <TextareaField
        label="Riwayat Penyakit (Dulu)"
        value={row.healthHistoryPast ?? ""}
        onChange={(value) => onChange({ healthHistoryPast: value || null })}
      />
      <TextareaField
        label="Kondisi Kesehatan Saat Ini"
        value={row.healthHistoryCurrent ?? ""}
        onChange={(value) => onChange({ healthHistoryCurrent: value || null })}
      />
      <TextareaField
        label="Keluhan yang Sering Dialami"
        value={row.healthHistoryOften ?? ""}
        onChange={(value) => onChange({ healthHistoryOften: value || null })}
      />
    </div>
  );
}

function KarakterTab({ row, onChange }: TabProps) {
  return (
    <div className="grid gap-4">
      <TextareaField
        label="Kekuatan Karakter"
        value={row.characterStrength ?? ""}
        onChange={(value) => onChange({ characterStrength: value || null })}
      />
      <TextareaField
        label="Perlu Peningkatan Karakter"
        value={row.characterImprovement ?? ""}
        onChange={(value) => onChange({ characterImprovement: value || null })}
      />
      <TextareaField
        label="Catatan Khusus"
        value={row.specialNotes ?? ""}
        onChange={(value) => onChange({ specialNotes: value || null })}
      />
    </div>
  );
}

interface TextFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: TextFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  return (
    <div className="space-y-2">
      <Label htmlFor={controlId} className="text-sm font-medium">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input
        id={controlId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

interface TextareaFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TextareaField({ id, label, value, onChange }: TextareaFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  return (
    <div className="space-y-2">
      <Label htmlFor={controlId} className="text-sm font-medium">
        {label}
      </Label>
      <Textarea
        id={controlId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
      />
    </div>
  );
}
