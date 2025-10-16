// Login API route
// Last updated: 2025-10-16

import { type NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/drizzle/schema";
import { createSession } from "@/lib/auth/session";
import { getCloudflareEnv } from "@/lib/cloudflare";

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

    // Get D1 binding from Cloudflare environment
    const env = getCloudflareEnv();
    if (!env?.DB) {
      console.error("D1 database binding not found");
      return NextResponse.json(
        { error: "Database tidak tersedia" },
        { status: 503 },
      );
    }

    // Get database instance
    const db = getDb(env.DB);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Verify password with bcrypt
    const isPasswordValid = await compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Create session
    await createSession(user.id, user.email, user.fullName);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
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
