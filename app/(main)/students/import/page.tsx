// Student Import Page - CSV/Excel file upload and bulk import
// Created: 2025-01-14

"use client";

import { Download, FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useState } from "react";
import { ImportPreviewTable } from "@/components/students/import-preview-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RippleButton } from "@/components/ui/ripple-button";
import { toast } from "@/lib/toast";
import type { StudentImportRow } from "@/types/student-import";

export default function StudentImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<StudentImportRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Hanya file CSV yang didukung");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5 MB");
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  // Parse CSV file
  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as StudentImportRow[];

        // Validate max rows
        if (rows.length > 1000) {
          toast.error("Maksimal 1000 baris per import");
          return;
        }

        if (rows.length === 0) {
          toast.error("File CSV kosong");
          return;
        }

        // Add row ID and validation status
        const processedRows = rows.map((row, index) => ({
          ...row,
          _rowId: index + 1,
          _isValid: true,
          _errors: {},
        }));

        setParsedData(processedRows);
        toast.success(`Berhasil memuat ${rows.length} baris data`);
      },
      error: (error) => {
        console.error("CSV parse error:", error);
        toast.error("Gagal membaca file CSV");
      },
    });
  };

  // Handle drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error("Tidak ada data untuk diimport");
      return;
    }

    // Check for validation errors
    const invalidRows = parsedData.filter((row) => !row._isValid);
    if (invalidRows.length > 0) {
      toast.error(
        `${invalidRows.length} baris memiliki error. Perbaiki terlebih dahulu.`,
      );
      return;
    }

    setIsImporting(true);

    try {
      // Prepare data for import (remove validation fields)
      const dataToImport = parsedData.map(
        ({ _rowId, _isValid, _errors, ...rest }) => rest,
      );

      const response = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: dataToImport }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengimport data");
      }

      const result = await response.json();
      toast.success(`Berhasil mengimport ${result.imported} siswa!`);

      // Redirect to students page
      router.push("/students");
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengimport data",
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Update row data
  const handleUpdateRow = (
    rowIndex: number,
    field: string,
    value: string | null,
  ) => {
    setParsedData((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: value,
      };
      return updated;
    });
  };

  // Download template
  const handleDownloadTemplate = () => {
    window.open("/templates/student-import-template.csv", "_blank");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Data Siswa</h1>
          <p className="text-muted-foreground mt-1">
            Upload file CSV untuk mengimport data siswa secara bulk
          </p>
        </div>
        <RippleButton
          variant="outline"
          onClick={() => router.push("/students")}
        >
          Kembali
        </RippleButton>
      </div>

      {/* Instructions */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Cara Import:</strong> Download template CSV, isi data siswa,
          lalu upload kembali. Maksimal 1000 baris per file.
        </AlertDescription>
      </Alert>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>1. Upload File CSV</CardTitle>
          <CardDescription>
            Format: CSV (UTF-8). Maksimal 5 MB, 1000 baris.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Template Button */}
          <RippleButton
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template CSV
          </RippleButton>

          {/* Drag & Drop Zone */}
          {/* biome-ignore lint/a11y/useSemanticElements: Drag & drop requires div element */}
          <div
            role="button"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                document.getElementById("file-upload")?.click();
              }
            }}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">
              Drag & drop file CSV di sini, atau klik untuk memilih
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Format: .csv (UTF-8) • Max: 5 MB, 1000 rows
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <RippleButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-upload")?.click();
              }}
            >
              Pilih File
            </RippleButton>
            {file && (
              <p className="text-sm text-green-600 mt-4">
                ✓ File terpilih: <strong>{file.name}</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Preview & Validasi Data</CardTitle>
            <CardDescription>
              Total: {parsedData.length} baris. Edit data jika diperlukan
              sebelum import.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportPreviewTable
              data={parsedData}
              onUpdateRow={handleUpdateRow}
            />
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Konfirmasi Import</CardTitle>
            <CardDescription>
              Pastikan semua data sudah benar sebelum import.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <RippleButton
              onClick={handleImport}
              disabled={isImporting}
              className="w-full sm:w-auto"
            >
              {isImporting
                ? "Mengimport..."
                : `Import ${parsedData.length} Siswa`}
            </RippleButton>
            <RippleButton
              variant="outline"
              onClick={() => {
                setParsedData([]);
                setFile(null);
              }}
              disabled={isImporting}
            >
              Reset
            </RippleButton>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
