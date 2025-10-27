// Students Import API - Bulk import dari CSV ke database D1
// Created: 2025-10-14
// Last updated: 2025-10-22 - Implementasi bulk insert 32 kolom + social usages ke Drizzle D1

import type { D1Database } from "@cloudflare/workers-types";
import { inArray } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { studentSocialUsages, students } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { type Database, getDb } from "@/lib/db/client";
import { normalizeStudentUpdates } from "@/lib/services/students/biodata-utils";

type StudentInsertPayload = Record<string, unknown> & {
  fullName: string;
};

interface StudentImportRequest {
  students: StudentInsertPayload[];
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

    const body = (await request.json()) as StudentImportRequest | null;

    // Validate request body
    if (!body?.students || !Array.isArray(body.students)) {
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

    const rows = body.students;

    if (rows.length > 1000) {
      return NextResponse.json(
        { error: "Maximum 1000 students per import" },
        { status: 400 },
      );
    }

    let db: Database;
    try {
      db = await getDatabase();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[Students Import] Cloudflare bindings unavailable, skipping DB operation",
          error,
        );
        return NextResponse.json(
          { error: "Database tidak tersedia di lingkungan ini" },
          { status: 503 },
        );
      }
      throw error;
    }

    const normalizedRows = rows.map((row, index) => {
      const normalized = normalizeStudentUpdates({ ...row });
      const errors: string[] = [];

      const incomingFullName =
        typeof row.fullName === "string" ? row.fullName.trim() : "";
      const normalizedFullName =
        typeof normalized.studentUpdates.fullName === "string"
          ? normalized.studentUpdates.fullName.trim()
          : incomingFullName;

      if (!normalizedFullName) {
        errors.push("Nama lengkap wajib diisi");
      }

      const gender = normalized.studentUpdates.gender;
      if (gender && gender !== "L" && gender !== "P") {
        errors.push("Jenis kelamin harus 'L' atau 'P'");
      }

      return {
        index,
        errors,
        normalized: {
          studentUpdates: {
            ...normalized.studentUpdates,
            fullName: normalizedFullName,
          },
          socialUsages: normalized.socialUsages,
        },
      };
    });

    const hasFatalErrors = normalizedRows.some((row) => row.errors.length > 0);
    if (hasFatalErrors) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: normalizedRows
            .filter((row) => row.errors.length > 0)
            .map((row) => ({
              row: row.index + 1,
              errors: row.errors,
            })),
        },
        { status: 400 },
      );
    }

    const studentsValues = normalizedRows.map((row) => {
      const { studentUpdates } = row.normalized;
      const { fullName, ...rest } = studentUpdates;

      return {
        userId: session.userId,
        fullName: fullName as string,
        ...rest,
      } satisfies typeof students.$inferInsert;
    });

    console.log(
      `[Import] Inserting ${studentsValues.length} students for user ${session.userId}`,
    );

    let insertedIds: string[] = [];

    // Insert students first
    const inserted = await db
      .insert(students)
      .values(studentsValues)
      .returning({ id: students.id });

    console.log(`[Import] Successfully inserted ${inserted.length} students`);

    insertedIds = inserted.map((item) => item.id);

    // Insert social usages (filter out empty platforms)
    const socialUsageValues = inserted.flatMap((student, index) =>
      normalizedRows[index].normalized.socialUsages
        .filter((usage) => usage.platform && usage.platform.trim().length > 0)
        .map((usage) => ({
          studentId: student.id,
          platform: usage.platform,
          username: usage.username,
          isActive: usage.isActive ? 1 : 0,
        })),
    );

    if (socialUsageValues.length > 0) {
      await db.insert(studentSocialUsages).values(socialUsageValues);
    }

    type ImportedStudent = typeof students.$inferSelect & {
      socialUsages: (typeof studentSocialUsages.$inferSelect)[];
    };
    let importedStudents: ImportedStudent[] = [];

    if (insertedIds.length > 0) {
      const studentRows = await db
        .select()
        .from(students)
        .where(inArray(students.id, insertedIds));

      const socialRows = await db
        .select()
        .from(studentSocialUsages)
        .where(inArray(studentSocialUsages.studentId, insertedIds));

      const socialMap = new Map<string, typeof socialRows>();
      for (const usage of socialRows) {
        const list = socialMap.get(usage.studentId) ?? [];
        list.push(usage);
        socialMap.set(usage.studentId, list);
      }

      importedStudents = studentRows.map((student) => ({
        ...student,
        socialUsages: socialMap.get(student.id) ?? [],
      }));
    }

    return NextResponse.json(
      {
        message: "Import siswa berhasil",
        imported: insertedIds.length,
        failed: 0,
        errors: [],
        students: importedStudents,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/students/import error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to import students";
    return NextResponse.json(
      {
        error: "Failed to import students",
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
