"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useEffect, useState, use } from "react";
import { ArrowLeft, Plus, Book, Calendar, Loader2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  getSingleClass,
  getAssignedMaterials,
  getAvailableMaterialsForClass,
  assignMaterialToClass,
  removeMaterialFromClass,
} from "./_action";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";

// --- Sub Components ---

function AssignMaterialDialog({
  classId,
  trigger,
}: {
  classId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setLoading(true);
      getAvailableMaterialsForClass(classId)
        .then((res) => setAvailableMaterials(res))
        .finally(() => setLoading(false));
    }
  }, [open, classId]);

  const handleAssign = async (materiId: string) => {
    setAssigningId(materiId);
    const res = await assignMaterialToClass(classId, materiId);
    if (res.success) {
      toast.success("Materi berhasil ditambahkan ke kelas");
      setOpen(false);
      router.refresh();
      window.location.reload();
    } else {
      toast.error(res.error || "Gagal menambahkan materi");
    }
    setAssigningId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambahkan Materi ke Kelas</DialogTitle>
          <DialogDescription>
            Pilih materi dari Bank Materi Anda untuk ditugaskan.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : availableMaterials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada materi yang tersedia untuk ditambahkan.
            <br />
            Semua materi Anda mungkin sudah ditugaskan ke kelas ini.
          </div>
        ) : (
          <div className="grid gap-3 py-4">
            {availableMaterials.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-3 overflow-hidden">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Book className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Dibuat pada{" "}
                      {new Date(m.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={assigningId === m.id}
                  onClick={() => handleAssign(m.id)}
                >
                  {assigningId === m.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MaterialsListSkeleton() {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-3/4" />
              </div>
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MaterialsList({
  materials,
  classId,
  isLoading,
}: {
  materials: any[];
  classId: string;
  isLoading: boolean;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmRemove = (e: React.MouseEvent, materiId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setItemToDelete(materiId);
    setDeleteDialogOpen(true);
  };

  const executeRemove = async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete);
    setDeleteDialogOpen(false);

    const res = await removeMaterialFromClass(classId, itemToDelete);
    if (res.success) {
      toast.success("Materi berhasil dihapus dari kelas");
      window.location.reload();
    } else {
      toast.error(res.error || "Gagal menghapus materi");
    }
    setDeletingId(null);
    setItemToDelete(null);
  };

  if (isLoading) {
    return <MaterialsListSkeleton />;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Materi Pembelajaran</h3>
        {materials.length > 0 && (
          <AssignMaterialDialog
            classId={classId}
            trigger={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Tambah Materi
              </Button>
            }
          />
        )}
      </div>

      <div className="space-y-4">
        {materials.length === 0 ? (
          <EmptyState
            icon={Book}
            title="Belum ada materi"
            description="Materi pembelajaran yang Anda buat akan muncul di sini."
            action={
              <AssignMaterialDialog
                classId={classId}
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Cari Materi
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((m) => (
              <Link href={`/guru/kelas/${classId}/materi/${m.id}`} key={m.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-semibold line-clamp-2 leading-snug min-h-10 pr-6">
                        {m.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm"
                        onClick={(e) => confirmRemove(e, m.id)}
                        disabled={deletingId === m.id}
                      >
                        {deletingId === m.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(m.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {m.flags?.teachback && (
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 border-purple-200 text-xs"
                        >
                          Teachback
                        </Badge>
                      )}
                      {m.flags?.quiz && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-700 border-amber-200 text-xs"
                        >
                          Quiz
                        </Badge>
                      )}
                      {m.flags?.assignment && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 border-blue-200 text-xs"
                        >
                          Tugas
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Materi dari Kelas?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus materi ini dari daftar materi kelas.
              Data progres siswa mungkin tetap tersimpan di database, tetapi
              tidak akan tampil di sini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={executeRemove}>
              Hapus Materi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Main Page Component ---

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [classDetail, setClassDetail] = useState<any>(null);
  const [materials, setMaterials] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const [classData, materialsData] = await Promise.all([
          getSingleClass(classId),
          getAssignedMaterials(classId),
        ]);
        setClassDetail(classData);
        setMaterials(materialsData);
      } catch (error) {
        console.error("Failed to fetch class data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  useEffect(() => {
    if (classDetail) {
      setBreadcrumbs([
        { label: "Kelas Saya", href: "/guru/kelas" },
        {
          label: classDetail?.name || "Detail Kelas",
          href: `/guru/kelas/${classId}`,
        },
      ]);
    }
  }, [setBreadcrumbs, classId, classDetail]);

  return (
    <div className="space-y-6 pt-4 md:p-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/guru/kelas")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              {isLoading && !classDetail ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold flex flex-col md:flex-row items-center gap-3">
                    {classDetail?.name}
                    <Badge
                      variant="outline"
                      className="font-mono text-sm font-normal"
                    >
                      Kode: {classDetail?.kode}
                    </Badge>
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Kelola materi, tugas, dan kuis untuk kelas ini.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <MaterialsList
          materials={materials}
          classId={classId}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
