// API Route: /api/reports/student/[id]
// Generate full student PDF report
// Created: 2025-01-14

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateStudentReportPDF } from "@/lib/services/pdf-generator-edge";

export const runtime = "edge"; // Changed to edge for Cloudflare Pages

// Mock data - empty for MVP v1.0.0
const mockStudents: any[] = [];
const mockJournals: any[] = [];
const mockMeetings: any[] = [];
const mockInterventions: any[] = [];

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

    // Find student
    const student = mockStudents.find((s) => s.id === id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch related data
    const journals = mockJournals
      .filter((j) => j.studentId === id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const meetings = mockMeetings
      .filter((m) => m.studentId === id)
      .sort(
        (a, b) =>
          new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime(),
      );

    const interventions = mockInterventions
      .filter((i) => i.studentId === id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    // Get school name and teacher name from session (or use default)
    const schoolName = (session as any).schoolName || "SMP Negeri 1";
    const teacherName = (session as any).fullName || "Guru Wali";

    // Generate PDF using jsPDF (edge-compatible)
    const pdfBytes = generateStudentReportPDF(
      {
        id: student.id,
        name: student.fullName,
        nisn: student.nisn,
        class: student.class,
        gender: student.gender,
      },
      journals.map(j => ({
        id: j.id,
        month: new Date(j.createdAt).toLocaleDateString("id-ID", { month: "long" }),
        year: new Date(j.createdAt).getFullYear(),
        academicProgress: j.academicProgress || "-",
        socialBehavior: j.socialBehavior || "-",
        emotionalState: j.emotionalState || "-",
        physicalHealth: j.physicalHealth || "-",
        spiritualDevelopment: j.spiritualDevelopment || "-",
      })),
      meetings.map(m => ({
        id: m.id,
        date: new Date(m.meetingDate).toLocaleDateString("id-ID"),
        type: m.meetingType,
        topic: m.topic,
        notes: m.notes || "-",
      })),
      interventions.map(i => ({
        id: i.id,
        date: new Date(i.createdAt).toLocaleDateString("id-ID"),
        issue: i.issue,
        action: i.actionTaken,
        result: i.result || "Dalam proses",
      })),
      teacherName,
      schoolName
    );

    // Generate filename
    const filename = `Laporan_${student.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF as download
    return new NextResponse(pdfBytes, {
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
