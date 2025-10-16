// API Route: /api/reports/semester
// Generate semester report PDF with caching and streaming
// Updated: 2025-10-15 - Added R2 cache + streaming support + TypeScript types

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateSemesterReportPDF } from "@/lib/services/pdf-generator-edge";

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

    const body = (await request.json()) as any;
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

    // Generate PDF using jsPDF (edge-compatible)
    const pdfBytes = generateSemesterReportPDF(
      students.map(s => ({
        id: s.id,
        name: s.fullName,
        nisn: "", // Not available in mock
        class: s.classroom || "7A",
        gender: "", // Not available in mock
      })),
      session.fullName || "Nama Guru",
      "SMP Negeri 1",
      semester,
      tahunAjaran
    );

    const filename = `Laporan_Semester_${semester}_${tahunAjaran.replace("/", "-")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF directly (R2 caching removed for MVP simplicity)
    return new NextResponse(pdfBytes.buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("POST /api/reports/semester error:", error);
    return NextResponse.json(
      { error: "Failed to generate semester report" },
      { status: 500 },
    );
  }
}
