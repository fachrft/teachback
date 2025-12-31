"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { getStudentDetailedStats } from "../../_action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  ArrowLeft,
  GraduationCap,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ classId: string; studentId: string }>;
}) {
  const { classId, studentId } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setIsLoading(true);
      const res = await getStudentDetailedStats(classId, studentId);
      setData(res);
      setIsLoading(false);
    }
    fetch();
  }, [classId, studentId]);

  if (isLoading) {
    return (
      <div className="space-y-8 pt-4 pb-10 mx-auto max-w-5xl">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" /> {/* Back Button */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card text-card-foreground shadow-sm"
            >
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="p-6 pt-0">
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Activity Timeline Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-40 flex items-center gap-2" />

          <div className="grid gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 w-full">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  </div>
                  <div className="pl-4">
                    <Skeleton className="h-8 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center">Data siswa tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-8 pt-4 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/guru/results?classId=${classId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.student.name}`}
            />
            <AvatarFallback>{data.student.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{data.student.name}</h1>
            <p className="text-muted-foreground">{data.student.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Nilai
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.avgScore}</div>
            <p className="text-xs text-muted-foreground">
              Dari aktivitas yang dinilai
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.teachbackCount}
              <span className="text-sm font-normal text-muted-foreground">
                /{data.stats.totalTeachbackAvailable}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Sesi terselesaikan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuis</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.quizCount}
              <span className="text-sm font-normal text-muted-foreground">
                /{data.stats.totalQuizAvailable}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Kuis dikerjakan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.assignmentCount}
              <span className="text-sm font-normal text-muted-foreground">
                /{data.stats.totalAssignmentAvailable}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Tugas dikumpulkan</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Riwayat Aktivitas
        </h2>

        {data.activities.length === 0 ? (
          <div className="text-muted-foreground text-center py-10 bg-muted/20 rounded-lg">
            Belum ada aktivitas yang terekam.
          </div>
        ) : (
          <div className="grid gap-3">
            {data.activities.map((activity: any, i: number) => {
              let icon;
              let badgeVariant: "default" | "secondary" | "outline" = "outline";

              if (activity.type === "Teachback") {
                icon = <MessageSquare className="h-4 w-4 text-blue-500" />;
                badgeVariant = "default";
              } else if (activity.type === "Kuis") {
                icon = <CheckCircle className="h-4 w-4 text-green-500" />;
                badgeVariant = "secondary";
              } else {
                icon = <FileText className="h-4 w-4 text-amber-500" />;
                badgeVariant = "outline";
              }

              return (
                <Card
                  key={i}
                  className="hover:bg-muted/50 transition-colors border-l-4 border-l-transparent hover:border-l-primary"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-background p-2 rounded-full shadow-sm border">
                        {icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={badgeVariant}
                            className="text-[10px] h-5 px-1.5"
                          >
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.updatedAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <p className="font-medium text-sm md:text-base">
                          {activity.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.score !== null ? (
                        <div
                          className={`text-lg font-bold ${
                            activity.score >= 70
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {activity.score}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
