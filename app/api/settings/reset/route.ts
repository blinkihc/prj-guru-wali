// Reset Data API Route - Clear all student data, journals, meetings, and interventions
// Created: 2025-11-06 - For development and testing purposes
// WARNING: This will permanently delete data!

import type { D1Database } from "@cloudflare/workers-types";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get confirmation from request body
    const body = (await request.json()) as {
      confirm?: string;
      tables?: string[];
    };

    // Require explicit confirmation
    if (body.confirm !== "RESET_ALL_DATA") {
      return NextResponse.json(
        {
          error:
            "Konfirmasi tidak valid. Ketik 'RESET_ALL_DATA' untuk melanjutkan.",
        },
        { status: 400 },
      );
    }

    // Get D1 binding
    let db: D1Database;
    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as { DB?: D1Database };

      if (!env?.DB) {
        console.error("[Reset] D1 binding not found");
        return NextResponse.json(
          { error: "Database tidak tersedia" },
          { status: 503 },
        );
      }

      db = env.DB;
    } catch (error) {
      console.error("[Reset] Error getting D1 binding:", error);
      return NextResponse.json(
        { error: "Database tidak tersedia" },
        { status: 503 },
      );
    }

    // Define tables to clear (in order, respecting foreign keys)
    const tablesToClear = body.tables || [
      "student_social_usages", // Has FK to students
      "interventions", // Has FK to students
      "meeting_logs", // Has FK to students
      "monthly_journals", // Has FK to students
      "students", // Main table
    ];

    const results: Record<string, number> = {};

    // Clear each table
    for (const table of tablesToClear) {
      try {
        // Count before delete
        const countResult = await db
          .prepare(`SELECT COUNT(*) as count FROM ${table}`)
          .first();
        const count = (countResult?.count as number) || 0;

        // Delete all rows
        await db.prepare(`DELETE FROM ${table}`).run();

        results[table] = count;

        console.log(`[Reset] Cleared ${count} rows from ${table}`);
      } catch (error) {
        console.error(`[Reset] Error clearing ${table}:`, error);
        results[table] = -1; // Indicate error
      }
    }

    // Log the reset action
    console.log("[Reset] Data reset completed by user:", session.userId);
    console.log("[Reset] Results:", results);

    return NextResponse.json({
      success: true,
      message: "Data berhasil dihapus",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Reset] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data" },
      { status: 500 },
    );
  }
}

// GET endpoint to check current data counts
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get D1 binding
    let db: D1Database;
    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as { DB?: D1Database };

      if (!env?.DB) {
        return NextResponse.json(
          { error: "Database tidak tersedia" },
          { status: 503 },
        );
      }

      db = env.DB;
    } catch (error) {
      console.error("[Reset] Error getting D1 binding:", error);
      return NextResponse.json(
        { error: "Database tidak tersedia" },
        { status: 503 },
      );
    }

    // Get counts for all tables
    const tables = [
      "students",
      "monthly_journals",
      "meeting_logs",
      "interventions",
      "student_social_usages",
    ];

    const counts: Record<string, number> = {};

    for (const table of tables) {
      try {
        const result = await db
          .prepare(`SELECT COUNT(*) as count FROM ${table}`)
          .first();
        counts[table] = (result?.count as number) || 0;
      } catch (error) {
        console.error(`[Reset] Error counting ${table}:`, error);
        counts[table] = -1;
      }
    }

    return NextResponse.json({
      success: true,
      counts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Reset] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data" },
      { status: 500 },
    );
  }
}
