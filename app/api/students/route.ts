// Students API - List and Create
// Last updated: 2025-10-21 - Update POST untuk handle 32 field + social usages

import type { D1Database } from "@cloudflare/workers-types";
import { and, desc, eq, like, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { studentSocialUsages, students } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { type Database, getDb } from "@/lib/db/client";
import { normalizeStudentUpdates } from "@/lib/services/students/biodata-utils";

export const runtime = "edge";

const DEFAULT_LIMIT = 50;

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
    const limitParam = Number(searchParams.get("limit") || DEFAULT_LIMIT);
    const offsetParam = Number(searchParams.get("offset") || 0);
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? limitParam
        : DEFAULT_LIMIT;
    const offset =
      Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

    let db: Database;
    try {
      db = await getDatabase();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[Students] Cloudflare bindings unavailable in development, returning empty list",
          error,
        );
        return NextResponse.json({
          students: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          },
        });
      }
      throw error;
    }

    // Build query dengan Drizzle ORM
    const conditions = [eq(students.userId, session.userId)];

    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          like(students.fullName, searchPattern),
          like(students.nisn, searchPattern),
          like(students.classroom, searchPattern),
        ) ?? eq(students.id, ""), // fallback jika or() undefined
      );
    }

    const studentsList = await db
      .select()
      .from(students)
      .where(and(...conditions))
      .orderBy(desc(students.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      students: studentsList,
      pagination: {
        total: studentsList.length,
        limit,
        offset,
        hasMore: studentsList.length === limit,
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
 * Body: { fullName (required), + 31 field biodata opsional, socialUsages?: array }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    // Validate required fields
    if (typeof body.fullName !== "string" || body.fullName.trim() === "") {
      return NextResponse.json(
        { error: "fullName is required" },
        { status: 400 },
      );
    }

    // Validate gender if provided
    if (
      body.gender !== undefined &&
      body.gender !== null &&
      typeof body.gender === "string" &&
      body.gender !== "" &&
      !["L", "P"].includes(body.gender)
    ) {
      return NextResponse.json(
        { error: "gender must be 'L' or 'P'" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const id = crypto.randomUUID();

    // Normalize semua field menggunakan biodata-utils
    const normalized = normalizeStudentUpdates(body);

    // Ensure fullName exists (sudah divalidasi di atas)
    const fullName =
      normalized.studentUpdates.fullName ?? (body.fullName as string);

    // Insert student dengan semua field yang dinormalisasi
    await db.insert(students).values({
      id,
      userId: session.userId,
      fullName,
      ...normalized.studentUpdates,
    });

    // Insert social usages jika ada
    if (normalized.socialUsages.length > 0) {
      for (const usage of normalized.socialUsages) {
        await db.insert(studentSocialUsages).values({
          studentId: id,
          platform: usage.platform,
          username: usage.username,
          isActive: usage.isActive ? 1 : 0,
        });
      }
    }

    // Fetch created student dengan social usages
    const [createdStudent] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    const socialUsages = await db
      .select()
      .from(studentSocialUsages)
      .where(eq(studentSocialUsages.studentId, id));

    return NextResponse.json(
      {
        student: createdStudent,
        socialUsages,
        message: "Student created successfully",
      },
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
