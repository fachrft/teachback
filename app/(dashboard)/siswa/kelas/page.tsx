"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { joinClass, getStudentClasses } from "./_action";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const cardVariants = [
  {
    bg: "bg-blue-50 hover:bg-blue-100/50",
    border: "border-blue-100",
    text: "text-blue-600",
    icon: "text-blue-600",
    badge: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
  },
  {
    bg: "bg-purple-50 hover:bg-purple-100/50",
    border: "border-purple-100",
    text: "text-purple-600",
    icon: "text-purple-600",
    badge:
      "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200",
  },
  {
    bg: "bg-emerald-50 hover:bg-emerald-100/50",
    border: "border-emerald-100",
    text: "text-emerald-600",
    icon: "text-emerald-600",
    badge:
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200",
  },
  {
    bg: "bg-amber-50 hover:bg-amber-100/50",
    border: "border-amber-100",
    text: "text-amber-600",
    icon: "text-amber-600",
    badge: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200",
  },
  {
    bg: "bg-rose-50 hover:bg-rose-100/50",
    border: "border-rose-100",
    text: "text-rose-600",
    icon: "text-rose-600",
    badge: "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200",
  },
  {
    bg: "bg-indigo-50 hover:bg-indigo-100/50",
    border: "border-indigo-100",
    text: "text-indigo-600",
    icon: "text-indigo-600",
    badge:
      "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200",
  },
];

export default function StudentClassesPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function fetchClasses() {
    setIsLoading(true);
    const data = await getStudentClasses();
    setClasses(data as any);
    setIsLoading(false);
  }

  useEffect(() => {
    setBreadcrumbs([{ label: "Kelas Saya", href: "/siswa/kelas" }]);
    fetchClasses();
  }, [setBreadcrumbs]);

  async function handleJoinClass(e: React.FormEvent) {
    e.preventDefault();
    if (!classCode) return;

    setIsJoining(true);
    const result = await joinClass(classCode);
    setIsJoining(false);

    if (result.success) {
      toast.success(result.message);
      setIsJoinModalOpen(false);
      setClassCode("");
      fetchClasses();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6 pt-4 md:p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kelas Saya</h1>
          <p className="text-muted-foreground text-sm">
            Daftar kelas yang Anda ikuti.
          </p>
        </div>

        <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Gabung Kelas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gabung Kelas Baru</DialogTitle>
              <DialogDescription>
                Masukkan kode kelas yang diberikan oleh guru Anda.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleJoinClass} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode Kelas</Label>
                <Input
                  id="code"
                  placeholder="Contoh: AB12CD"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  maxLength={7}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsJoinModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isJoining || !classCode}>
                  {isJoining ? "Bergabung..." : "Gabung"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : classes.length > 0 ? (
          classes.map((kelas, index) => {
            const variant = cardVariants[index % cardVariants.length];
            return (
              <Link
                href={`/siswa/kelas/${kelas.id}`}
                key={kelas.id}
                className="group block h-full"
              >
                <div
                  className={`h-full rounded-2xl border ${variant.border} ${variant.bg} p-6 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl bg-white shadow-sm ${variant.icon}`}
                    >
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${variant.badge} font-mono border`}
                    >
                      {kelas.kode}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h3
                      className={`font-bold text-xl ${variant.text} line-clamp-1`}
                    >
                      {kelas.name}
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5" />
                      {kelas.teacherName}
                    </p>
                  </div>

                  <div className="flex items-center text-sm font-semibold text-muted-foreground/80 group-hover:text-primary transition-colors">
                    Masuk Kelas{" "}
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={BookOpen}
              title="Belum ada kelas"
              description="Anda belum bergabung dengan kelas manapun. Minta kode kelas kepada guru Anda."
            />
          </div>
        )}
      </div>
    </div>
  );
}
