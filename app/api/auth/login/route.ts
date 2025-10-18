// Login API route
// Last updated: 2025-10-16

import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { users } from "@/drizzle/schema";
import { createSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 },
      );
    }

    // Get D1 binding directly from Cloudflare Pages context
    let db: any;
    try {
      // @ts-expect-error
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;

      if (!env?.DB) {
        console.error("[Login] D1 binding not found in request context");
        return NextResponse.json(
          { error: "Database tidak tersedia" },
          { status: 503 },
        );
      }

      console.log("[Login] Got D1 binding from request context");
      db = getDb(env.DB);
    } catch (error) {
      console.error("[Login] Error getting request context:", error);
      return NextResponse.json(
        { error: "Database tidak tersedia" },
        { status: 503 },
      );
    }

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
    await createSession(
      user.id,
      user.email,
      user.fullName,
      user.nipNuptk || undefined,
    );

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
