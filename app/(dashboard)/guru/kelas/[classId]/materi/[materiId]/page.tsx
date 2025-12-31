"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useEffect, useState, use } from "react";
import { ArrowLeft, Search, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardDeck } from "@/app/(dashboard)/siswa/kelas/[classId]/materi/[materiId]/_components/flashcard-deck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getClassMaterialMonitoring } from "./_action";
import { Skeleton } from "@/components/ui/skeleton";

export default function MaterialMonitoringPage({
  params,
}: {
  params: Promise<{ classId: string; materiId: string }>;
}) {
  const { classId, materiId } = use(params);
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      const result = await getClassMaterialMonitoring(classId, materiId);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [classId, materiId]);

  useEffect(() => {
    if (data?.material && data?.kelas) {
      setBreadcrumbs([
        { label: "Kelas Saya", href: "/guru/kelas" },
        { label: data.kelas.name, href: `/guru/kelas/${classId}` },
        { label: data.material.name, href: "#" },
      ]);
    }
  }, [setBreadcrumbs, classId, data]);

  const filteredStudents = data?.students.filter((item: any) =>
    item.student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 pt-4 md:p-4">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card text-card-foreground shadow-sm"
            >
              <div className="p-6 pb-2">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="p-6 pt-0">
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Student List Skeleton */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex justify-between border-b pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
              {/* Table Rows */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-4 border-b last:border-0"
                >
                  <Skeleton className="h-5 w-48" />
                  <div className="flex gap-12 pr-4 items-center">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-6">Materi tidak ditemukan.</div>;

  return (
    <div className="space-y-6 pt-4 md:p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/guru/kelas/${classId}`)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{data.material.name}</h1>
          <p className="text-muted-foreground text-sm">
            Monitoring progres siswa untuk materi ini.
          </p>
        </div>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring" className="gap-2">
            <Users className="w-4 h-4" /> Monitoring Siswa
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="gap-2">
            <Zap className="w-4 h-4" /> Flashcards (AI)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Stats Summary (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Selesai Kuis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    data.students.filter(
                      (s: any) => s.quiz.status === "Selesai"
                    ).length
                  }
                  <span className="text-muted-foreground text-sm font-normal ml-1">
                    / {data.students.length} Siswa
                  </span>
                </div>
              </CardContent>
            </Card>
            {data.material.flags?.teachback && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Teachback Submission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      data.students.filter(
                        (s: any) =>
                          s.teachback.status === "REVIEWED" ||
                          s.teachback.status === "PENDING"
                      ).length
                    }
                    <span className="text-muted-foreground text-sm font-normal ml-1">
                      / {data.students.length} Siswa
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Student List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daftar Siswa</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari siswa..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    {data.students[0]?.quiz.exists && (
                      <TableHead className="text-center">Nilai Kuis</TableHead>
                    )}
                    {data.students[0]?.teachback.exists && (
                      <TableHead className="text-center">Teachback</TableHead>
                    )}
                    {data.students[0]?.assignment.exists && (
                      <TableHead className="text-center">Tugas</TableHead>
                    )}
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents?.map((item: any) => (
                    <TableRow
                      key={item.student.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(
                          `/guru/kelas/${classId}/materi/${materiId}/siswa/${item.student.id}`
                        )
                      }
                    >
                      <TableCell className="font-medium">
                        {item.student.name}
                      </TableCell>

                      {/* Quiz Column */}
                      {item.quiz.exists && (
                        <TableCell className="text-center">
                          {item.quiz.score !== null ? (
                            <Badge
                              variant={
                                item.quiz.score >= 70
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {item.quiz.score}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>
                      )}

                      {/* Teachback Column */}
                      {item.teachback.exists && (
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              item.teachback.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : item.teachback.status === "REVIEWED" ||
                                  item.teachback.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500"
                            }
                          >
                            {item.teachback.status === "PENDING"
                              ? "Proses"
                              : item.teachback.status === "REVIEWED" ||
                                item.teachback.status === "COMPLETED"
                              ? "Selesai"
                              : "Belum"}
                          </Badge>
                        </TableCell>
                      )}

                      {/* Assignment Column */}
                      {item.assignment.exists && (
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              item.assignment.status === "Dikumpulkan"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-gray-100 text-gray-500"
                            }
                          >
                            {item.assignment.status}
                          </Badge>
                          {item.assignment.grade !== null && (
                            <span className="ml-2 text-xs font-bold text-muted-foreground">
                              {item.assignment.grade}/100
                            </span>
                          )}
                        </TableCell>
                      )}

                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
          <Card>
            <CardHeader>
              <CardTitle>Flashcards Materi</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate kartu belajar AI untuk materi ini. Kartu yang Anda
                generate di sini akan otomatis muncul di dashboard siswa.
              </p>
            </CardHeader>
            <CardContent>
              <FlashcardDeck
                materiId={materiId}
                materialName={data.material.name}
                fileUrl={data.material.fileUrl}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
