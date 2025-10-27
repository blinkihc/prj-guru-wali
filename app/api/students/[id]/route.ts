// Students API - Individual student operations with D1 integration
// Created: 2025-01-12
// Updated: 2025-10-20 - Tambah dukungan biodata & social usage (fase 2)

import type { D1Database } from "@cloudflare/workers-types";
import { eq, inArray } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { studentSocialUsages, students } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { type Database, getDb } from "@/lib/db/client";
import {
  deriveSocialUsageChanges,
  mergeStudentData,
  normalizeStudentUpdates,
} from "@/lib/services/students/biodata-utils";

export const runtime = "edge";

interface StudentParams {
  id: string;
}

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
 * GET /api/students/[id]
 * Get single student by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<StudentParams> },
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDatabase();

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const socialUsages = await db
      .select()
      .from(studentSocialUsages)
      .where(eq(studentSocialUsages.studentId, id));

    return NextResponse.json({ student, socialUsages });
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
 * Body: Biodata siswa (semua field opsional, null untuk kosong)
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
    const body = (await request.json()) as Record<string, unknown>;

    // Validasi input minimal sebelum operasi DB
    if (body.fullName !== undefined && typeof body.fullName !== "string") {
      return NextResponse.json(
        { error: "fullName must be a string" },
        { status: 400 },
      );
    }

    if (body.gender !== undefined) {
      if (
        typeof body.gender !== "string" ||
        !["L", "P"].includes(body.gender)
      ) {
        return NextResponse.json(
          { error: "gender must be 'L' or 'P'" },
          { status: 400 },
        );
      }
    }

    const db = await getDatabase();

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const normalized = normalizeStudentUpdates(body);

    if (
      Object.keys(normalized.studentUpdates).length === 0 &&
      normalized.socialUsages.length === 0
    ) {
      return NextResponse.json({ student, message: "Tidak ada perubahan" });
    }

    if (Object.keys(normalized.studentUpdates).length > 0) {
      await db
        .update(students)
        .set(normalized.studentUpdates)
        .where(eq(students.id, id));
    }

    let latestSocialUsages:
      | Array<typeof studentSocialUsages.$inferSelect>
      | undefined;

    if (normalized.socialUsages.length > 0) {
      const existingUsages = await db
        .select()
        .from(studentSocialUsages)
        .where(eq(studentSocialUsages.studentId, id));

      const changes = deriveSocialUsageChanges(
        existingUsages,
        normalized.socialUsages,
      );

      if (changes.toInsert.length > 0) {
        for (const payload of changes.toInsert) {
          await db.insert(studentSocialUsages).values({
            studentId: id,
            platform: payload.platform,
            username: payload.username,
            isActive: payload.isActive,
          });
        }
      }

      if (changes.toUpdate.length > 0) {
        for (const payload of changes.toUpdate) {
          await db
            .update(studentSocialUsages)
            .set({
              platform: payload.platform,
              username: payload.username,
              isActive: payload.isActive,
            })
            .where(eq(studentSocialUsages.id, payload.id));
        }
      }

      if (changes.toDelete.length > 0) {
        await db
          .delete(studentSocialUsages)
          .where(inArray(studentSocialUsages.id, changes.toDelete));
      }

      latestSocialUsages = await db
        .select()
        .from(studentSocialUsages)
        .where(eq(studentSocialUsages.studentId, id));
    } else {
      latestSocialUsages = await db
        .select()
        .from(studentSocialUsages)
        .where(eq(studentSocialUsages.studentId, id));
    }

    const [updatedStudent] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    return NextResponse.json({
      student:
        updatedStudent ?? mergeStudentData(student, normalized.studentUpdates),
      socialUsages: latestSocialUsages,
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
    const db = await getDatabase();

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.delete(students).where(eq(students.id, id));

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
