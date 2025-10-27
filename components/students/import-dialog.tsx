// ImportDialog component - Import students from CSV
// Created: 2025-10-14
// Multi-step wizard: Upload → Preview → Confirm → Import

"use client";

import { Download, Upload } from "lucide-react";
import Papa from "papaparse";
import { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  parseCsvRows,
  STUDENT_IMPORT_HEADERS,
} from "@/lib/services/students/import-parser";
import { toast } from "@/lib/toast";
import type { StudentImportRow } from "@/types/student-import";
import { ImportPreviewTable } from "./import-preview-table";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type ImportStep = "upload" | "preview" | "importing";

export function ImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportDialogProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [parsedData, setParsedData] = useState<StudentImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep("upload");
      setParsedData([]);
      setIsProcessing(false);
    }
    onOpenChange(newOpen);
  };

  // Download template
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/students-import-template.csv";
    link.download = "template-import-siswa.csv";
    link.click();
    toast.success("Template berhasil diunduh");
  };

  // Handle file upload
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.endsWith(".csv")) {
        toast.error("File harus berformat CSV");
        return;
      }

      setIsProcessing(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rows = parseCsvRows(
              results.data as Record<string, unknown>[],
            );
            setParsedData(rows);
            setStep("preview");
            toast.success(`${rows.length} data berhasil dibaca`);
          } catch (error) {
            console.error("Parse error:", error);
            toast.error("Gagal membaca file CSV");
          } finally {
            setIsProcessing(false);
          }
        },
        error: (error) => {
          console.error("Parse error:", error);
          toast.error("Gagal membaca file CSV");
          setIsProcessing(false);
        },
      });

      // Reset input
      event.target.value = "";
    },
    [],
  );

  // Handle import
  const handleImport = async () => {
    // Filter out rows with errors
    const validData = parsedData.filter((row) => !hasRowErrors(row));

    if (validData.length === 0) {
      toast.error("Tidak ada data valid untuk diimpor");
      return;
    }

    setIsProcessing(true);
    setStep("importing");

    try {
      // Prepare data (remove helper fields)
      const studentsToImport = validData.map(
        ({ _rowIndex, _errors, ...student }) => student,
      );

      // Call import API
      const response = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: studentsToImport }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || "Import gagal");
      }

      const result = (await response.json()) as { imported?: number };
      toast.success(
        `Berhasil mengimpor ${result.imported} dari ${validData.length} siswa`,
      );

      handleOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengimpor data",
      );
      setStep("preview");
    } finally {
      setIsProcessing(false);
    }
  };

  // Update row data (for inline edit)
  const handleUpdateRow = useCallback(
    (rowId: string, patch: Partial<StudentImportRow>) => {
      setParsedData((prev) =>
        prev.map((row) => {
          if (row._rowId !== rowId) {
            return row;
          }

          const next: StudentImportRow = {
            ...row,
            ...patch,
          };

          const errors: Record<string, string> = {};

          if (!next.fullName) {
            errors.fullName = "Nama lengkap wajib diisi";
          }

          if (next.gender && !["L", "P"].includes(next.gender)) {
            errors.gender = "Jenis kelamin harus 'L' atau 'P'";
          }

          if (next.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(next.birthDate)) {
            errors.birthDate = "Format tanggal tidak valid (YYYY-MM-DD)";
          }

          next._errors = errors;
          next._isValid = Object.keys(errors).length === 0;

          return next;
        }),
      );
    },
    [],
  );

  // Remove row
  const _handleRemoveRow = (index: number) => {
    setParsedData((prev) => prev.filter((_, i) => i !== index));
  };

  const hasRowErrors = useCallback(
    (row: StudentImportRow) => Object.keys(row._errors).length > 0,
    [],
  );

  const validCount = useMemo(
    () => parsedData.filter((row) => !hasRowErrors(row)).length,
    [parsedData, hasRowErrors],
  );
  const errorCount = parsedData.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data Siswa</DialogTitle>
          <DialogDescription>
            Upload file CSV untuk mengimpor data siswa secara massal
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-6 py-4">
            {/* Download Template */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">1. Download Template CSV</h4>
              <p className="text-sm text-muted-foreground">
                Gunakan template ini sebagai panduan format data yang benar.
                Pastikan seluruh {STUDENT_IMPORT_HEADERS.length} kolom terisi
                sesuai kebutuhan.
              </p>
              <RippleButton
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </RippleButton>
            </div>

            {/* Upload File */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">2. Upload File CSV</h4>
              <p className="text-sm text-muted-foreground">
                Pastikan file CSV mengikuti format template di atas
              </p>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Klik untuk memilih file CSV</p>
                    <p className="text-sm text-muted-foreground">
                      atau drag & drop file ke sini
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Format Info */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Format CSV yang diharapkan:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>Nama Lengkap</strong> - Wajib diisi
                </li>
                <li>
                  <strong>NISN</strong> - Opsional
                </li>
                <li>
                  <strong>Kelas</strong> - Opsional (contoh: 7A, 8B)
                </li>
                <li>
                  <strong>Jenis Kelamin</strong> - Opsional (L atau P)
                </li>
                <li>
                  <strong>Nama Orang Tua</strong> - Opsional
                </li>
                <li>
                  <strong>Kontak Orang Tua</strong> - Opsional
                </li>
                <li>
                  <strong>Catatan Khusus</strong> - Opsional
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && (
          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="flex items-center gap-4 text-sm">
              <div className="px-3 py-1 rounded-full bg-success/10 text-success-foreground">
                ✓ {validCount} Valid
              </div>
              {errorCount > 0 && (
                <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive-foreground">
                  ✗ {errorCount} Error
                </div>
              )}
            </div>

            {/* Preview Table */}
            <ImportPreviewTable
              data={parsedData}
              onUpdateRow={handleUpdateRow}
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <RippleButton
                variant="outline"
                onClick={() => setStep("upload")}
                disabled={isProcessing}
              >
                Kembali
              </RippleButton>
              <RippleButton
                onClick={handleImport}
                disabled={isProcessing || validCount === 0}
              >
                {isProcessing ? "Mengimpor..." : `Import ${validCount} Siswa`}
              </RippleButton>
            </div>
          </div>
        )}

        {/* Step 3: Importing (Loading State) */}
        {step === "importing" && (
          <div className="py-12 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">
              Sedang mengimpor {validCount} siswa...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
