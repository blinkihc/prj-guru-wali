// Login API route (Edge runtime compatible using bcryptjs)
// Latest update: 2025-11-06 - Replace hash-wasm with bcryptjs (WebAssembly not allowed in Cloudflare Workers)

import type { D1Database } from "@cloudflare/workers-types";
import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

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
    type LoginEnv = { DB?: D1Database };
    let env: LoginEnv | undefined;
    try {
      const requestContextModule = (await import(
        "@cloudflare/next-on-pages"
      )) as {
        getRequestContext: () => { env?: LoginEnv };
      };
      const ctx = requestContextModule.getRequestContext();
      env = ctx?.env;

      if (!env?.DB) {
        console.error("[Login] D1 binding not found in request context");
        return NextResponse.json(
          { error: "Database tidak tersedia" },
          { status: 503 },
        );
      }

      console.log("[Login] Got D1 binding from request context");
    } catch (error) {
      console.error("[Login] Error getting request context:", error);
      return NextResponse.json(
        { error: "Database tidak tersedia" },
        { status: 503 },
      );
    }

    console.log("[Login] Using raw SQL lookup version 2");

    // Find user by email using raw SQL to avoid Drizzle ORM quote issues
    const database = env.DB;
    const result = await database
      .prepare(
        "SELECT id, email, hashed_password, full_name, nip_nuptk, created_at FROM users WHERE email = ? LIMIT 1",
      )
      .bind(email.toLowerCase())
      .first();

    if (!result) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Map snake_case to camelCase
    const user = {
      id: result.id as string,
      email: result.email as string,
      hashedPassword: result.hashed_password as string,
      fullName: result.full_name as string,
      nipNuptk: result.nip_nuptk as string | null,
      createdAt: result.created_at as string,
    };

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

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
