// API Route: /api/interventions/[id]
// Handle individual intervention operations
// Created: 2025-01-14

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const runtime = "edge";

// Mock data - empty for MVP v1.0.0 (each route maintains its own)
const mockInterventions: Array<{
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
}> = [];

/**
 * GET /api/interventions/[id]
 * Get single intervention by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find intervention in mock data
    const intervention = mockInterventions.find((i) => i.id === id);

    if (!intervention) {
      return NextResponse.json(
        { error: "Intervention not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ intervention });
  } catch (error) {
    console.error("GET /api/interventions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch intervention" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/interventions/[id]
 * Update intervention by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as any;

    // Find intervention in mock data
    const interventionIndex = mockInterventions.findIndex((i) => i.id === id);

    if (interventionIndex === -1) {
      return NextResponse.json(
        { error: "Intervention not found" },
        { status: 404 },
      );
    }

    // Update intervention data
    if (body.title !== undefined)
      mockInterventions[interventionIndex].title = body.title;
    if (body.issue !== undefined)
      mockInterventions[interventionIndex].issue = body.issue;
    if (body.goal !== undefined)
      mockInterventions[interventionIndex].goal = body.goal;
    if (body.actionSteps !== undefined)
      mockInterventions[interventionIndex].actionSteps = body.actionSteps;
    if (body.status !== undefined)
      mockInterventions[interventionIndex].status = body.status;
    if (body.startDate !== undefined)
      mockInterventions[interventionIndex].startDate = body.startDate;
    if (body.endDate !== undefined)
      mockInterventions[interventionIndex].endDate = body.endDate || null;
    if (body.notes !== undefined)
      mockInterventions[interventionIndex].notes = body.notes || null;

    mockInterventions[interventionIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({
      intervention: mockInterventions[interventionIndex],
      message: "Intervention updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/interventions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update intervention" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/interventions/[id]
 * Delete intervention by ID
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find intervention in mock data
    const interventionIndex = mockInterventions.findIndex((i) => i.id === id);

    if (interventionIndex === -1) {
      return NextResponse.json(
        { error: "Intervention not found" },
        { status: 404 },
      );
    }

    // Delete intervention
    mockInterventions.splice(interventionIndex, 1);

    return NextResponse.json({ message: "Intervention deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/interventions/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete intervention" },
      { status: 500 },
    );
  }
}
