// API Route: /api/reports/biodata/[id]
// Generate student biodata PDF with full 32 fields + social usages
// Created: 2025-10-22 - Phase 2 biodata export

import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  schoolProfiles,
  studentSocialUsages,
  students,
} from "@/drizzle/schema";
import { getSession, type SessionData } from "@/lib/auth/session";
import { type Database, getDb } from "@/lib/db/client";
import {
  generateBiodataPDF,
  type StudentBiodataData,
} from "@/lib/services/pdf-biodata-template";

export const runtime = "edge";

async function getDatabase(): Promise<Database> {
  const { getRequestContext } = await import("@cloudflare/next-on-pages");
  const ctx = getRequestContext();
  const env = ctx?.env as { DB?: D1Database } | undefined;

  if (!env?.DB) {
    throw new Error("Database unavailable");
  }

  return getDb(env.DB);
}

/**
 * GET /api/reports/biodata/[id]
 * Generate and download student biodata PDF (full 32 fields)
 */
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { id: studentId } = params;

    // Check authentication
    const session = (await getSession()) as SessionData | null;
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get database
    let db: Database;
    try {
      db = await getDatabase();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[Biodata Report] Cloudflare bindings unavailable, skipping DB operation",
          error,
        );
        return NextResponse.json(
          { error: "Database tidak tersedia di lingkungan ini" },
          { status: 503 },
        );
      }
      throw error;
    }

    // Fetch student data with social usages
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch social usages
    const socialUsageRows = await db
      .select()
      .from(studentSocialUsages)
      .where(eq(studentSocialUsages.studentId, studentId));

    // Map to StudentBiodataData
    const biodataData: StudentBiodataData = {
      fullName: student.fullName,
      nis: student.nis,
      nisn: student.nisn,
      classroom: student.classroom,
      gender: (student.gender === "P" || student.gender === "L") ? student.gender : null,
      birthPlace: student.birthPlace,
      birthDate: student.birthDate,
      religion: student.religion,
      bloodType: student.bloodType,
      economicStatus: student.economicStatus,
      address: student.address,
      phoneNumber: student.phoneNumber,
      dream: student.dream,
      extracurricular: student.extracurricular,
      hobby: student.hobby,
      photoUrl: student.photoUrl,
      parentName: student.parentName,
      parentContact: student.parentContact,
      fatherName: student.fatherName,
      fatherJob: student.fatherJob,
      fatherIncome: student.fatherIncome,
      motherName: student.motherName,
      motherJob: student.motherJob,
      motherIncome: student.motherIncome,
      healthHistoryPast: student.healthHistoryPast,
      healthHistoryCurrent: student.healthHistoryCurrent,
      healthHistoryOften: student.healthHistoryOften,
      characterStrength: student.characterStrength,
      characterImprovement: student.characterImprovement,
      specialNotes: student.specialNotes,
      socialUsages: socialUsageRows.map((usage) => ({
        platform: usage.platform,
        username: usage.username,
        isActive: Boolean(usage.isActive),
      })),
    };

    // Get teacher name from session
    const teacherName = session.fullName || "Guru Wali";

    // Get school name from school_profiles
    const [schoolProfile] = await db
      .select()
      .from(schoolProfiles)
      .where(eq(schoolProfiles.userId, session.userId))
      .limit(1);

    const schoolName = schoolProfile?.schoolName || "SMP Negeri 1";

    // Auto-generate academic year based on current month
    // Juli (6) - Desember (11): tahun now / tahun next
    // Januari (0) - Juni (5): tahun before / tahun now
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    const academicYear =
      month >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;

    // Generate PDF with dynamic data (now async)
    const pdfBytes = await generateBiodataPDF(
      biodataData,
      schoolName,
      teacherName,
      academicYear,
    );

    // Return PDF
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Biodata_${student.fullName.replace(/ /g, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/reports/biodata/[id] error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate biodata PDF",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
