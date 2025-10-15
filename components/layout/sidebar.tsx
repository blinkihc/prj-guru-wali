// Sidebar component - Main navigation
// Last updated: 2025-10-12

"use client";

import {
  BarChart3,
  BookOpen,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Data Siswa",
    href: "/students",
    icon: Users,
  },
  {
    title: "Jurnal Bulanan",
    href: "/journals",
    icon: BookOpen,
  },
  {
    title: "Log Pertemuan",
    href: "/meetings",
    icon: MessageSquare,
  },
  {
    title: "Laporan",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-background",
        className,
      )}
    >
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-secondary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Guru Wali Digital Companion
        </p>
        <p className="text-xs text-muted-foreground">v0.1.0 - MVP</p>
      </div>
    </aside>
  );
}
