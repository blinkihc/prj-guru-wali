// Main layout with AppShell
// Last updated: 2025-10-13

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

  return <AppShell user={user || undefined}>{children}</AppShell>;
}
