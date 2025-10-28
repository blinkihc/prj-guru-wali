// Cover assets upload API - Handles logo & illustration uploads to R2
// Created: 2025-10-19 - Added GET/POST/DELETE endpoints for cover assets
// Updated: 2025-10-20 - Gunakan tipe payload bersama & hilangkan any untuk lint compliance

import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { reportCoverIllustrations, schoolProfiles } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { type Database, getDb } from "@/lib/db/client";
import {
  buildPublicUrl,
  extractStorageKeyFromUrl,
  stripPrefix,
} from "@/lib/uploads/constants";
import { getUploadBindings } from "@/lib/uploads/context";
import { assertImageType, assertMaxSize } from "@/lib/uploads/image-validation";
import {
  buildCoverIllustrationKey,
  buildLogoKey,
  COVER_PREFIX,
  createCoverStorage,
} from "@/lib/uploads/storage";
import type {
  CoverAssetType,
  CoverIllustrationUploadPayload,
  CoverLogoUploadPayload,
  CoverUploadDeletePayload,
} from "@/types/uploads";

export const runtime = "edge";

const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

function ensureAssetType(value: FormDataEntryValue | null): CoverAssetType {
  const normalized = value?.toString();
  if (!normalized) {
    throw new Error("Jenis aset tidak valid");
  }

  if (
    normalized === "logo-dinas" ||
    normalized === "logo-sekolah" ||
    normalized === "cover-illustration"
  ) {
    return normalized;
  }
  throw new Error("Jenis aset tidak valid");
}

async function ensureSchoolProfile(db: Database, userId: string) {
  const [profile] = await db
    .select()
    .from(schoolProfiles)
    .where(eq(schoolProfiles.userId, userId))
    .limit(1);

  if (!profile) {
    throw new Error("Profil sekolah belum diatur");
  }

  return profile;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use regular DB connection for GET (no R2 needed)
    let db: Database;

    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as { DB?: any };

      if (!env?.DB) {
        console.warn("[CoverUpload] Database not available in context");
        return NextResponse.json(
          { error: "Database not available" },
          { status: 503 },
        );
      }

      db = getDb(env.DB);
    } catch (ctxError) {
      console.error("[CoverUpload] Context error:", ctxError);
      return NextResponse.json(
        { error: "Failed to get database context" },
        { status: 503 },
      );
    }

    // Query school profile
    let profile = null;
    try {
      const profiles = await db
        .select()
        .from(schoolProfiles)
        .where(eq(schoolProfiles.userId, session.userId))
        .limit(1);
      profile = profiles[0] || null;
    } catch (profileError) {
      console.warn("[CoverUpload] Profile query error:", profileError);
      // Continue without profile data
    }

    // Query illustrations
    let illustrations: typeof reportCoverIllustrations.$inferSelect[] = [];
    try {
      illustrations = await db
        .select()
        .from(reportCoverIllustrations)
        .orderBy(desc(reportCoverIllustrations.createdAt));
    } catch (illustrationError) {
      console.warn(
        "[CoverUpload] Illustration query error:",
        illustrationError,
      );
      console.warn(
        "[CoverUpload] Hint: Run 'drizzle/ensure-cover-tables.sql' to create missing tables",
      );
      // Continue with empty illustrations
    }

    return NextResponse.json({
      logos: {
        logoDinasUrl: profile?.logoDinasUrl ?? null,
        logoSekolahUrl: profile?.logoSekolahUrl ?? null,
      },
      illustrations: illustrations.map((item) => ({
        id: item.id,
        url: item.url,
        label: item.label,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("[CoverUpload] GET error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal memuat data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 },
      );
    }

    const assetType = ensureAssetType(formData.get("assetType"));

    assertImageType(file.type || "");
    assertMaxSize(file.size, MAX_COVER_SIZE);

    const arrayBuffer = await file.arrayBuffer();

    // Get upload bindings (requires R2 bucket)
    let bucket: any; // R2Bucket type has conflicts between imports
    let db: Database;
    try {
      const bindings = await getUploadBindings();
      bucket = bindings.bucket;
      db = bindings.db;
    } catch (bindingError) {
      console.error("[CoverUpload] Binding error:", bindingError);
      return NextResponse.json(
        {
          error:
            "R2 Storage tidak tersedia. Pastikan wrangler dev berjalan dengan binding yang benar.",
          hint: "Run: wrangler dev --local --persist",
        },
        { status: 503 },
      );
    }
    const storage = createCoverStorage(bucket);

    if (assetType === "cover-illustration") {
      const label = formData.get("label")?.toString() || null;
      const { id, key } = buildCoverIllustrationKey(file.type || "image/png");

      await storage.put(key, arrayBuffer, { contentType: file.type || "" });

      const url = buildPublicUrl(`${COVER_PREFIX}${key}`);

      await db.insert(reportCoverIllustrations).values({
        id,
        url,
        label,
      });

      return NextResponse.json({
        success: true,
        illustration: {
          id,
          url,
          label,
        },
      });
    }

    // Handle logo uploads
    const profile = await ensureSchoolProfile(db, session.userId);
    const key = buildLogoKey(
      session.userId,
      assetType,
      file.type || "image/png",
    );

    await storage.put(key, arrayBuffer, { contentType: file.type || "" });

    const url = buildPublicUrl(`${COVER_PREFIX}${key}`);
    const previousUrl =
      assetType === "logo-dinas"
        ? profile.logoDinasUrl
        : profile.logoSekolahUrl;

    await db
      .update(schoolProfiles)
      .set(
        assetType === "logo-dinas"
          ? { logoDinasUrl: url }
          : { logoSekolahUrl: url },
      )
      .where(eq(schoolProfiles.userId, session.userId));

    if (previousUrl && previousUrl !== url) {
      const oldKey = extractStorageKeyFromUrl(previousUrl);
      if (oldKey) {
        await storage.delete(stripPrefix(oldKey, COVER_PREFIX));
      }
    }

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("[CoverUpload] POST error:", error);
    const message = error instanceof Error ? error.message : "Upload gagal";
    const status =
      message === "Profil sekolah belum diatur"
        ? 409
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

    const body = (await request.json()) as CoverUploadDeletePayload | null;

    if (!body?.assetType) {
      return NextResponse.json(
        { error: "Jenis aset tidak valid" },
        { status: 400 },
      );
    }

    if (body.assetType === "cover-illustration") {
      const payload = body as CoverIllustrationUploadPayload & {
        illustrationId: string;
      };
      if (!payload.illustrationId) {
        return NextResponse.json(
          { error: "ID ilustrasi wajib diisi" },
          { status: 400 },
        );
      }

      const { bucket, db } = await getUploadBindings();
      const storage = createCoverStorage(bucket);

      const [illustration] = await db
        .select()
        .from(reportCoverIllustrations)
        .where(eq(reportCoverIllustrations.id, payload.illustrationId))
        .limit(1);

      if (!illustration) {
        return NextResponse.json({ success: true });
      }

      const storageKey = extractStorageKeyFromUrl(illustration.url);
      if (storageKey) {
        await storage.delete(stripPrefix(storageKey, COVER_PREFIX));
      }

      await db
        .delete(reportCoverIllustrations)
        .where(eq(reportCoverIllustrations.id, payload.illustrationId));

      return NextResponse.json({ success: true });
    }

    const logoPayload = body as CoverLogoUploadPayload;
    if (
      logoPayload.assetType !== "logo-dinas" &&
      logoPayload.assetType !== "logo-sekolah"
    ) {
      return NextResponse.json(
        { error: "Jenis aset tidak valid" },
        { status: 400 },
      );
    }

    const { bucket, db } = await getUploadBindings();
    const storage = createCoverStorage(bucket);
    const [profile] = await db
      .select()
      .from(schoolProfiles)
      .where(eq(schoolProfiles.userId, session.userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ success: true });
    }

    const currentUrl =
      logoPayload.assetType === "logo-dinas"
        ? profile.logoDinasUrl
        : profile.logoSekolahUrl;

    if (currentUrl) {
      const storageKey = extractStorageKeyFromUrl(currentUrl);
      if (storageKey) {
        await storage.delete(stripPrefix(storageKey, COVER_PREFIX));
      }
    }

    await db
      .update(schoolProfiles)
      .set(
        logoPayload.assetType === "logo-dinas"
          ? { logoDinasUrl: null }
          : { logoSekolahUrl: null },
      )
      .where(eq(schoolProfiles.userId, session.userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CoverUpload] DELETE error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghapus";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
