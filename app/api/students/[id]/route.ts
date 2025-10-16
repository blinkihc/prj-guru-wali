// Students API - Individual Student Operations
// Created: 2025-10-14
// Handles GET, PUT, DELETE for individual student
// TODO: Implement actual D1 database integration (currently using mock data)

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

// Mock data - empty for MVP v1.0.0  
const mockStudents: Array<{
  id: string;
  userId: string;
  fullName: string;
  nisn: string;
  classroom: string;
  gender: string;
  parentName: string;
  parentContact: string;
  specialNotes: string;
  createdAt: string;
}> = [];

/**
 * GET /api/students/[id]
 * Get single student by ID
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

    // Find student in mock data
    const student = mockStudents.find((s) => s.id === id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("GET /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/students/[id]
 * Update student by ID
 * Body: { fullName?, nisn?, classroom?, gender?, parentContact?, specialNotes? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as any;

    // Validate fullName if provided
    if (body.fullName && typeof body.fullName !== "string") {
      return NextResponse.json(
        { error: "fullName must be a string" },
        { status: 400 },
      );
    }

    // Validate gender if provided
    if (body.gender && !["L", "P"].includes(body.gender)) {
      return NextResponse.json(
        { error: "gender must be 'L' or 'P'" },
        { status: 400 },
      );
    }

    // Find student in mock data
    const studentIndex = mockStudents.findIndex((s) => s.id === id);

    if (studentIndex === -1) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update student data (in real app, this would update database)
    if (body.fullName !== undefined)
      mockStudents[studentIndex].fullName = body.fullName.trim();
    if (body.nisn !== undefined)
      mockStudents[studentIndex].nisn = body.nisn?.trim() || null;
    if (body.classroom !== undefined)
      mockStudents[studentIndex].classroom = body.classroom?.trim() || null;
    if (body.gender !== undefined)
      mockStudents[studentIndex].gender = body.gender || null;
    if (body.parentName !== undefined)
      mockStudents[studentIndex].parentName = body.parentName?.trim() || null;
    if (body.parentContact !== undefined)
      mockStudents[studentIndex].parentContact =
        body.parentContact?.trim() || null;
    if (body.specialNotes !== undefined)
      mockStudents[studentIndex].specialNotes =
        body.specialNotes?.trim() || null;

    return NextResponse.json({
      student: mockStudents[studentIndex],
      message: "Student updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/students/[id]
 * Delete student by ID
 */
export async function DELETE(
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

    // Find student in mock data
    const studentIndex = mockStudents.findIndex((s) => s.id === id);

    if (studentIndex === -1) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete student (in real app, this would delete from database)
    mockStudents.splice(studentIndex, 1);

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
