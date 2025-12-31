"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  BrainCircuit,
  FileText,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { getStudentDashboardData, DashboardData } from "./_actions/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function StudentDashboardPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard", href: "/siswa" }]);

    getStudentDashboardData()
      .then((res) => setData(res))
      .catch((err) => {
        console.error(err);
        toast.error("Gagal memuat data dashboard.");
      })
      .finally(() => setLoading(false));
  }, [setBreadcrumbs]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pt-4 md:p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Halo, {data?.userName?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Siap untuk belajar hal baru hari ini? Cek tugasmu di bawah ini ya.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelas Aktif</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeClassesCount}</div>
            <p className="text-xs text-muted-foreground">Kelas yang diikuti</p>
          </CardContent>
        </Card>
        <Card
          className={
            data?.pendingTasksCount
              ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
              : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tugas Menunggu
            </CardTitle>
            <Clock
              className={`h-4 w-4 ${
                data?.pendingTasksCount
                  ? "text-amber-600"
                  : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data?.pendingTasksCount
                  ? "text-amber-700 dark:text-amber-500"
                  : ""
              }`}
            >
              {data?.pendingTasksCount}
            </div>
            <p className="text-xs text-muted-foreground">Perlu diselesaikan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.completedTasksCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Materi & Tugas tuntas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Main Content: Pending Tasks */}
        <Card className="md:col-span-4 border-none shadow-none md:border md:shadow-sm">
          <CardHeader>
            <CardTitle>Lanjutkan Belajar</CardTitle>
            <CardDescription>
              Daftar tugas, kuis, dan materi teachback yang belum kamu
              selesaikan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.pendingTasks || data.pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg border border-dashed">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900">
                  Wah, Kosong!
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mt-1">
                  Kamu sudah menyelesaikan semua tugas saat ini. Keren banget!
                  🎉
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/siswa/kelas">Cari Materi Lain</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.pendingTasks.map((task, i) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-slate-50 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          task.type === "teachback"
                            ? "bg-purple-100 text-purple-600"
                            : task.type === "quiz"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {task.type === "teachback" && (
                          <BrainCircuit className="h-5 w-5" />
                        )}
                        {task.type === "quiz" && (
                          <ClipboardList className="h-5 w-5" />
                        )}
                        {task.type === "assignment" && (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold line-clamp-1">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 font-normal"
                          >
                            {task.className}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {task.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="w-full sm:w-auto" asChild>
                      <Link href={task.url}>
                        Kerjakan <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pt-4 md:p-4 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-7">
        <Skeleton className="md:col-span-4 h-96 rounded-xl" />
        <div className="md:col-span-3 space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
