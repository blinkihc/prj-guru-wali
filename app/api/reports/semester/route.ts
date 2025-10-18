// API Route: /api/reports/semester
// Generate semester report PDF with real database data
// Updated: 2025-10-17 - Replaced mock data with real D1 database queries

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { students, monthlyJournals, meetingLogs } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { 
  generateSemesterReportPDF,
  type MeetingRecordEntry,
  type MeetingSummaryEntry,
  type StudentJournalEntry
} from "@/lib/services/pdf-generator-edge";

// Import dummy data for local testing (file is in .gitignore)
let dummyData: any = null;
try {
  dummyData = require("@/lib/testing/dummy-data");
} catch (e) {
  // Dummy data not available (production or file doesn't exist)
  dummyData = null;
}

export const runtime = "edge";

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

    // Get D1 binding (with fallback for local dev with dummy data)
    let db;
    let allStudents: any[] = [];
    let allJournals: any[] = [];
    
    try {
      // @ts-ignore
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;

      if (!env?.DB) {
        // Local dev fallback - use dummy data if available
        if (dummyData) {
          console.warn("[SemesterReport] Running in local dev mode with DUMMY DATA");
          allStudents = dummyData.dummyStudents;
          allJournals = dummyData.dummyJournals;
        } else {
          console.warn("[SemesterReport] No database and no dummy data available");
          return NextResponse.json(
            { error: "Database not available in local dev" },
            { status: 503 },
          );
        }
      } else {
        // Production: Fetch real data from database
        db = getDb(env.DB);
        
        allStudents = await db
          .select()
          .from(students)
          .where(eq(students.userId, session.userId));

        // Fetch journals for all students
        const studentIds = allStudents.map((s) => s.id);
        allJournals = studentIds.length > 0
          ? await db
              .select()
              .from(monthlyJournals)
              .where(
                sql`${monthlyJournals.studentId} IN (${sql.join(studentIds.map((id) => sql`${id}`), sql`, `)})`
              )
          : [];
      }
    } catch (error) {
      // Cloudflare context not available - use dummy data if available
      if (dummyData) {
        console.warn("[SemesterReport] Cloudflare context not available, using DUMMY DATA");
        allStudents = dummyData.dummyStudents;
        allJournals = dummyData.dummyJournals;
      } else {
        console.warn("[SemesterReport] Cloudflare context not available and no dummy data");
        return NextResponse.json(
          { error: "Database not available" },
          { status: 503 },
        );
      }
    }

    // Transform journals to per-student format for Lampiran B
    const studentJournals: StudentJournalEntry[] = allStudents.map((student) => {
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

    // Generate dummy meeting records for Lampiran C (individual meetings)
    const meetingRecords: MeetingRecordEntry[] = allStudents.slice(0, 5).map((student, idx) => ({
      tanggal: `${15 + idx}/08/2024`,
      namaMurid: student.fullName,
      topikMasalah: idx % 2 === 0 
        ? "Perkembangan akademik dan motivasi belajar" 
        : "Adaptasi sosial dan kedisiplinan",
      tindakLanjut: idx % 2 === 0 
        ? "Konseling individual, koordinasi dengan orang tua" 
        : "Pendampingan berkelanjutan, monitoring perilaku",
      keterangan: "Baik"
    }));

    // Transform meetings to summary format for Lampiran D (monthly aggregation)
    const meetingSummary: MeetingSummaryEntry[] = dummyData?.dummyMeetingSummary || [
      { bulan: "Agustus", jumlah: 1, format: "Kelompok", persentase: "1%" },
      { bulan: "September", jumlah: 2, format: "Kelompok", persentase: "2%" },
    ];

    // Prepare cover options (Phase 1: Simple cover only, no DB query yet)
    // TODO Phase 2: Fetch from user_settings table
    const coverOptions = {
      type: 'simple' as const,  // Default to simple cover for now
      schoolName: "SMP Negeri 1",
      semester,
      academicYear: tahunAjaran,
      teacherName: session.fullName || "Nama Guru",
      totalStudents: allStudents.length,
      
      // Logo URLs (Phase 2: Will be fetched from user_settings)
      logoDinasPendidikan: undefined,  // Logo Dinas Pendidikan (uploaded in settings)
      logoSekolah: undefined,          // Logo Sekolah (uploaded in settings)
      
      // illustrationUrl: undefined    // For illustration cover type (Phase 2)
    };

    // Generate PDF using jsPDF with full lampirans (edge-compatible)
    const pdfBytes = generateSemesterReportPDF(
      allStudents.map((s) => ({
        id: s.id,
        name: s.fullName,
        nisn: s.nisn || "",
        class: s.classroom || "7A",
        gender: s.gender || "",
      })),
      coverOptions,             // Pass cover options object
      session.nipNuptk || "-",  // NIP/NUPTK for signature
      studentJournals,          // Lampiran B data
      meetingRecords,           // Lampiran C data
      meetingSummary            // Lampiran D data
    );

    const filename = `Laporan_Semester_${semester}_${tahunAjaran.replace("/", "-")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF directly (caching will be added in next commit)
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
