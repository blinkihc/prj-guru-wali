// Login API route
// Last updated: 2025-10-12

import { type NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 },
      );
    }

    // TODO: In production, get D1 binding from getRequestContext()
    // For MVP demo, use hardcoded credentials
    const DEMO_USER = {
      id: "demo-user-001",
      email: "guru@example.com",
      password: "password123",
      fullName: "Ibu Siti Rahayu",
    };

    // Check email
    if (email.toLowerCase() !== DEMO_USER.email) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Check password (direct match for demo, in production use bcrypt)
    if (password !== DEMO_USER.password) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Create session
    await createSession(DEMO_USER.id, DEMO_USER.email, DEMO_USER.fullName);

    return NextResponse.json({
      success: true,
      user: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        fullName: DEMO_USER.fullName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 },
    );
  }
}
