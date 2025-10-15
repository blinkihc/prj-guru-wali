// Students API - List and Create
// Created: 2025-10-14
// Handles GET (list with search) and POST (create) for students
// TODO: Implement actual D1 database integration (currently using mock data for UI testing)

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

// MVP v1.0.0: Start with empty data - users create their own
// TODO: Replace with actual D1 database integration
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
 * GET /api/students
 * List all students with optional search
 * Query params:
 * - search: string (searches name, nisn, classroom)
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // Filter mock data
    let filtered = mockStudents;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = mockStudents.filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchLower) ||
          s.nisn?.toLowerCase().includes(searchLower) ||
          s.classroom?.toLowerCase().includes(searchLower),
      );
    }

    return NextResponse.json({
      students: filtered,
      pagination: {
        total: filtered.length,
        limit: 50,
        offset: 0,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/students
 * Create a new student
 * Body: { fullName, nisn?, classroom?, gender?, parentContact?, specialNotes? }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.fullName || typeof body.fullName !== "string") {
      return NextResponse.json(
        { error: "fullName is required" },
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

    // Create mock student (in real app, this would insert to database)
    const newStudent = {
      id: `${Date.now()}`,
      userId: session.userId,
      fullName: body.fullName.trim(),
      nisn: body.nisn?.trim() || null,
      classroom: body.classroom?.trim() || null,
      gender: body.gender || null,
      parentName: body.parentName?.trim() || null,
      parentContact: body.parentContact?.trim() || null,
      specialNotes: body.specialNotes?.trim() || null,
      createdAt: new Date().toISOString(),
    };

    // In real app: save to database
    mockStudents.push(newStudent);

    return NextResponse.json(
      { student: newStudent, message: "Student created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
