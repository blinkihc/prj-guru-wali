// API Route: /api/reports/semester
// Generate semester report PDF with caching and streaming
// Updated: 2025-10-15 - Added R2 cache + streaming support + TypeScript types

import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SemesterReportDocument } from "@/components/reports/semester-report-template";
import { getSession } from "@/lib/auth/session";
import { getCloudflareEnv } from "@/lib/cloudflare";
import type { CacheKey } from "@/lib/services";
import { getServices } from "@/lib/services";

export const runtime = "edge";

interface StudentJournalEntry {
  studentName: string;
  classroom: string;
  periode: string;
  guruWali: string;
  academicDesc: string;
  academicAction: string;
  characterDesc: string;
  characterAction: string;
  socialEmotionalDesc: string;
  socialEmotionalAction: string;
  disciplineDesc: string;
  disciplineAction: string;
  potentialInterestDesc: string;
  potentialInterestAction: string;
}

interface MeetingSummaryEntry {
  bulan: string;
  jumlah: number;
  format: string;
  persentase: string;
}

// Mock data - empty for MVP v1.0.0
const mockStudents: Array<{ id: string; fullName: string; classroom: string }> =
  [];
const mockJournals: Array<{
  studentId: string;
  monitoringPeriod: string;
  academicDesc?: string;
  characterDesc?: string;
  socialEmotionalDesc?: string;
  disciplineDesc?: string;
  potentialInterestDesc?: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { semester, tahunAjaran, periodeStart, periodeEnd } = body;

    if (!semester || !tahunAjaran || !periodeStart || !periodeEnd) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const students = mockStudents;
    const allJournals = mockJournals;

    // Transform journals to per-student format for Lampiran B
    const studentJournals: StudentJournalEntry[] = students.map((student) => {
      // Get latest journal for this student
      const journal = allJournals.find((j) => j.studentId === student.id);

      return {
        studentName: student.fullName,
        classroom: student.classroom || "7A",
        periode: journal?.monitoringPeriod || "Semester Ganjil 2024/2025",
        guruWali: session.fullName || "Nama Guru",
        // 5 aspects with descriptions and actions
        academicDesc: journal?.academicDesc || "Perkembangan akademik baik",
        academicAction: "Konseling Dan Kunjungan Orang Tua",
        characterDesc: journal?.characterDesc || "Karakter positif",
        characterAction:
          "Menerapkan disiplin positif yang berfokus pada membangun karakter tanpa hukuman",
        socialEmotionalDesc:
          journal?.socialEmotionalDesc || "Berinteraksi dengan baik",
        socialEmotionalAction:
          "Membiasakan ucapan seperti 'tolong, permisi dan terima kasih' dan menghormati orang lain",
        disciplineDesc: journal?.disciplineDesc || "Disiplin baik",
        disciplineAction:
          "Mengucapkan salam saat bertemu, mendengarkan secara seksama saat guru berbicara, berprilaku tertib dan sopan dikelas",
        potentialInterestDesc:
          journal?.potentialInterestDesc || "Antusias dalam belajar",
        potentialInterestAction:
          "Melakukan pembelajaran yang interaktif dan bervariasi serta menciptakan lingkungan belajar yang positif dan mendukung",
      };
    });

    // Transform meetings to summary format for Lampiran D
    const meetingSummary: MeetingSummaryEntry[] = [
      { bulan: "Agustus", jumlah: 1, format: "Kelompok", persentase: "1%" },
      { bulan: "September", jumlah: 2, format: "Kelompok", persentase: "2%" },
    ];

    // Create PDF component
    const pdfDocument = SemesterReportDocument({
      semester: semester as "Ganjil" | "Genap",
      tahunAjaran,
      periodeStart,
      periodeEnd,
      guruWaliName: session.fullName || "Nama Guru",
      schoolName: "SMP Negeri 1",
      students,
      studentJournals,
      meetingSummary,
    });

    const filename = `Laporan_Semester_${semester}_${tahunAjaran.replace("/", "-")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Check if R2 is available
    const cfEnv = getCloudflareEnv();

    if (cfEnv?.STORAGE) {
      // Production: Use services with R2 caching
      const services = getServices(cfEnv);

      // Generate cache key with data hash
      const dataHash = services.cacheManager.generateDataHash({
        students: students.map((s) => s.id),
        journalsCount: studentJournals.length,
        meetingsCount: meetingSummary.length,
      });

      const cacheParams: CacheKey = {
        type: "semester",
        semester,
        tahunAjaran,
        dataHash,
      };

      // Generate report with caching
      const result = await services.reportService.generateReport(
        pdfDocument,
        cacheParams,
        {
          onProgress: (progress) => {
            console.log(
              `[PDF Generation] ${progress.stage}: ${progress.progress}% - ${progress.message}`,
            );
          },
        },
      );

      return new NextResponse(result.content as any, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Content-Length": result.sizeBytes.toString(),
          "X-From-Cache": result.fromCache ? "true" : "false",
          "X-Generation-Time": result.metadata.generationTimeMs
            ? `${result.metadata.generationTimeMs}ms`
            : "cached",
        },
      });
    } else {
      // Development: Direct generation without caching
      console.log("[PDF] Development mode - generating without cache");

      const pdfBuffer = await renderToBuffer(pdfDocument);

      return new NextResponse(pdfBuffer as any, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
          "Content-Length": pdfBuffer.length.toString(),
          "X-From-Cache": "false",
          "X-Generation-Time": "dev-mode",
        },
      });
    }
  } catch (error) {
    console.error("POST /api/reports/semester error:", error);
    return NextResponse.json(
      { error: "Failed to generate semester report" },
      { status: 500 },
    );
  }
}
