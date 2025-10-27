// API Route: /api/reports
// Get list of generated reports (semester and individual)
// Created: 2025-10-17

import type { D1Database } from "@cloudflare/workers-types";
import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { meetingLogs, monthlyJournals, students } from "@/drizzle/schema";
import { getSession } from "@/lib/auth/session";
import { type Database, getDb } from "@/lib/db/client";

export const runtime = "edge";

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get D1 binding (with fallback for local dev)
    let db: Database | undefined;
    try {
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as { DB?: D1Database } | undefined;

      if (!env?.DB) {
        // Local dev fallback - return empty data
        console.warn(
          "[Reports] Running in local dev mode - returning empty data",
        );
        return NextResponse.json({
          semesterReports: [],
          individualReports: [],
        });
      }

      db = getDb(env.DB);
    } catch (_error) {
      // Local dev or getRequestContext not available
      console.warn(
        "[Reports] Cloudflare context not available - returning empty data",
      );
      return NextResponse.json({
        semesterReports: [],
        individualReports: [],
      });
    }

    // Fetch students for individual reports
    const database = db;
    if (!database) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 },
      );
    }

    const allStudents = await database
      .select()
      .from(students)
      .where(eq(students.userId, session.userId));

    // Get journals for all students
    const studentIds = allStudents.map((s) => s.id);
    const allJournals =
      studentIds.length > 0
        ? await database
            .select()
            .from(monthlyJournals)
            .where(
              sql`${monthlyJournals.studentId} IN (${sql.join(
                studentIds.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            )
        : [];

    // Get meetings for all students
    const allMeetings =
      studentIds.length > 0
        ? await database
            .select()
            .from(meetingLogs)
            .where(
              sql`${meetingLogs.studentId} IN (${sql.join(
                studentIds.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            )
        : [];

    // Build individual reports (one per student with data)
    const individualReports = allStudents
      .filter((student) => {
        // Only include students with journals or meetings
        const hasJournals = allJournals.some((j) => j.studentId === student.id);
        const hasMeetings = allMeetings.some((m) => m.studentId === student.id);
        return hasJournals || hasMeetings;
      })
      .map((student) => {
        const studentJournals = allJournals.filter(
          (j) => j.studentId === student.id,
        );
        const studentMeetings = allMeetings.filter(
          (m) => m.studentId === student.id,
        );

        // Get latest journal for periode
        const latestJournal = studentJournals.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];

        return {
          id: student.id,
          studentId: student.id,
          studentName: student.fullName,
          classroom: student.classroom || "-",
          periode: latestJournal?.monitoringPeriod || "Semua Periode",
          totalJournals: studentJournals.length,
          totalMeetings: studentMeetings.length,
          fileSize:
            15000 + studentJournals.length * 500 + studentMeetings.length * 300, // Estimated
          createdAt: new Date().toISOString(),
        };
      });

    // Build semester reports (group by semester/tahun ajaran)
    // For now, create one report for current academic year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const isGanjil = currentMonth >= 7 && currentMonth <= 12;

    const semesterReports =
      allStudents.length > 0
        ? [
            {
              id: "semester-current",
              title: `Laporan Semester ${isGanjil ? "Ganjil" : "Genap"} ${currentYear}/${currentYear + 1}`,
              semester: isGanjil ? "Ganjil" : "Genap",
              tahunAjaran: `${currentYear}/${currentYear + 1}`,
              periodeStart: isGanjil
                ? `${currentYear}-07-01`
                : `${currentYear + 1}-01-01`,
              periodeEnd: isGanjil
                ? `${currentYear}-12-31`
                : `${currentYear + 1}-06-30`,
              totalStudents: allStudents.length,
              totalJournals: allJournals.length,
              totalMeetings: allMeetings.length,
              fileSize: 50000 + allStudents.length * 2000, // Estimated
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

    return NextResponse.json({
      semesterReports,
      individualReports,
    });
  } catch (error) {
    console.error("[Reports] Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
