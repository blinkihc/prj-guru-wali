// API Route: /api/interventions
// Handle Intervention CRUD operations
// Created: 2025-01-14
// Updated: 2025-10-20 - Tambah tipe payload untuk hilangkan any pada handler POST

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

// MVP v1.0.0: Start with empty data - users create their own
interface Intervention {
  id: string;
  studentId: string;
  title: string;
  issue: string;
  goal: string;
  actionSteps: string;
  status: "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InterventionPayload {
  studentId: string;
  title: string;
  issue: string;
  goal: string;
  actionSteps: string;
  status?: Intervention["status"];
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
}

const mockInterventions: Intervention[] = [];

/**
 * POST /api/interventions
 * Create new intervention plan
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<InterventionPayload> | null;

    // Validate required fields
    if (!body?.studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 },
      );
    }

    if (!body.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    if (!body.issue) {
      return NextResponse.json({ error: "issue is required" }, { status: 400 });
    }

    if (!body.goal) {
      return NextResponse.json({ error: "goal is required" }, { status: 400 });
    }

    if (!body.actionSteps) {
      return NextResponse.json(
        { error: "actionSteps is required" },
        { status: 400 },
      );
    }

    if (!body.startDate) {
      return NextResponse.json(
        { error: "startDate is required" },
        { status: 400 },
      );
    }

    // Create intervention
    const intervention = {
      id: `intervention-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: body.studentId,
      title: body.title,
      issue: body.issue,
      goal: body.goal,
      actionSteps: body.actionSteps,
      status: body.status || "active",
      startDate: body.startDate,
      endDate: body.endDate || null,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock storage
    mockInterventions.push(intervention);

    return NextResponse.json(
      {
        message: "Intervention created successfully",
        intervention,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/interventions error:", error);
    return NextResponse.json(
      { error: "Failed to create intervention" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/interventions
 * Get all interventions or filter by studentId/status
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    let interventions = mockInterventions;

    // Filter by studentId if provided
    if (studentId) {
      interventions = interventions.filter((i) => i.studentId === studentId);
    }

    // Filter by status if provided
    if (status) {
      interventions = interventions.filter((i) => i.status === status);
    }

    // Sort by createdAt desc
    interventions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({ interventions });
  } catch (error) {
    console.error("GET /api/interventions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interventions" },
      { status: 500 },
    );
  }
}
