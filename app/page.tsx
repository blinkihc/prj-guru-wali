// Root page redirect handler
// Created: 2025-10-18
// Fixes production issue where / returns image/x-icon instead of HTML
// This page ensures proper HTML response and redirects based on auth

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Root page handler.
 *
 * IMPORTANT: This file MUST exist to prevent Cloudflare Pages from
 * serving favicon as root route (content-type: image/x-icon bug).
 *
 * Without this file, accessing / returns the favicon image instead of HTML,
 * breaking the entire app for users landing on homepage.
 */
export default async function RootPage() {
  // Check authentication
  const user = await getCurrentUser();

  // Redirect based on authentication
  if (user) {
    // User is authenticated - redirect to students page
    // (We can't use / because this file IS /, would cause infinite loop)
    // TODO: Refactor route structure to use (main)/page.tsx at root
    redirect("/students");
  } else {
    // User not authenticated - redirect to login
    redirect("/login");
  }
}
