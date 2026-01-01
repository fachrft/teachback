"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useEffect, useState } from "react";
import { Plus, MoreVertical, Book, Users, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { getClasses, createClass, updateClass, deleteClass } from "./_action";
import { toast } from "sonner";
import { generateCode } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi"),
});

export default function KelasPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit State
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete State
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Forms
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Handlers
  async function onSubmitCreate(values: z.infer<typeof formSchema>) {
    const kode = generateCode();
    const id = toast.loading("Membuat kelas...");
    const result = await createClass({ name: values.name, kode });

    if (result) {
      toast.success("Kelas berhasil dibuat");
      setIsModalOpen(false);
      createForm.reset();
      fetchClasses();
      toast.dismiss(id);
    } else {
      toast.error("Gagal membuat kelas");
      toast.dismiss(id);
    }
  }

  async function onSubmitEdit(values: z.infer<typeof formSchema>) {
    if (!editingClass) return;
    const id = toast.loading("Memperbarui kelas...");
    const result = await updateClass(editingClass.id, { name: values.name });

    if (result) {
      toast.success("Kelas berhasil diperbarui");
      setIsEditModalOpen(false);
      setEditingClass(null);
      fetchClasses();
      toast.dismiss(id);
    } else {
      toast.error("Gagal memperbarui kelas");
      toast.dismiss(id);
    }
  }

  async function handleDeleteClass() {
    if (!deletingClassId) return;
    const id = toast.loading("Menghapus kelas...");
    const result = await deleteClass(deletingClassId);

    if (result) {
      toast.success("Kelas berhasil dihapus");
      setIsDeleteModalOpen(false);
      setDeletingClassId(null);
      fetchClasses();
      toast.dismiss(id);
    } else {
      toast.error("Gagal menghapus kelas");
    }
  }

  async function fetchClasses() {
    setIsLoading(true);
    const data = await getClasses();
    setClasses(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchClasses();
    setBreadcrumbs([{ label: "Kelas Saya", href: "/guru/kelas" }]);
  }, [setBreadcrumbs]);

  // Reset edit form when modal opens with data
  useEffect(() => {
    if (editingClass) {
      editForm.reset({
        name: editingClass.name,
      });
    }
  }, [editingClass, editForm]);

  return (
    <div className="space-y-6 pt-4 md:p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kelas Saya</h1>
          <p className="text-muted-foreground text-sm">
            Pilih kelas untuk mulai menilai atau kelola siswa.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => createForm.reset()}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Kelas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Kelas Baru</DialogTitle>
              <DialogDescription>
                Buat ruang kelas baru untuk siswa Anda. Kode kelas akan
                digenerate otomatis.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(onSubmitCreate)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kelas</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: X IPA 1 - Fisika"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createForm.formState.isSubmitting}
                  >
                    {createForm.formState.isSubmitting
                      ? "Menyimpan..."
                      : "Simpan"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Class Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Kelas</DialogTitle>
              <DialogDescription>Ubah nama kelas.</DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onSubmitEdit)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kelas</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={editForm.formState.isSubmitting}
                  >
                    {editForm.formState.isSubmitting
                      ? "Menyimpan..."
                      : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Class Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Kelas?</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak
                dapat dibatalkan dan semua data terkait (siswa, nilai, materi)
                akan hilang.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteClass}>
                Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Skeleton Loading State
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="relative">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Skeleton className="h-5 w-5" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center gap-2 mt-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="pt-4 border-t flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : classes.length > 0 ? (
          classes.map((kelas: any) => (
            <Link href={`/guru/kelas/${kelas.id}`} key={kelas.id}>
              <Card className="group hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Book className="h-5 w-5" />
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingClass(kelas);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Kelas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingClassId(kelas.id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Hapus Kelas
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{kelas.name}</h3>
                      {kelas.pendingReviews > 0 && (
                        <div className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-medium border border-amber-200 shadow-sm shrink-0 ml-2">
                          {kelas.pendingReviews} Review Pending
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {kelas.students} Siswa
                      </span>
                      <span>•</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                        Kode: {kelas.code}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Materi Aktif:</span>
                    <span className="font-medium text-primary truncate max-w-[120px]">
                      {kelas.activeTopic}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={Book}
              title="Belum ada kelas"
              description="Buat kelas baru untuk memulai mengajar siswa Anda."
            />
          </div>
        )}
      </div>
    </div>
  );
}
