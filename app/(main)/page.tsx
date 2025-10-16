// Dashboard page - Home/Overview
// Last updated: 2025-10-17
// Added setup banner check
// Added EnhancedCard for better interactivity
// Added Skeleton loading states

"use client";

import { BookOpen, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SetupBanner } from "@/components/dashboard/setup-banner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(true); // Default true to avoid flash

  // Check if user has completed setup
  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch("/api/profile/check");
        if (response.ok) {
          const data = (await response.json()) as { hasProfile?: boolean };
          setHasProfile(data.hasProfile ?? true);
        }
      } catch (error) {
        console.error("Error checking setup:", error);
        // On error, assume has profile to avoid showing banner incorrectly
        setHasProfile(true);
      } finally {
        setIsLoading(false);
      }
    }

    checkSetup();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Guru Wali Digital Companion
        </p>
      </div>

      {/* Setup Banner - Show if user hasn't completed setup */}
      {!isLoading && !hasProfile && <SetupBanner />}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <SkeletonCard />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <SkeletonCard />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <SkeletonCard />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <SkeletonCard />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <EnhancedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Siswa
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Siswa yang diampu
                </p>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Jurnal Bulan Ini
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Catatan perkembangan
                </p>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pertemuan Minggu Ini
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Log pertemuan</p>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Progress Bulan Ini
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">Dari target</p>
              </CardContent>
            </EnhancedCard>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mulai dengan menambahkan data siswa atau membuat jurnal bulanan
            pertama Anda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
