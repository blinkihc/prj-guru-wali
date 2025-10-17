// Main layout with AppShell
// Last updated: 2025-10-17
// Added auth protection

import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout";
import { getCurrentUser } from "@/lib/auth/session";

// Force dynamic rendering because we use cookies for session
export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Protect all routes in (main) group - redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
