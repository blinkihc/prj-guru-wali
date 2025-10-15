// Logout API route
// Last updated: 2025-10-12

import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export const runtime = "edge";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      success: true,
      message: "Berhasil logout",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat logout" },
      { status: 500 },
    );
  }
}
