// API Route: /api/journals
// Last updated: 2025-10-19 - Integrated with Cloudflare D1 database

import type { D1Database } from "@cloudflare/workers-types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

interface JournalRow {
  id: string;
  student_id: string;
  monitoring_period: string;
  academic_desc: string | null;
  academic_follow_up: string | null;
  academic_notes: string | null;
  character_desc: string | null;
  character_follow_up: string | null;
  character_notes: string | null;
  social_emotional_desc: string | null;
  social_emotional_follow_up: string | null;
  social_emotional_notes: string | null;
  discipline_desc: string | null;
  discipline_follow_up: string | null;
  discipline_notes: string | null;
  potential_interest_desc: string | null;
  potential_interest_follow_up: string | null;
  potential_interest_notes: string | null;
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

function mapRowToJournal(row: JournalRow) {
  return {
    id: row.id,
    studentId: row.student_id,
    monitoringPeriod: row.monitoring_period,
    academicDesc: row.academic_desc,
    academicFollowUp: row.academic_follow_up,
    academicNotes: row.academic_notes,
    characterDesc: row.character_desc,
    characterFollowUp: row.character_follow_up,
    characterNotes: row.character_notes,
    socialEmotionalDesc: row.social_emotional_desc,
    socialEmotionalFollowUp: row.social_emotional_follow_up,
    socialEmotionalNotes: row.social_emotional_notes,
    disciplineDesc: row.discipline_desc,
    disciplineFollowUp: row.discipline_follow_up,
    disciplineNotes: row.discipline_notes,
    potentialInterestDesc: row.potential_interest_desc,
    potentialInterestFollowUp: row.potential_interest_follow_up,
    potentialInterestNotes: row.potential_interest_notes,
    createdAt: row.created_at,
  };
}

/**
 * POST /api/journals
 * Create new monthly journal
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    if (!body.studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 },
      );
    }

    if (!body.monitoringPeriod) {
      return NextResponse.json(
        { error: "monitoringPeriod is required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newJournal = {
      id,
      studentId: body.studentId as string,
      monitoringPeriod: body.monitoringPeriod as string,
      academicDesc: body.academicDesc || null,
      academicFollowUp: body.academicFollowUp || null,
      academicNotes: body.academicNotes || null,
      characterDesc: body.characterDesc || null,
      characterFollowUp: body.characterFollowUp || null,
      characterNotes: body.characterNotes || null,
      socialEmotionalDesc: body.socialEmotionalDesc || null,
      socialEmotionalFollowUp: body.socialEmotionalFollowUp || null,
      socialEmotionalNotes: body.socialEmotionalNotes || null,
      disciplineDesc: body.disciplineDesc || null,
      disciplineFollowUp: body.disciplineFollowUp || null,
      disciplineNotes: body.disciplineNotes || null,
      potentialInterestDesc: body.potentialInterestDesc || null,
      potentialInterestFollowUp: body.potentialInterestFollowUp || null,
      potentialInterestNotes: body.potentialInterestNotes || null,
      createdAt: now,
    };

    await db
      .prepare(
        `INSERT INTO monthly_journals (
          id, student_id, monitoring_period,
          academic_desc, academic_follow_up, academic_notes,
          character_desc, character_follow_up, character_notes,
          social_emotional_desc, social_emotional_follow_up, social_emotional_notes,
          discipline_desc, discipline_follow_up, discipline_notes,
          potential_interest_desc, potential_interest_follow_up, potential_interest_notes,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        newJournal.id,
        newJournal.studentId,
        newJournal.monitoringPeriod,
        newJournal.academicDesc,
        newJournal.academicFollowUp,
        newJournal.academicNotes,
        newJournal.characterDesc,
        newJournal.characterFollowUp,
        newJournal.characterNotes,
        newJournal.socialEmotionalDesc,
        newJournal.socialEmotionalFollowUp,
        newJournal.socialEmotionalNotes,
        newJournal.disciplineDesc,
        newJournal.disciplineFollowUp,
        newJournal.disciplineNotes,
        newJournal.potentialInterestDesc,
        newJournal.potentialInterestFollowUp,
        newJournal.potentialInterestNotes,
        newJournal.createdAt,
      )
      .run();

    return NextResponse.json({
      success: true,
      journal: newJournal,
    });
  } catch (error) {
    console.error("Create journal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/journals
 * List all journals for authenticated user
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
      "SELECT id, student_id, monitoring_period, academic_desc, academic_follow_up, academic_notes, character_desc, character_follow_up, character_notes, social_emotional_desc, social_emotional_follow_up, social_emotional_notes, discipline_desc, discipline_follow_up, discipline_notes, potential_interest_desc, potential_interest_follow_up, potential_interest_notes, created_at FROM monthly_journals WHERE 1 = 1";
    const bindings: Array<string> = [];

    if (studentId) {
      query += " AND student_id = ?";
      bindings.push(studentId);
    }

    query += " ORDER BY created_at DESC";

    const result = await db
      .prepare(query)
      .bind(...bindings)
      .all<JournalRow>();

    return NextResponse.json({
      success: true,
      journals: (result.results || []).map(mapRowToJournal),
    });
  } catch (error) {
    console.error("Get journals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
