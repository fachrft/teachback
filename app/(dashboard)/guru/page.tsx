"use client";

import { useEffect, useState } from "react";
import { getTeacherDashboardStats } from "./_action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Book,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import DashboardSkeleton from "./loading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

interface DashboardData {
  totalClasses: number;
  totalStudents: number;
  pendingReviews: number;
  recentPendingReviews: any[];
  classStats: any[];
}

export default function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getTeacherDashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return <div className="p-8">Gagal memuat data dashboard.</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full fade-in-50">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Guru</h1>
        <p className="text-muted-foreground mt-2">
          Ringkasan aktivitas pembelajaran dan kelas Anda.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalClasses}
            </div>
            <p className="text-xs text-muted-foreground">Kelas aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Siswa di seluruh kelas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Review Tertunda
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.pendingReviews}
            </div>
            <p className="text-xs text-muted-foreground">
              Teachback menunggu review
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Reviews List */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Perlu Review Segera</CardTitle>
            <CardDescription>
              Submission teachback terbaru yang belum dinilai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentPendingReviews.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="Semua bersih!"
                  description="Tidak ada review yang tertunda saat ini."
                />
              ) : (
                dashboardData.recentPendingReviews.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                        {item.studentName?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.topic} • {item.className}
                        </p>
                      </div>
                    </div>
                    {/* Note: Link logic simplified, ideally fetch full details */}
                    <Link href={`/guru/kelas/${item.kelasId}/materi/${item.materiId}/siswa/${item.studentId}`}>
                      <Button size="sm" variant="outline">
                        Review
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Class Attention Needed (Replacing Quick Access) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Monitoring Tugas
            </CardTitle>
            <CardDescription>
              Kelas dengan siswa belum tuntas terbanyak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.classStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-3 opacity-20" />
                  <p>Semua kelas aman! 🎉</p>
                  <p className="text-xs mt-1">
                    Tidak ada tunggakan tugas yang signifikan.
                  </p>
                </div>
              ) : (
                dashboardData.classStats.map((c: any) => (
                  <div key={c.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {c.incompleteCount} siswa belum tuntas
                      </div>
                    </div>
                    {/* Progress bar visual: Incomplete / Total Students */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            (c.incompleteCount /
                              (Number(c.studentCount) || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Link href="/guru/results">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-primary"
                >
                  Lihat Detail Hasil Siswa{" "}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
