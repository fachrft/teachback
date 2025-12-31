"use client";

import { useState, useEffect } from "react";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getTeacherClasses, getClassStudentStats } from "./_action";
import ResultsLoading, { ResultsContentSkeleton } from "./loading";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get("classId");
  const { setBreadcrumbs } = useBreadcrumb();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setBreadcrumbs([{ label: "Hasil Siswa", href: "/guru/results" }]);
    async function init() {
      const cls = await getTeacherClasses();
      setClasses(cls);
      if (cls.length > 0) {
        if (initialClassId && cls.find((c) => c.id === initialClassId)) {
          setSelectedClass(initialClassId);
        } else {
          setSelectedClass(cls[0].id);
        }
      }
      setLoading(false);
    }
    init();
  }, [setBreadcrumbs, initialClassId]);

  useEffect(() => {
    if (!selectedClass) return;
    async function fetchStats() {
      setLoadingStats(true);
      const res = await getClassStudentStats(selectedClass);
      setStudents(res);
      setLoadingStats(false);
    }
    fetchStats();
  }, [selectedClass]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate Summary Stats
  const totalStudents = students.length;
  const avgClassScore =
    totalStudents > 0
      ? Math.round(
          students.reduce((acc, s) => acc + s.averageScore, 0) / totalStudents
        )
      : 0;
  const totalPending = students.reduce((acc, s) => acc + s.pendingCount, 0);

  if (loading) return <ResultsLoading />;

  return (
    <div className="pt-4 space-y-6 md:p-4 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hasil Belajar Siswa</h1>
          <p className="text-muted-foreground">
            Pantau progres dan nilai siswa per kelas.
          </p>
        </div>
        <div className="">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingStats ? (
        <ResultsContentSkeleton />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Siswa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rata-rata Kelas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgClassScore}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tunggakan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {totalPending}{" "}
                  <span className="text-sm text-muted-foreground font-normal">
                    Tugas
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama siswa..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="text-center">
                      Rata-rata Skor
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Tunggakan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {student.averageScore}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              student.status === "Sangat Baik" ||
                              student.status === "Baik"
                                ? "default"
                                : student.status === "Beresiko" ||
                                  student.status === "Perlu Perhatian"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              student.status === "Baik" ||
                              student.status === "Sangat Baik"
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : ""
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {student.pendingCount > 0 ? (
                            <Badge variant="destructive">
                              {student.pendingCount} Tugas
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-emerald-600 border-emerald-200 bg-emerald-50"
                            >
                              Selesai
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/guru/results/${selectedClass}/${student.id}`}
                          >
                            <Button variant="outline" size="sm">
                              Detail
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Tidak ada siswa ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
