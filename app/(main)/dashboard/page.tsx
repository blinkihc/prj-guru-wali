// Dashboard page - Home/Overview
// Last updated: 2025-11-06
// - Fixed: Proper route at /dashboard
// - Shows stats, charts, and setup banner
// - Real-time data with refresh functionality

"use client";

export const runtime = "edge";

import {
  BookOpen,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { SetupBanner } from "@/components/dashboard/setup-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { SkeletonCard } from "@/components/ui/skeleton";

// Lazy load chart components to reduce initial bundle size
const AssessmentChart = dynamic(
  () => import("@/components/dashboard/assessment-chart"),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Status Penilaian Siswa</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="h-full animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    ),
  },
);

const MeetingsChart = dynamic(
  () => import("@/components/dashboard/meetings-chart"),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Statistik Pertemuan</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="h-full animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    ),
  },
);

interface DashboardStats {
  totalStudents: number;
  studentsAssessed: number;
  studentsNotAssessed: number;
  assessmentPercentage: number;
  totalMeetings: number;
  meetingsThisWeek: number;
  meetingsThisMonth: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);

      // Fetch setup status and stats in parallel
      const [profileRes, statsRes] = await Promise.all([
        fetch("/api/profile/check"),
        fetch("/api/dashboard/stats"),
      ]);

      if (profileRes.ok) {
        const profileData = (await profileRes.json()) as {
          hasProfile?: boolean;
        };
        setHasProfile(profileData.hasProfile ?? true);
      }

      if (statsRes.ok) {
        const statsData = (await statsRes.json()) as DashboardStats;
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang di Guru Wali Digital Companion
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
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
                <div className="text-2xl font-bold">
                  {stats?.totalStudents ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Siswa yang diampu
                </p>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Siswa Dinilai
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.studentsAssessed ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Punya jurnal penilaian
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
                <div className="text-2xl font-bold">
                  {stats?.meetingsThisWeek ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Log pertemuan</p>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Progress Penilaian
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.assessmentPercentage ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">Siswa dinilai</p>
              </CardContent>
            </EnhancedCard>
          </>
        )}
      </div>

      {/* Charts */}
      {!isLoading && stats && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Assessment Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Status Penilaian Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <AssessmentChart
                assessed={stats.studentsAssessed}
                notAssessed={stats.studentsNotAssessed}
                percentage={stats.assessmentPercentage}
              />
            </CardContent>
          </Card>

          {/* Meetings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik Pertemuan</CardTitle>
            </CardHeader>
            <CardContent>
              <MeetingsChart
                totalMeetings={stats.totalMeetings}
                meetingsThisWeek={stats.meetingsThisWeek}
                meetingsThisMonth={stats.meetingsThisMonth}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
