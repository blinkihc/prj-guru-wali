"use client";

// Reset Data Page - UI for clearing all student data
// Created: 2025-11-06 - For development and testing purposes
// WARNING: This will permanently delete data!

import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const runtime = "edge";

interface DataCounts {
  students: number;
  monthly_journals: number;
  meeting_logs: number;
  interventions: number;
  student_social_usages: number;
}

export default function ResetDataPage() {
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch current data counts
  const fetchCounts = useCallback(async () => {
    try {
      const response = await fetch("/api/settings/reset");
      if (!response.ok) throw new Error("Failed to fetch counts");

      const data = (await response.json()) as { counts: DataCounts };
      setCounts(data.counts);
    } catch (error) {
      console.error("Error fetching counts:", error);
      toast.error("Gagal mengambil data");
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Handle reset data
  const handleReset = async () => {
    if (confirmText !== "RESET_ALL_DATA") {
      toast.error("Konfirmasi tidak valid");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/settings/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset data");
      }

      toast.success("Data berhasil dihapus!");
      setConfirmText("");
      setShowConfirm(false);

      // Refresh counts
      await fetchCounts();
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus data",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalRecords = counts
    ? Object.values(counts).reduce(
        (sum, count) => sum + (count > 0 ? count : 0),
        0,
      )
    : 0;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reset Data</h1>
        <p className="text-gray-600">
          Hapus semua data siswa, jurnal, pertemuan, dan laporan dari database.
        </p>
      </div>

      {/* Warning Card */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              ⚠️ Peringatan Penting!
            </h2>
            <ul className="text-red-800 space-y-1 text-sm">
              <li>
                • Data yang dihapus <strong>TIDAK DAPAT DIKEMBALIKAN</strong>
              </li>
              <li>• Semua data siswa akan hilang permanen</li>
              <li>
                • Jurnal bulanan, log pertemuan, dan laporan akan terhapus
              </li>
              <li>• Fitur ini hanya untuk development dan testing</li>
              <li>
                • <strong>JANGAN gunakan di production!</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Data Stats */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Data Saat Ini</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchCounts}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {counts ? (
          <div className="space-y-3">
            <DataRow label="Siswa" count={counts.students} />
            <DataRow label="Jurnal Bulanan" count={counts.monthly_journals} />
            <DataRow label="Log Pertemuan" count={counts.meeting_logs} />
            <DataRow label="Laporan Intervensi" count={counts.interventions} />
            <DataRow
              label="Social Media Usage"
              count={counts.student_social_usages}
            />

            <div className="pt-3 border-t">
              <DataRow label="Total Records" count={totalRecords} bold />
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Loading data...</div>
        )}
      </div>

      {/* Reset Action */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Hapus Semua Data</h2>

        {!showConfirm ? (
          <Button
            variant="destructive"
            size="lg"
            onClick={() => setShowConfirm(true)}
            disabled={totalRecords === 0}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Hapus Semua Data
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="confirm-input"
                className="block text-sm font-medium mb-2"
              >
                Ketik{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  RESET_ALL_DATA
                </code>{" "}
                untuk konfirmasi:
              </label>
              <input
                id="confirm-input"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESET_ALL_DATA"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="destructive"
                size="lg"
                onClick={handleReset}
                disabled={loading || confirmText !== "RESET_ALL_DATA"}
                className="flex items-center gap-2"
              >
                {!loading && <Trash2 className="w-5 h-5" />}
                {loading ? "Menghapus..." : "Konfirmasi Hapus"}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText("");
                }}
                disabled={loading}
              >
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 text-sm text-gray-600">
        <p>
          <strong>Catatan:</strong> Data profil sekolah dan pengaturan tidak
          akan terhapus. Hanya data siswa dan aktivitas terkait yang akan
          dihapus.
        </p>
      </div>
    </div>
  );
}

// Helper component for data rows
function DataRow({
  label,
  count,
  bold = false,
}: {
  label: string;
  count: number;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={bold ? "font-semibold" : ""}>{label}</span>
      <span
        className={`${bold ? "font-bold text-lg" : ""} ${
          count > 0 ? "text-blue-600" : "text-gray-400"
        }`}
      >
        {count.toLocaleString()} records
      </span>
    </div>
  );
}
