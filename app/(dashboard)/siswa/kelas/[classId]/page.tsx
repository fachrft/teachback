"use client";

import { useEffect, useState, use } from "react";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { getStudentClassDetail } from "./_action";
import {
  BookOpen,
  CheckCircle,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);
  const { setBreadcrumbs } = useBreadcrumb();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const result = await getStudentClassDetail(classId);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [classId]);

  useEffect(() => {
    if (data?.kelas) {
      setBreadcrumbs([
        { label: "Kelas Saya", href: "/siswa/kelas" },
        { label: data.kelas.name, href: "#" },
      ]);
    }
  }, [setBreadcrumbs, data]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-6">Kelas tidak ditemukan.</div>;

  return (
    <div className="space-y-8 pt-4 md:p-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-500 to-indigo-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0 font-mono mb-4"
          >
            {data.kelas.kode}
          </Badge>
          <h1 className="text-3xl font-bold mb-2">{data.kelas.name}</h1>
          <div className="flex items-center gap-2 text-white/90 font-medium">
            <User className="h-4 w-4" />
            <span>{data.kelas.profile?.name || "Guru"}</span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
          <BookOpen className="h-64 w-64" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Materi Pembelajaran
        </h2>

        {data.materials.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-muted-foreground">
              Belum ada materi di kelas ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.materials.map((m: any) => (
              <Link key={m.id} href={`/siswa/kelas/${classId}/materi/${m.id}`}>
                <Card
                  className="group hover:shadow-md transition-all duration-300 border-slate-200 overflow-hidden cursor-pointer"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left Indicator */}
                      <div className="w-full md:w-2 bg-slate-100 group-hover:bg-primary transition-colors mb-4 md:mb-0" />

                      <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Status Icon */}
                        <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="h-6 w-6" />
                        </div>

                        {/* Content Info */}
                        <div className="flex-1 space-y-2">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {m.name}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {m.flags?.quiz && (
                              <Badge
                                variant="outline"
                                className={`gap-1 ${
                                  m.progress.quiz.status === "Selesai"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-slate-50 text-slate-600"
                                }`}
                              >
                                {m.progress.quiz.status === "Selesai" ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" /> Quiz:{" "}
                                    {m.progress.quiz.score}
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3" /> Quiz: Belum
                                  </>
                                )}
                              </Badge>
                            )}
                            {m.flags?.teachback && (
                              <Badge
                                variant="outline"
                                className={`gap-1 ${
                                  m.progress.teachback.status === "Ditinjau"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-slate-50 text-slate-600"
                                }`}
                              >
                                <MessageSquare className="h-3 w-3" />
                                Teachback: {m.progress.teachback.status}
                              </Badge>
                            )}
                            {m.flags?.assignment && (
                              <Badge
                                variant="outline"
                                className={`gap-1 ${
                                  m.progress.assignment.status === "Dikumpulkan"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-slate-50 text-slate-600"
                                }`}
                              >
                                <FileText className="h-3 w-3" />
                                Tugas: {m.progress.assignment.status}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="self-end md:self-center">
                          <Button
                            variant="ghost"
                            className="gap-2 group-hover:bg-primary group-hover:text-white transition-colors"
                          >
                            Buka Materi <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
