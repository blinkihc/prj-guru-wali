// API Route: /api/meetings
// Last updated: 2025-10-19 - Integrated with Cloudflare D1 database

import type { D1Database } from "@cloudflare/workers-types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

interface MeetingRow {
  id: string;
  student_id: string;
  meeting_date: string;
  topic: string;
  follow_up: string | null;
  notes: string | null;
  created_at: string;
}

async function getDatabase(): Promise<D1Database> {
  const { getRequestContext } = await import("@cloudflare/next-on-pages");
  const ctx = getRequestContext();
  const env = ctx?.env as { DB?: D1Database } | undefined;

  if (!env?.DB) {
    throw new Error("Database unavailable");
  }

  return env.DB;
}

function mapRowToMeeting(row: MeetingRow) {
  return {
    id: row.id,
    studentId: row.student_id,
    meetingDate: row.meeting_date,
    topic: row.topic,
    followUp: row.follow_up,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

/**
 * POST /api/meetings
 * Create new meeting log
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.studentId !== "string" || body.studentId.trim() === "") {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 },
      );
    }

    if (
      typeof body.meetingDate !== "string" ||
      body.meetingDate.trim() === ""
    ) {
      return NextResponse.json(
        { error: "meetingDate is required" },
        { status: 400 },
      );
    }

    if (typeof body.topic !== "string" || body.topic.trim() === "") {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const db = await getDatabase();

    const student = await db
      .prepare("SELECT user_id FROM students WHERE id = ? LIMIT 1")
      .bind(body.studentId)
      .first<{ user_id: string }>();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.user_id !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const meeting = {
      id: crypto.randomUUID(),
      studentId: body.studentId.trim(),
      meetingDate: body.meetingDate.trim(),
      topic: body.topic.trim(),
      followUp:
        typeof body.followUp === "string" && body.followUp.trim() !== ""
          ? body.followUp.trim()
          : null,
      notes:
        typeof body.notes === "string" && body.notes.trim() !== ""
          ? body.notes.trim()
          : null,
      createdAt: new Date().toISOString(),
    };

    await db
      .prepare(
        `INSERT INTO meeting_logs (
          id, student_id, meeting_date, topic, follow_up, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        meeting.id,
        meeting.studentId,
        meeting.meetingDate,
        meeting.topic,
        meeting.followUp,
        meeting.notes,
        meeting.createdAt,
      )
      .run();

    return NextResponse.json(
      {
        message: "Meeting log created successfully",
        meeting,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/meetings error:", error);
    return NextResponse.json(
      { error: "Failed to create meeting log" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/meetings
 * Get all meeting logs or filter by studentId
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const db = await getDatabase();

    let query =
      "SELECT m.id, m.student_id, m.meeting_date, m.topic, m.follow_up, m.notes, m.created_at FROM meeting_logs m INNER JOIN students s ON s.id = m.student_id WHERE s.user_id = ?";
    const bindings: Array<string> = [session.userId];

    if (studentId) {
      query += " AND m.student_id = ?";
      bindings.push(studentId);
    }

    query += " ORDER BY m.meeting_date DESC, m.created_at DESC";

    const result = await db
      .prepare(query)
      .bind(...bindings)
      .all<MeetingRow>();

    return NextResponse.json({
      meetings: (result.results || []).map(mapRowToMeeting),
    });
  } catch (error) {
    console.error("GET /api/meetings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 },
    );
  }
}
