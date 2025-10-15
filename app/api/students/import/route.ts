// Students Import API - Bulk import from CSV
// Created: 2025-10-14
// TODO: Implement actual D1 database integration (currently using mock data)

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

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

export const runtime = "edge";

/**
 * POST /api/students/import
 * Bulk import students
 * Body: { students: Array<Omit<Student, 'id' | 'userId' | 'createdAt'>> }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    if (!body.students || !Array.isArray(body.students)) {
      return NextResponse.json(
        { error: "students array is required" },
        { status: 400 },
      );
    }

    if (body.students.length === 0) {
      return NextResponse.json(
        { error: "students array cannot be empty" },
        { status: 400 },
      );
    }

    if (body.students.length > 1000) {
      return NextResponse.json(
        { error: "Maximum 1000 students per import" },
        { status: 400 },
      );
    }

    // Validate each student
    const errors: Array<{ row: number; errors: string[] }> = [];

    // biome-ignore lint/suspicious/noExplicitAny: Request body is untyped
    body.students.forEach((student: any, index: number) => {
      const rowErrors: string[] = [];

      // Validate required fields
      if (!student.fullName || typeof student.fullName !== "string") {
        rowErrors.push("fullName is required");
      }

      // Validate gender if provided
      if (student.gender && !["L", "P"].includes(student.gender)) {
        rowErrors.push('gender must be "L" or "P"');
      }

      if (rowErrors.length > 0) {
        errors.push({ row: index + 1, errors: rowErrors });
      }
    });

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: errors,
        },
        { status: 400 },
      );
    }

    // Import students (in real app, this would be bulk insert to database)
    // biome-ignore lint/suspicious/noExplicitAny: Request body is untyped
    const importedStudents = body.students.map((student: any) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: session.userId,
      fullName: student.fullName.trim(),
      nisn: student.nisn?.trim() || null,
      classroom: student.classroom?.trim() || null,
      gender: student.gender || null,
      parentName: student.parentName?.trim() || null,
      parentContact: student.parentContact?.trim() || null,
      specialNotes: student.specialNotes?.trim() || null,
      createdAt: new Date().toISOString(),
    }));

    // Add to mock data
    mockStudents.push(...importedStudents);

    return NextResponse.json(
      {
        message: "Students imported successfully",
        imported: importedStudents.length,
        students: importedStudents,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/students/import error:", error);
    return NextResponse.json(
      { error: "Failed to import students" },
      { status: 500 },
    );
  }
}
