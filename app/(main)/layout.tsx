// Main layout with AppShell
// Last updated: 2025-11-06
// Added auth protection and PWA install component

import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout";
import { PWAInstall } from "@/components/pwa/pwa-install";
import { getCurrentUser } from "@/lib/auth/session";

// Force dynamic rendering because we use cookies for session
export const dynamic = "force-dynamic";

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

  return (
    <>
      <AppShell user={user}>{children}</AppShell>
      <PWAInstall />
    </>
  );
}
