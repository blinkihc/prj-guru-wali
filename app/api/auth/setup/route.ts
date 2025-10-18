// Setup API route - Save wizard data
// Last updated: 2025-10-17
// Fixed: Now saves to D1 database (users + school_profiles)

import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { schoolProfiles, users } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      schoolName?: string;
      educationStage?: string;
      cityDistrict?: string;
      fullName?: string;
      nipNuptk?: string;
    };
    const { schoolName, educationStage, cityDistrict, fullName, nipNuptk } =
      body;

    // Validate input
    if (!schoolName || !educationStage || !cityDistrict || !fullName) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 },
      );
    }

    // Get D1 binding (with fallback for local dev)
    let db;
    try {
      // @ts-expect-error
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;

      if (!env?.DB) {
        // Local dev fallback - just return success
        console.warn(
          "[Setup] Running in local dev mode - skipping database save",
        );
        return NextResponse.json({
          success: true,
          message: "Setup berhasil disimpan (dev mode)",
        });
      }

      db = getDb(env.DB);
    } catch (_error) {
      // Local dev or getRequestContext not available
      console.warn(
        "[Setup] Cloudflare context not available - skipping database save",
      );
      return NextResponse.json({
        success: true,
        message: "Setup berhasil disimpan (dev mode)",
      });
    }

    // Production: Save to database
    try {
      // 1. Update users table with fullName and nipNuptk
      await db
        .update(users)
        .set({
          fullName,
          nipNuptk: nipNuptk || null,
        })
        .where(eq(users.id, currentUser.userId));

      // 2. Check if school profile already exists
      const [existingProfile] = await db
        .select()
        .from(schoolProfiles)
        .where(eq(schoolProfiles.userId, currentUser.userId))
        .limit(1);

      if (existingProfile) {
        // Update existing profile
        await db
          .update(schoolProfiles)
          .set({
            schoolName,
            educationStage,
            cityDistrict,
          })
          .where(eq(schoolProfiles.userId, currentUser.userId));
      } else {
        // Create new profile
        await db.insert(schoolProfiles).values({
          userId: currentUser.userId,
          schoolName,
          educationStage,
          cityDistrict,
        });
      }

      console.log(
        "[Setup] Data saved successfully for user:",
        currentUser.userId,
      );

      return NextResponse.json({
        success: true,
        message: "Setup berhasil disimpan",
      });
    } catch (dbError) {
      console.error("[Setup] Database error:", dbError);
      return NextResponse.json(
        { error: "Gagal menyimpan data ke database" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data" },
      { status: 500 },
    );
  }
}
