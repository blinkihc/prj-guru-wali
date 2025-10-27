// Student photo upload API - Manage student photo storage in R2
// Created: 2025-10-19 - Provides GET/POST/DELETE handlers for student photos (stream + upload + delete)
// Updated: 2025-10-20 - Gunakan tipe payload bersama & hilangkan any untuk lint compliance

import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { students } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import type { Database } from "@/lib/db/client";
import {
  buildPublicUrl,
  extractStorageKeyFromUrl,
  stripPrefix,
} from "@/lib/uploads/constants";
import { getUploadBindings } from "@/lib/uploads/context";
import { assertImageType, assertMaxSize } from "@/lib/uploads/image-validation";
import {
  buildStudentPhotoKey,
  createStudentPhotoStorage,
  STUDENT_PHOTO_PREFIX,
} from "@/lib/uploads/storage";
import type { StudentPhotoDeletePayload } from "@/types/uploads";

export const runtime = "edge";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

async function ensureStudentOwnership(
  db: Database,
  studentId: string,
  userId: string,
) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) {
    throw new Error("Data siswa tidak ditemukan");
  }

  if (student.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return student;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "ID siswa wajib diisi" },
        { status: 400 },
      );
    }

    const { bucket, db } = await getUploadBindings();
    const student = await ensureStudentOwnership(db, studentId, session.userId);

    if (!student.photoUrl) {
      return NextResponse.json(
        { error: "Foto siswa belum tersedia" },
        { status: 404 },
      );
    }

    const storageKey = extractStorageKeyFromUrl(student.photoUrl);
    if (!storageKey) {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 404 },
      );
    }

    const object = await bucket.get(storageKey);

    if (!object) {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 404 },
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "image/png",
    );
    headers.set("Cache-Control", "private, max-age=60");
    if (typeof object.size === "number") {
      headers.set("Content-Length", object.size.toString());
    }

    const body = object.body as unknown as BodyInit;
    return new NextResponse(body, { status: 200, headers });
  } catch (error) {
    console.error("[StudentPhoto] GET error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal memuat foto";
    const status =
      message === "ID siswa wajib diisi"
        ? 400
        : message === "Data siswa tidak ditemukan" ||
            message === "Foto tidak ditemukan"
          ? 404
          : message === "Unauthorized"
            ? 403
            : message === "Cloudflare bindings unavailable"
              ? 503
              : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const studentId = formData.get("studentId")?.toString();
    const file = formData.get("file");

    if (!studentId) {
      return NextResponse.json(
        { error: "ID siswa wajib diisi" },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 },
      );
    }

    assertImageType(file.type || "");
    assertMaxSize(file.size, MAX_PHOTO_SIZE);

    const { bucket, db } = await getUploadBindings();
    const student = await ensureStudentOwnership(db, studentId, session.userId);
    const storage = createStudentPhotoStorage(bucket);

    const key = buildStudentPhotoKey(studentId, file.type || "image/png");
    const arrayBuffer = await file.arrayBuffer();

    await storage.put(key, arrayBuffer, { contentType: file.type || "" });

    const url = buildPublicUrl(`${STUDENT_PHOTO_PREFIX}${key}`);

    await db
      .update(students)
      .set({
        photoUrl: url,
      })
      .where(eq(students.id, studentId));

    if (student.photoUrl && student.photoUrl !== url) {
      const oldKey = extractStorageKeyFromUrl(student.photoUrl);
      if (oldKey) {
        await storage.delete(stripPrefix(oldKey, STUDENT_PHOTO_PREFIX));
      }
    }

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("[StudentPhoto] POST error:", error);
    const message = error instanceof Error ? error.message : "Upload gagal";
    const status =
      message === "ID siswa wajib diisi" || message === "File tidak ditemukan"
        ? 400
        : message === "Data siswa tidak ditemukan"
          ? 404
          : message === "Unauthorized"
            ? 403
            : message === "Cloudflare bindings unavailable"
              ? 503
              : message === "File harus berupa PNG atau JPG" ||
                  message === "Ukuran file melebihi batas maksimum"
                ? 400
                : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as StudentPhotoDeletePayload;
    if (!body?.studentId || typeof body.studentId !== "string") {
      return NextResponse.json(
        { error: "ID siswa wajib diisi" },
        { status: 400 },
      );
    }

    const { bucket, db } = await getUploadBindings();
    const student = await ensureStudentOwnership(
      db,
      body.studentId,
      session.userId,
    );
    const storage = createStudentPhotoStorage(bucket);

    if (student.photoUrl) {
      const storageKey = extractStorageKeyFromUrl(student.photoUrl);
      if (storageKey) {
        await storage.delete(stripPrefix(storageKey, STUDENT_PHOTO_PREFIX));
      }
    }

    await db
      .update(students)
      .set({ photoUrl: null })
      .where(eq(students.id, body.studentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[StudentPhoto] DELETE error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghapus";
    const status =
      message === "ID siswa wajib diisi"
        ? 400
        : message === "Data siswa tidak ditemukan"
          ? 404
          : message === "Unauthorized"
            ? 403
            : message === "Cloudflare bindings unavailable"
              ? 503
              : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
