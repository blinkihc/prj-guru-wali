// Dashboard Stats API - Get dashboard statistics
// Returns: student counts, assessment stats, meeting counts
// Last updated: 2025-10-17

import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { students, monthlyJournals, meetingLogs } from "@/drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export const runtime = "edge";

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for current user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get D1 binding
    try {
      // @ts-ignore
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;

      if (!env?.DB) {
        return NextResponse.json(
          { error: "Database tidak tersedia" },
          { status: 503 },
        );
      }

      const db = getDb(env.DB);

      // Get current date info
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-12
      
      // Calculate week start (Monday)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split("T")[0];

      // 1. Total students
      const allStudents = await db
        .select()
        .from(students)
        .where(eq(students.userId, session.userId));

      const totalStudents = allStudents.length;

      // 2. Students with journals (assessed)
      const studentsWithJournals = await db
        .select({ studentId: monthlyJournals.studentId })
        .from(monthlyJournals)
        .where(eq(monthlyJournals.userId, session.userId));

      // Get unique student IDs
      const assessedStudentIds = new Set(
        studentsWithJournals.map((j) => j.studentId),
      );
      const studentsAssessed = assessedStudentIds.size;
      const studentsNotAssessed = totalStudents - studentsAssessed;
      const assessmentPercentage =
        totalStudents > 0
          ? Math.round((studentsAssessed / totalStudents) * 100)
          : 0;

      // 3. Total meetings
      const allMeetings = await db
        .select()
        .from(meetingLogs)
        .where(eq(meetingLogs.userId, session.userId));

      const totalMeetings = allMeetings.length;

      // 4. Meetings this week
      const meetingsThisWeek = allMeetings.filter((m) => {
        return m.meetingDate >= weekStartStr;
      }).length;

      // 5. Meetings this month
      const monthStartStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
      const meetingsThisMonth = allMeetings.filter((m) => {
        return m.meetingDate >= monthStartStr;
      }).length;

      return NextResponse.json({
        totalStudents,
        studentsAssessed,
        studentsNotAssessed,
        assessmentPercentage,
        totalMeetings,
        meetingsThisWeek,
        meetingsThisMonth,
      });
    } catch (error) {
      console.error("[DashboardStats] Error fetching stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch statistics" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[DashboardStats] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
