// Dashboard Stats API - Get dashboard statistics
// Returns: student counts, assessment stats, meeting counts
// Last updated: 2025-10-17

import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { meetingLogs, monthlyJournals, students } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";

export const runtime = "edge";

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for current user
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get D1 binding
    try {
      // @ts-ignore - Cloudflare context not available in types
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;

      if (!env?.DB) {
        // Local dev fallback - return empty stats
        console.warn(
          "[DashboardStats] Running in local dev mode - returning empty stats",
        );
        return NextResponse.json({
          totalStudents: 0,
          studentsAssessed: 0,
          studentsNotAssessed: 0,
          assessmentPercentage: 0,
          totalMeetings: 0,
          meetingsThisWeek: 0,
          meetingsThisMonth: 0,
        });
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
      // Need to join with students table to filter by userId
      const studentsWithJournals = await db
        .select({ studentId: monthlyJournals.studentId })
        .from(monthlyJournals)
        .innerJoin(students, eq(monthlyJournals.studentId, students.id))
        .where(eq(students.userId, session.userId));

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
      // Need to join with students table to filter by userId
      const allMeetings = await db
        .select({
          id: meetingLogs.id,
          meetingDate: meetingLogs.meetingDate,
        })
        .from(meetingLogs)
        .innerJoin(students, eq(meetingLogs.studentId, students.id))
        .where(eq(students.userId, session.userId));

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
      console.error("[DashboardStats] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch statistics" },
        { status: 500 },
      );
    }
  } catch (_error) {
    // Cloudflare context not available (local dev)
    console.warn(
      "[DashboardStats] Cloudflare context not available - returning empty stats",
    );
    return NextResponse.json({
      totalStudents: 0,
      studentsAssessed: 0,
      studentsNotAssessed: 0,
      assessmentPercentage: 0,
      totalMeetings: 0,
      meetingsThisWeek: 0,
      meetingsThisMonth: 0,
    });
  }
}
