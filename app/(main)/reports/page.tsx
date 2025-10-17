// Reports Page - Archive System
// Created: 2025-01-14
// Updated: 2025-10-17 - Replaced mock data with real API data
// Shows archived semester reports and individual student reports from database

"use client";

import { Calendar, Download, FileText, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SemesterReport {
  id: string;
  title: string;
  semester: string;
  tahunAjaran: string;
  periodeStart: string;
  periodeEnd: string;
  totalStudents: number;
  totalJournals: number;
  totalMeetings: number;
  fileSize: number;
  createdAt: string;
}

interface IndividualReport {
  id: string;
  studentId: string;
  studentName: string;
  classroom: string;
  periode: string;
  fileSize: number;
  createdAt: string;
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [semesterReports, setSemesterReports] = useState<SemesterReport[]>([]);
  const [individualReports, setIndividualReports] = useState<IndividualReport[]>([]);

  // Download semester report
  const handleDownloadSemester = async (report: SemesterReport) => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/reports/semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semester: report.semester,
          tahunAjaran: report.tahunAjaran,
          periodeStart: report.periodeStart,
          periodeEnd: report.periodeEnd,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Semester_${report.semester}_${report.tahunAjaran.replace("/", "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh laporan");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download individual report
  const handleDownloadIndividual = async (report: IndividualReport) => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/reports/student/${report.studentId}`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Individual_${report.studentName.replace(/ /g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh laporan");
    } finally {
      setIsDownloading(false);
    }
  };

  // Fetch reports data from API
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/reports");
      
      if (response.ok) {
        const data = (await response.json()) as {
          semesterReports: SemesterReport[];
          individualReports: IndividualReport[];
        };
        setSemesterReports(data.semesterReports || []);
        setIndividualReports(data.individualReports || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
        <p className="text-muted-foreground">
          Kelola dan unduh laporan semester, individual, jurnal, dan pertemuan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {semesterReports.length + individualReports.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Laporan yang tersimpan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Laporan Semester
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{semesterReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Laporan periode semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Laporan Individual
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{individualReports.length}</div>
            <p className="text-xs text-muted-foreground">Laporan per siswa</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="semester" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="semester">Laporan Semester</TabsTrigger>
            <TabsTrigger value="individual">Laporan Individual</TabsTrigger>
            <TabsTrigger value="journals">Jurnal Bulanan</TabsTrigger>
            <TabsTrigger value="meetings">Log Pertemuan</TabsTrigger>
          </TabsList>

          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Buat Laporan Baru
          </Button>
        </div>

        {/* Semester Reports Tab */}
        <TabsContent value="semester" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Semester</CardTitle>
              <CardDescription>
                Laporan komprehensif untuk satu periode semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder="Cari laporan semester..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul Laporan</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ukuran File</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semesterReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="mb-2 h-8 w-8" />
                            <p>Belum ada laporan semester</p>
                            <p className="text-sm">
                              Buat laporan semester pertama Anda
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      semesterReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {report.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">
                                {report.tahunAjaran}
                              </span>
                              <Badge variant="secondary" className="w-fit">
                                {report.semester}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span>{report.totalStudents} siswa</span>
                              <span className="text-muted-foreground">
                                {report.totalJournals} jurnal •{" "}
                                {report.totalMeetings} pertemuan
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatFileSize(report.fileSize)}
                          </TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Unduh Laporan"
                                onClick={() => handleDownloadSemester(report)}
                                disabled={isDownloading}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Hapus Laporan"
                                disabled={isDownloading}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Reports Tab */}
        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Individual</CardTitle>
              <CardDescription>
                Laporan lengkap per siswa dengan semua data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder="Cari nama siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Ukuran File</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {individualReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="mb-2 h-8 w-8" />
                            <p>Belum ada laporan individual</p>
                            <p className="text-sm">
                              Unduh laporan dari halaman detail siswa
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      individualReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {report.studentName}
                          </TableCell>
                          <TableCell>
                            <Badge>{report.classroom}</Badge>
                          </TableCell>
                          <TableCell>{report.periode}</TableCell>
                          <TableCell>
                            {formatFileSize(report.fileSize)}
                          </TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Unduh Ulang"
                                onClick={() => handleDownloadIndividual(report)}
                                disabled={isDownloading}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Hapus Laporan"
                                disabled={isDownloading}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journals Tab */}
        <TabsContent value="journals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jurnal Bulanan</CardTitle>
              <CardDescription>
                Semua catatan jurnal bulanan siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="mb-4 h-12 w-12" />
                <p className="text-lg font-semibold mb-2">
                  Laporan Jurnal Bulanan
                </p>
                <p className="text-sm text-center max-w-md">
                  Fitur ekspor laporan jurnal bulanan akan segera hadir. Saat
                  ini Anda dapat mengakses semua jurnal di halaman{" "}
                  <a href="/journals" className="text-primary hover:underline">
                    Jurnal Bulanan
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Pertemuan</CardTitle>
              <CardDescription>
                Semua catatan log pertemuan dengan siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="mb-4 h-12 w-12" />
                <p className="text-lg font-semibold mb-2">
                  Laporan Log Pertemuan
                </p>
                <p className="text-sm text-center max-w-md">
                  Fitur ekspor laporan log pertemuan akan segera hadir. Saat ini
                  Anda dapat mengakses semua log pertemuan di halaman{" "}
                  <a href="/meetings" className="text-primary hover:underline">
                    Log Pertemuan
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
