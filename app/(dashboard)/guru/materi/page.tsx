"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  BookOpen,
  Trash,
  FileText,
  Link as LinkIcon,
  MoreVertical,
  Edit,
  Share,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadDropzone, UploadButton } from "@/lib/utils/uploadthing";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useForm } from "react-hook-form";
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  deleteFile as deleteFileAction,
  getClasses,
  assignMateriToClass,
} from "./_action";
import Link from "next/link";

interface Material {
  id: string;
  name: string;
  fileUrl: string | null;
  flags: {
    quiz: boolean;
    teachback: boolean;
    assignment: boolean;
  } | null;
  createdAt: Date;
}

interface Kelas {
  id: string;
  name: string;
  kode: string;
  isAssigned?: boolean;
}

export default function MaterialsPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGetClassModalOpen, setIsGetClassModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null
  );
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form State
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: "",
      fileUrl: "",
      flags: {
        quiz: false,
        teachback: false,
        assignment: false,
      },
      assignmentDetails: {
        title: "",
        instructions: "",
        deadline: "",
      },
    },
  });

  const fileUrl = watch("fileUrl");
  const flags = watch("flags");

  useEffect(() => {
    setBreadcrumbs([{ label: "Bank Materi", href: "/guru/materials" }]);
    fetchMaterials();
  }, [setBreadcrumbs]);

  async function fetchMaterials() {
    setIsLoading(true);
    const data = await getMaterials();
    if (!data) return;
    setMaterials(data);
    setIsLoading(false);
  }

  async function handleSubmitForm(data: any) {
    if (!data.name) {
      toast.error("Nama materi wajib diisi");
      return;
    }

    if (!data.fileUrl) {
      toast.error("File materi wajib diupload");
      return;
    }

    setIsSubmitting(true);
    let result;

    try {
      if (editingMaterial) {
        const loadingId = toast.loading(
          "Sedang memproses AI & Membuat Kuis..."
        );
        result = await updateMaterial(editingMaterial.id, data);
        toast.dismiss(loadingId);
      } else {
        const loadingId = toast.loading(
          "Sedang memproses AI & Membuat Kuis..."
        );
        result = await createMaterial(data);
        toast.dismiss(loadingId);
      }

      if (result.success) {
        toast.success(
          editingMaterial
            ? "Materi berhasil diperbarui"
            : "Materi berhasil dibuat"
        );
        setIsCreateModalOpen(false);
        setEditingMaterial(null);
        reset();
        fetchMaterials();
      } else {
        toast.error(
          editingMaterial ? "Gagal memperbarui materi" : "Gagal membuat materi"
        );
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(material: Material) {
    setEditingMaterial(material);
    setValue("name", material.name);
    setValue("fileUrl", material.fileUrl || "");
    setValue("flags.teachback", material.flags?.teachback || false);
    setValue("flags.quiz", material.flags?.quiz || false);
    setValue("flags.assignment", material.flags?.assignment || false);
    setIsCreateModalOpen(true);
  }

  async function handleDelete() {
    if (!selectedMaterialId) return;
    const loadingId = toast.loading("Sedang menghapus materi...");
    const result = await deleteMaterial(selectedMaterialId);
    toast.dismiss(loadingId);
    if (result.success) {
      toast.success("Materi berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSelectedMaterialId(null);
      fetchMaterials();
    } else {
      toast.error("Gagal menghapus materi");
    }
  }

  async function handleRemoveFile(url: string) {
    if (!url) return;

    try {
      const result = await deleteFileAction(url);
      if (result.success) {
        setValue("fileUrl", "");
        toast.success("File berhasil dihapus");
      } else {
        toast.error("Gagal menghapus file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  async function handleAssign(material: Material) {
    setSelectedMaterialId(material.id);
    setIsGetClassModalOpen(true);
    const classes = await getClasses(material.id);
    setClasses(classes);
  }

  async function handleAssignToClass(kelasId: string) {
    const result = await assignMateriToClass(kelasId, selectedMaterialId!);

    if (result.success) {
      toast.success("Materi berhasil ditugaskan");
      setClasses((prev) =>
        prev.map((c) => (c.id === kelasId ? { ...c, isAssigned: true } : c))
      );
    } else {
      toast.error("Gagal menugaskan materi");
    }
  }

  return (
    <div className="space-y-6 pt-4 md:p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bank Materi</h1>
          <p className="text-muted-foreground text-sm">
            Kelola materi pembelajaran untuk digunakan di berbagai kelas.
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingMaterial(null);
                reset({
                  name: "",
                  fileUrl: "",
                  flags: {
                    quiz: false,
                    teachback: false,
                    assignment: false,
                  },
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat Materi Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? "Edit Materi" : "Buat Materi Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingMaterial
                  ? "Perbarui informasi materi pembelajaran."
                  : "Tambahkan materi pembelajaran baru ke bank materi Anda."}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(handleSubmitForm)}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Judul Materi</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Pengenalan Fisika Kuantum"
                  {...register("name", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label>File Materi</Label>
                {fileUrl ? (
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 w-full">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm truncate flex-1 max-w-[250px] sm:max-w-[350px] block">
                      {fileUrl}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRemoveFile(fileUrl)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadButton
                      endpoint="materiUploader"
                      onClientUploadComplete={(res: any) => {
                        if (res && res[0]) {
                          setValue("fileUrl", res[0].url);
                          toast.success("File berhasil diupload");
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload Gagal: ${error.message}`);
                      }}
                      className="border-dashed border-2 p-4 ut-button:bg-primary ut-label:text-primary"
                    />
                    <p className="text-[10px] text-muted-foreground text-center">
                      Format: PDF (Max 32MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Label>Opsi Tambahan</Label>
                <div className="flex flex-col gap-3">
                  <Label
                    htmlFor="teachback"
                    className="cursor-pointer flex items-center space-x-2 border p-3 rounded-md"
                  >
                    <Checkbox
                      id="teachback"
                      checked={flags.teachback}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setValue("flags.teachback", checked === true)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <p>Aktifkan Teachback</p>
                      <p className="text-xs text-muted-foreground">
                        Siswa diminta menjelaskan kembali materi ini.
                      </p>
                    </div>
                  </Label>

                  <Label
                    htmlFor="quiz"
                    className="cursor-pointer flex items-center space-x-2 border p-3 rounded-md"
                  >
                    <Checkbox
                      id="quiz"
                      checked={flags.quiz}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setValue("flags.quiz", checked === true)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <p>Tambahkan Kuis</p>
                      <p className="text-xs text-muted-foreground">
                        Siswa akan mengerjakan kuis setelah materi.
                      </p>
                    </div>
                  </Label>

                  <Label
                    htmlFor="assignment"
                    className="cursor-pointer flex items-center space-x-2 border p-3 rounded-md"
                  >
                    <Checkbox
                      id="assignment"
                      checked={flags.assignment}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        setValue("flags.assignment", checked === true)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <p>Tugaskan Pekerjaan</p>
                      <p className="text-xs text-muted-foreground">
                        Siswa perlu mengumpulkan tugas terkait materi.
                      </p>
                    </div>
                  </Label>
                </div>

                {/* Assignment Details Form */}
                {flags.assignment && (
                  <div className="mt-4 pt-4 border-t border-dashed animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-medium text-sm text-slate-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" /> Detail
                      Tugas
                    </h4>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="assignTitle" className="text-xs">
                          Judul Tugas
                        </Label>
                        <Input
                          id="assignTitle"
                          className="h-9"
                          placeholder="Contoh: Implementasi Teori X..."
                          {...register("assignmentDetails.title")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="assignInst" className="text-xs">
                          Instruksi Pengerjaan
                        </Label>
                        <Textarea
                          id="assignInst"
                          placeholder="Jelaskan langkah-langkah pengerjaan tugas..."
                          className="min-h-[80px] text-sm"
                          {...register("assignmentDetails.instructions")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="assignDate" className="text-xs">
                          Deadline (Opsional)
                        </Label>
                        <Input
                          id="assignDate"
                          type="datetime-local"
                          className="h-9"
                          {...register("assignmentDetails.deadline")}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Kosongkan untuk deadline 7 hari standar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {editingMaterial
                    ? isSubmitting
                      ? "Menyimpan..."
                      : "Simpan Perubahan"
                    : isSubmitting
                    ? "Menyimpan..."
                    : "Simpan Materi"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Materi?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus materi ini? Materi yang sudah
              ditugaskan ke kelas mungkin akan terpengaruh.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Get Kelas */}
      <Dialog open={isGetClassModalOpen} onOpenChange={setIsGetClassModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Kelas</DialogTitle>
            <DialogDescription className="mb-5">
              Pilih kelas yang akan menerima materi ini.
            </DialogDescription>
            {classes.map((kelas) => (
              <div
                key={kelas.id}
                className="flex items-center justify-between space-x-2 border p-3 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{kelas.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Kode <span className="font-medium">{kelas.kode}</span>
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={kelas.isAssigned ? "secondary" : "default"}
                  disabled={kelas.isAssigned}
                  onClick={() => handleAssignToClass(kelas.id)}
                >
                  {kelas.isAssigned ? "Sudah Ditugaskan" : "Tugaskan"}
                </Button>
              </div>
            ))}
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Materials Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : materials.length > 0 ? (
          materials.map((m) => (
            <Link key={m.id} href={`/guru/materi/${m.id}`}>
              <Card className="flex flex-col group hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAssign(m);
                        }}
                      >
                        <Share className="mr-2 h-4 w-4" />
                        Tugaskan ke Kelas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(m);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Materi
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedMaterialId(m.id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Hapus Materi
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {m.name}
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {m.flags?.teachback && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200"
                      >
                        Teachback
                      </Badge>
                    )}
                    {m.flags?.quiz && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                      >
                        Quiz
                      </Badge>
                    )}
                    {m.flags?.assignment && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                      >
                        Tugas
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>Materi</span>
                  </div>
                  {m.fileUrl && (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(m.fileUrl!, "_blank");
                      }}
                      className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                    >
                      <LinkIcon className="h-3 w-3" />
                      Link File
                    </div>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={BookOpen}
              title="Belum ada materi"
              description="Buat materi baru untuk mulai mengajar."
              action={
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Materi Pertama
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
