// API Route: /api/reports/student/[id]
// Generate full student PDF report
// Created: 2025-01-14

import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { StudentReportDocument } from "@/components/reports/student-report-template";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs"; // PDF generation requires Node.js runtime

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

    // Get school name from session (or use default)
    const schoolName = (session as any).schoolName || "SMP Negeri 1";

    // Generate PDF
    const pdfDocument = StudentReportDocument({
      student,
      journals,
      meetings,
      interventions,
      schoolName,
      generatedAt: new Date(),
    });

    // Render to buffer
    const pdfBuffer = await renderToBuffer(pdfDocument);

    // Generate filename
    const filename = `Laporan_${student.fullName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Return PDF as download
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": pdfBuffer.length.toString(),
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
