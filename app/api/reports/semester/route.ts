// API Route: /api/reports/semester
// Generate semester report PDF with real database data
// Last updated: 2025-10-19 - Added explicit typing and edge-safe dummy handling

import type { D1Database } from "@cloudflare/workers-types";
import { eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { monthlyJournals, students } from "@/drizzle/schema";
import { reportCoverIllustrations } from "@/drizzle/schema/report-cover-illustrations";
import { getSession } from "@/lib/auth/session";
import { type Database, getDb } from "@/lib/db/client";
import {
  generateSemesterReportPDF,
  type MeetingRecordEntry,
  type MeetingSummaryEntry,
  type StudentJournalEntry,
} from "@/lib/services/pdf-generator-edge";

type DummyStudent = typeof students.$inferSelect;
type DummyJournal = typeof monthlyJournals.$inferSelect;

interface DummyDataModule {
  dummyStudents: DummyStudent[];
  dummyJournals: DummyJournal[];
  dummyMeetingSummary: MeetingSummaryEntry[];
}

// Dummy data is not used in production - always null
const dummyData: DummyDataModule | null = null;

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<{
      semester: string;
      tahunAjaran: string;
      periodeStart: string;
      periodeEnd: string;
    }>;
    const { semester, tahunAjaran, periodeStart, periodeEnd } = body;

    if (!semester || !tahunAjaran || !periodeStart || !periodeEnd) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get D1 binding (with fallback for local dev with dummy data)
    let db: Database | undefined;
    let allStudents: DummyStudent[] = [];
    let allJournals: DummyJournal[] = [];

    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as { DB?: D1Database } | undefined;

      if (!env?.DB) {
        // Local dev fallback - use dummy data if available
        if (dummyData) {
          console.warn(
            "[SemesterReport] Running in local dev mode with DUMMY DATA",
          );
          allStudents = dummyData.dummyStudents;
          allJournals = dummyData.dummyJournals;
        } else {
          console.warn(
            "[SemesterReport] No database and no dummy data available",
          );
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
        allJournals =
          studentIds.length > 0
            ? await db
                .select()
                .from(monthlyJournals)
                .where(
                  sql`${monthlyJournals.studentId} IN (${sql.join(
                    studentIds.map((id) => sql`${id}`),
                    sql`, `,
                  )})`,
                )
            : [];
      }
    } catch (_error) {
      // Cloudflare context not available - use dummy data if available
      if (dummyData) {
        console.warn(
          "[SemesterReport] Cloudflare context not available, using DUMMY DATA",
        );
        allStudents = dummyData.dummyStudents;
        allJournals = dummyData.dummyJournals;
      } else {
        console.warn(
          "[SemesterReport] Cloudflare context not available and no dummy data",
        );
        return NextResponse.json(
          { error: "Database not available" },
          { status: 503 },
        );
      }
    }

    // Transform journals to per-student format for Lampiran B
    const studentJournals: StudentJournalEntry[] = allStudents.map(
      (student) => {
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
      },
    );

    // Generate dummy meeting records for Lampiran C (individual meetings)
    const meetingRecords: MeetingRecordEntry[] = allStudents
      .slice(0, 5)
      .map((student, idx) => ({
        tanggal: `${15 + idx}/08/2024`,
        namaMurid: student.fullName,
        topikMasalah:
          idx % 2 === 0
            ? "Perkembangan akademik dan motivasi belajar"
            : "Adaptasi sosial dan kedisiplinan",
        tindakLanjut:
          idx % 2 === 0
            ? "Konseling individual, koordinasi dengan orang tua"
            : "Pendampingan berkelanjutan, monitoring perilaku",
        keterangan: "Baik",
      }));

    // Transform meetings to summary format for Lampiran D (monthly aggregation)
    const meetingSummary: MeetingSummaryEntry[] =
      dummyData?.dummyMeetingSummary || [
        { bulan: "Agustus", jumlah: 1, format: "Kelompok", persentase: "1%" },
        { bulan: "September", jumlah: 2, format: "Kelompok", persentase: "2%" },
      ];

    // Fetch cover illustrations from database (Phase 2 Implementation)
    let selectedIllustration = null;
    if (db) {
      const coverIllustrations = await db
        .select()
        .from(reportCoverIllustrations)
        .orderBy(reportCoverIllustrations.createdAt)
        .limit(1); // Get the most recent illustration

      selectedIllustration = coverIllustrations[0] || null;
    }

    const coverOptions = {
      type: selectedIllustration
        ? ("illustration" as const)
        : ("simple" as const),
      schoolName: "SMP Negeri 1", // TODO: Fetch from user settings
      semester,
      academicYear: tahunAjaran,
      teacherName: session.fullName || "Nama Guru",
      totalStudents: allStudents.length,

      // Logo URLs (Phase 2: Will be fetched from user_settings)
      logoDinasPendidikan: undefined, // Logo Dinas Pendidikan (uploaded in settings)
      logoSekolah: undefined, // Logo Sekolah (uploaded in settings)

      // Illustration URL from database
      illustrationUrl: selectedIllustration?.url,
    };

    // Generate PDF using jsPDF with full lampirans (edge-compatible)
    const pdfBytes = await generateSemesterReportPDF(
      allStudents.map((s) => ({
        id: s.id,
        name: s.fullName,
        nisn: s.nisn || "",
        class: s.classroom || "7A",
        gender: s.gender || "",
      })),
      coverOptions, // Pass cover options object
      session.nipNuptk || "-", // NIP/NUPTK for signature
      studentJournals, // Lampiran B data
      meetingRecords, // Lampiran C data
      meetingSummary, // Lampiran D data
    );

    const filename = `Laporan_Semester_${semester}_${tahunAjaran.replace("/", "-")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF directly (caching will be added in next commit)
    return new NextResponse(Buffer.from(pdfBytes), {
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
