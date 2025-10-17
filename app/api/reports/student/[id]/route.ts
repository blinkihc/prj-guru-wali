// API Route: /api/reports/student/[id]
// Generate full student PDF report with real database data
// Updated: 2025-10-17 - Replaced mock data with real D1 database queries

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { students, monthlyJournals, meetingLogs, interventions } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { generateStudentReportPDF } from "@/lib/services/pdf-generator-edge";

export const runtime = "edge";

/**
 * GET /api/reports/student/[id]
 * Generate and download full student report as PDF
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get D1 binding (with fallback for local dev)
    let db;
    try {
      // @ts-ignore
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;

      if (!env?.DB) {
        console.warn("[StudentReport] Running in local dev mode");
        return NextResponse.json(
          { error: "Database not available in local dev" },
          { status: 503 },
        );
      }

      db = getDb(env.DB);
    } catch (error) {
      console.warn("[StudentReport] Cloudflare context not available");
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 },
      );
    }

    // Find student
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify student belongs to current user
    if (student.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch related data
    const journals = await db
      .select()
      .from(monthlyJournals)
      .where(eq(monthlyJournals.studentId, id))
      .orderBy(monthlyJournals.createdAt);

    const meetings = await db
      .select()
      .from(meetingLogs)
      .where(eq(meetingLogs.studentId, id))
      .orderBy(meetingLogs.meetingDate);

    const studentInterventions = await db
      .select()
      .from(interventions)
      .where(eq(interventions.studentId, id))
      .orderBy(interventions.createdAt);

    // Get school name and teacher name from session (or use default)
    const schoolName = (session as any).schoolName || "SMP Negeri 1";
    const teacherName = (session as any).fullName || "Guru Wali";

    // Generate PDF using jsPDF (edge-compatible)
    const pdfBytes = generateStudentReportPDF(
      {
        id: student.id,
        name: student.fullName,
        nisn: student.nisn || "",
        class: student.classroom || "7A",
        gender: student.gender || "",
      },
      journals.map((j) => ({
        id: j.id,
        month: new Date(j.createdAt).toLocaleDateString("id-ID", { month: "long" }),
        year: new Date(j.createdAt).getFullYear(),
        academicProgress: j.academicDesc || "-",
        socialBehavior: j.characterDesc || "-",
        emotionalState: j.socialEmotionalDesc || "-",
        physicalHealth: j.disciplineDesc || "-",
        spiritualDevelopment: j.potentialInterestDesc || "-",
      })),
      meetings.map((m) => ({
        id: m.id,
        date: new Date(m.meetingDate).toLocaleDateString("id-ID"),
        type: "Individual", // meetingType not in schema
        topic: m.topic,
        notes: m.notes || "-",
      })),
      studentInterventions.map((i) => ({
        id: i.id,
        date: new Date(i.createdAt).toLocaleDateString("id-ID"),
        issue: i.issue,
        action: i.actionSteps,
        result: i.status || "Dalam proses",
      })),
      teacherName,
      schoolName
    );

    // Generate filename
    const filename = `Laporan_${student.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF as download
    return new NextResponse(pdfBytes.buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("GET /api/reports/student/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
