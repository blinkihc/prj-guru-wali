// Setup API route - Save wizard data
// Last updated: 2025-10-13

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { schoolName, educationStage, cityDistrict, fullName, nipNuptk } =
      body;

    // Validate input
    if (
      !schoolName ||
      !educationStage ||
      !cityDistrict ||
      !fullName ||
      !nipNuptk
    ) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 },
      );
    }

    // TODO: In production, save to D1 database
    // For MVP demo, we'll just return success
    // The actual implementation will:
    // 1. Update users table with fullName and nipNuptk
    // 2. Insert into school_profiles table

    console.log("Setup data received:", {
      userId: currentUser.userId,
      schoolName,
      educationStage,
      cityDistrict,
      fullName,
      nipNuptk,
    });

    return NextResponse.json({
      success: true,
      message: "Setup berhasil disimpan",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data" },
      { status: 500 },
    );
  }
}
