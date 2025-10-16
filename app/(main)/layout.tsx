// Main layout with AppShell
// Last updated: 2025-10-17
// Added setup check - redirect to /setup if user hasn't completed setup

import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { schoolProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// Force dynamic rendering because we use cookies for session
export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Check if user has completed setup
  if (user) {
    try {
      // @ts-ignore
      const { getRequestContext } = await import("@cloudflare/next-on-pages");
      const ctx = getRequestContext();
      const env = ctx?.env as any;
      
      if (env?.DB) {
        const db = getDb(env.DB);
        const [profile] = await db
          .select()
          .from(schoolProfiles)
          .where(eq(schoolProfiles.userId, user.id))
          .limit(1);

        // If no profile found, redirect to setup
        if (!profile) {
          redirect("/setup");
        }
      }
    } catch (error) {
      console.error("[MainLayout] Error checking setup:", error);
    }
  }

  return <AppShell user={user || undefined}>{children}</AppShell>;
}
