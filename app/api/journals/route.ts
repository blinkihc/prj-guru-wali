// API Route: /api/journals
// Handle MonthlyJournal CRUD operations
// Created: 2025-01-14
// Updated: 2025-10-15 - MVP v1.0.0 clean version

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

// MVP v1.0.0: Start with empty data - users create their own
const mockJournals: Array<{
  id: string;
  studentId: string;
  monitoringPeriod: string;
  academicDesc: string | null;
  academicFollowUp: string | null;
  academicNotes: string | null;
  characterDesc: string | null;
  characterFollowUp: string | null;
  characterNotes: string | null;
  socialEmotionalDesc: string | null;
  socialEmotionalFollowUp: string | null;
  socialEmotionalNotes: string | null;
  disciplineDesc: string | null;
  disciplineFollowUp: string | null;
  disciplineNotes: string | null;
  potentialInterestDesc: string | null;
  potentialInterestFollowUp: string | null;
  potentialInterestNotes: string | null;
  createdAt: string;
}> = [];

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

    const body = (await request.json()) as any;

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

    const newJournal = {
      id: `journal-${Date.now()}`,
      studentId: body.studentId,
      monitoringPeriod: body.monitoringPeriod,
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
      createdAt: new Date().toISOString(),
    };

    mockJournals.push(newJournal);

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

    let filtered = mockJournals;
    if (studentId) {
      filtered = mockJournals.filter((j) => j.studentId === studentId);
    }

    return NextResponse.json({
      success: true,
      journals: filtered,
    });
  } catch (error) {
    console.error("Get journals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
