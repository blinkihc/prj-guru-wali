// Settings API - Get and update user profile & school data
// Last updated: 2025-10-17

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { schoolProfiles, users } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";

export const runtime = "edge";

/**
 * GET /api/settings
 * Get current user settings (profile + school data)
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get D1 binding (with fallback for local dev)
    let db;
    try {
      // @ts-expect-error
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;

      if (!env?.DB) {
        // Local dev fallback - return empty/default data
        console.warn(
          "[Settings] Running in local dev mode - using default data",
        );
        return NextResponse.json({
          email: "dev@example.com",
          fullName: "Development User",
          nipNuptk: "",
          schoolName: "",
          educationStage: "",
          cityDistrict: "",
        });
      }

      db = getDb(env.DB);
    } catch (_error) {
      // Local dev or getRequestContext not available
      console.warn(
        "[Settings] Cloudflare context not available - using default data",
      );
      return NextResponse.json({
        email: "dev@example.com",
        fullName: "Development User",
        nipNuptk: "",
        schoolName: "",
        educationStage: "",
        cityDistrict: "",
      });
    }

    // Production: Fetch from database
    try {
      // Get user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Get school profile (may not exist)
      const [profile] = await db
        .select()
        .from(schoolProfiles)
        .where(eq(schoolProfiles.userId, session.userId))
        .limit(1);

      // Return combined data
      return NextResponse.json({
        email: user.email,
        fullName: user.fullName,
        nipNuptk: user.nipNuptk || "",
        schoolName: profile?.schoolName || "",
        educationStage: profile?.educationStage || "",
        cityDistrict: profile?.cityDistrict || "",
      });
    } catch (error) {
      console.error("[Settings] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[Settings] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/settings
 * Update user profile & school data
 * Optionally change password
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as any;

    // Validate required fields
    if (!body.fullName || typeof body.fullName !== "string") {
      return NextResponse.json(
        { error: "Nama lengkap harus diisi" },
        { status: 400 },
      );
    }

    if (!body.schoolName || typeof body.schoolName !== "string") {
      return NextResponse.json(
        { error: "Nama sekolah harus diisi" },
        { status: 400 },
      );
    }

    if (!body.educationStage || typeof body.educationStage !== "string") {
      return NextResponse.json(
        { error: "Jenjang pendidikan harus diisi" },
        { status: 400 },
      );
    }

    if (!body.cityDistrict || typeof body.cityDistrict !== "string") {
      return NextResponse.json(
        { error: "Kota/Kabupaten harus diisi" },
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
          "[Settings] Running in local dev mode - skipping database update",
        );
        return NextResponse.json({ success: true });
      }

      db = getDb(env.DB);
    } catch (_error) {
      // Local dev or getRequestContext not available
      console.warn(
        "[Settings] Cloudflare context not available - skipping database update",
      );
      return NextResponse.json({ success: true });
    }

    // Production: Update database
    try {
      // If password change requested, verify current password
      if (body.currentPassword && body.newPassword) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, session.userId))
          .limit(1);

        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }

        // Verify current password
        const isValid = await compare(
          body.currentPassword,
          user.hashedPassword,
        );
        if (!isValid) {
          return NextResponse.json(
            { error: "Password lama tidak sesuai" },
            { status: 400 },
          );
        }

        // Hash new password
        const hashedPassword = await hash(body.newPassword, 10);

        // Update user with new password
        await db
          .update(users)
          .set({
            fullName: body.fullName,
            nipNuptk: body.nipNuptk || null,
            hashedPassword,
          })
          .where(eq(users.id, session.userId));
      } else {
        // Update user without password change
        await db
          .update(users)
          .set({
            fullName: body.fullName,
            nipNuptk: body.nipNuptk || null,
          })
          .where(eq(users.id, session.userId));
      }

      // Update or create school profile
      const [existingProfile] = await db
        .select()
        .from(schoolProfiles)
        .where(eq(schoolProfiles.userId, session.userId))
        .limit(1);

      if (existingProfile) {
        // Update existing profile
        await db
          .update(schoolProfiles)
          .set({
            schoolName: body.schoolName,
            educationStage: body.educationStage,
            cityDistrict: body.cityDistrict,
          })
          .where(eq(schoolProfiles.userId, session.userId));
      } else {
        // Create new profile
        await db.insert(schoolProfiles).values({
          userId: session.userId,
          schoolName: body.schoolName,
          educationStage: body.educationStage,
          cityDistrict: body.cityDistrict,
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[Settings] Database error:", error);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[Settings] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
