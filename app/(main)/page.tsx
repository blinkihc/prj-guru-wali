// Dashboard page - Home/Overview
// Last updated: 2025-10-14
// Added EnhancedCard for better interactivity
// Added Skeleton loading states

"use client";

import { BookOpen, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Guru Wali Digital Companion
        </p>
      </div>

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
