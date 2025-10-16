// Profile check API - Check if user has completed setup
// Returns: { hasProfile: boolean }
// Last updated: 2025-10-17

import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { schoolProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

/**
 * GET /api/profile/check
 * Check if current user has completed setup (has school profile)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get D1 binding
    let hasProfile = false;
    try {
      // @ts-ignore
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;

      if (env?.DB) {
        const db = getDb(env.DB);
        const [profile] = await db
          .select()
          .from(schoolProfiles)
          .where(eq(schoolProfiles.userId, session.userId))
          .limit(1);

        hasProfile = !!profile;
      }
    } catch (error) {
      console.error("[ProfileCheck] Error checking profile:", error);
      // Return false on error (safe default)
      hasProfile = false;
    }

    return NextResponse.json({ hasProfile });
  } catch (error) {
    console.error("[ProfileCheck] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
