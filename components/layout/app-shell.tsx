// AppShell component - Main application layout wrapper
// Last updated: 2025-10-14
// Desktop: Sidebar navigation
// Mobile/Tablet: AnimatedDock navigation (no burger menu)

"use client";

import { cn } from "@/lib/utils";
import { AnimatedDock } from "./animated-dock";
import { Header } from "./header";
import { navItems, Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    fullName: string;
    email: string;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  // Format navItems for AnimatedDock (render icons)
  const dockItems = navItems.map((item) => ({
    title: item.title,
    href: item.href,
    icon: <item.icon className="h-5 w-5" />,
  }));

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <Header user={user} />

      <div className="flex flex-1">
        {/* Sidebar - Desktop only (≥1024px) */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            "px-6 md:px-8 lg:px-12 py-6",
            "pb-24 lg:pb-6", // Extra padding bottom for dock on mobile/tablet
          )}
        >
          {children}
        </main>
      </div>

      {/* Animated Dock - Mobile/Tablet only (<1024px) */}
      <AnimatedDock items={dockItems} />
    </div>
  );
}
