"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileUp, Clock, CheckCircle2 } from "lucide-react";
import {
  FileText,
  MessageSquare,
  CheckCircle,
  BookOpen,
  ChevronLeft,
  Trash2,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { QuizRunner } from "./quiz-runner";
import { TeachbackSession } from "./teachback-session";
import { FlashcardDeck } from "./flashcard-deck";
import { UploadDropzone } from "@/lib/utils/uploadthing";
import { submitAssignment, deleteAssignmentSubmission } from "../_action";
import { toast } from "sonner";
import { useState } from "react";

interface StudentLearningClientProps {
  data: any;
  classId: string;
  materiId: string;
}

export function StudentLearningClient({
  data,
  classId,
  materiId,
}: StudentLearningClientProps) {
  const { setBreadcrumbs } = useBreadcrumb();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const { material, quiz, teachback, assignment } = data;
  console.log("assignment", assignment);

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pengumpulan tugas ini?"))
      return;
    setDeleting(true);
    try {
      const res = await deleteAssignmentSubmission(id, classId, materiId);
      if (res.success) {
        toast.success("Pengumpulan dibatalkan. Silakan upload ulang.");
        router.refresh();
      } else {
        toast.error("Gagal menghapus.");
      }
    } catch (e) {
      toast.error("Error.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (material) {
      setBreadcrumbs([
        { label: "Kelas Saya", href: "/siswa/kelas" },
        { label: "Detail Kelas", href: `/siswa/kelas/${classId}` },
        { label: material.name, href: "#" },
      ]);
    }
  }, [material, classId, setBreadcrumbs]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col pt-2 ">
      {/* Top Navigation Bar (Mobile friendly) */}
      <div className="px-4 pb-2 flex justify-between items-center border-b md:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
        <span className="font-semibold text-sm truncate">{material.name}</span>
      </div>

      <div className="flex-1 overflow-hidden px-4 md:px-8 pb-8">
        <Tabs defaultValue="materi" className="h-full flex flex-col">
          <div className="pb-4 pt-2">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="materi" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden md:inline">Materi</span>
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline">Flashcards</span>
              </TabsTrigger>
              {material.flags?.quiz && (
                <TabsTrigger value="quiz" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden md:inline">Kuis</span>
                </TabsTrigger>
              )}
              {material.flags?.teachback && (
                <TabsTrigger value="teachback" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden md:inline">Teachback</span>
                </TabsTrigger>
              )}
              {material.flags?.assignment && (
                <TabsTrigger value="tugas" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden md:inline">Tugas</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* TAB: MATERI (PDF + DESC) */}
          <TabsContent
            value="materi"
            className="flex-1 overflow-y-auto m-0 rounded-xl border bg-white shadow-sm flex flex-col"
          >
            <div className="flex-1 bg-slate-100 relative min-h-[500px]">
              {material.fileUrl ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    material.fileUrl
                  )}&embedded=true`}
                  className="w-full h-full border-none absolute inset-0"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8">
                  <p className="text-muted-foreground">
                    Tidak ada file materi yang dilampirkan.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: QUIZ */}
          {material.flags?.quiz && (
            <TabsContent
              value="quiz"
              className="flex-1 overflow-y-auto m-0 rounded-xl border bg-slate-50/50 p-4 md:p-8"
            >
              <div className="bg-white p-6 md:p-10 rounded-xl border shadow-sm max-w-4xl mx-auto min-h-full">
                <h3 className="text-xl font-bold mb-6 border-b pb-4">
                  {quiz?.data?.title || "Latihan Soal"}
                </h3>

                {quiz.attempt ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Kuis Selesai!</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                      Jawabanmu sudah tersimpan. Guru akan memeriksa jawaban
                      esai dan memberikan nilai akhir.
                    </p>

                    <p className="text-sm text-muted-foreground bg-slate-50 px-4 py-2 rounded-lg border">
                      Dikerjakan pada{" "}
                      {new Date(quiz.attempt.startedAt).toLocaleString(
                        "id-ID",
                        { dateStyle: "full", timeStyle: "short" }
                      )}
                    </p>
                  </div>
                ) : (
                  <QuizRunner
                    quizId={quiz?.data?.id}
                    questions={quiz?.data?.questions || []}
                    classId={classId}
                    materiId={materiId}
                  />
                )}
              </div>
            </TabsContent>
          )}

          {/* TAB: TEACHBACK */}
          {material.flags?.teachback && (
            <TabsContent
              value="teachback"
              className="flex-1 m-0 rounded-xl border bg-white overflow-hidden flex flex-col"
            >
              <TeachbackSession
                material={material}
                classId={classId}
                initialSession={teachback.submission}
                user={data.user}
              />
            </TabsContent>
          )}

          {/* TAB: TUGAS */}
          {material.flags?.assignment && (
            <TabsContent
              value="tugas"
              className="flex-1 overflow-y-auto m-0 rounded-xl border bg-white p-4 md:p-8"
            >
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Header Tugas */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {assignment?.data?.title || "Tugas Materi"}
                    </h2>
                  </div>
                  {assignment?.data?.deadline && (
                    <Badge
                      variant="outline"
                      className={`px-4 py-2 border flex gap-2 ${
                        new Date() > new Date(assignment.data.deadline)
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {new Date() > new Date(assignment.data.deadline)
                        ? "Deadline Terlewati: "
                        : "Batas Waktu: "}
                      {new Date(assignment.data.deadline).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </Badge>
                  )}
                </div>

                {/* Instruksi Pengerjaan */}
                <Card className="bg-slate-50 border-slate-200 shadow-sm">
                  <CardContent className="">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" /> Instruksi
                      Pengerjaan
                    </h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                      {assignment?.data?.instructions ||
                        "Tidak ada instruksi khusus. Silakan upload file tugas Anda di bawah ini."}
                    </p>
                  </CardContent>
                </Card>

                {/* Upload Area / Submission Status */}
                <div className="pt-4">
                  {assignment.submission ? (
                    <div className="bg-white border rounded-xl p-6 shadow-sm ring-1 ring-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CheckCircle2 className="w-32 h-32 text-emerald-500" />
                      </div>

                      {/* Header Status */}
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">
                            Tugas Berhasil Dikumpulkan
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Pada{" "}
                            {new Date(
                              assignment.submission.submittedAt
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      {/* File Card */}
                      <div className="flex items-center p-4 bg-slate-50 border rounded-lg mb-6 group hover:border-blue-200 transition-colors relative z-10">
                        <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center mr-4 shadow-sm">
                          <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate mb-1">
                            File Submission
                          </p>
                          <Link
                            href={assignment.submission.fileUrl}
                            target="_blank"
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                          >
                            Lihat / Download{" "}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end pt-4 border-t relative z-10">
                        {!assignment?.data?.deadline ||
                        new Date() <= new Date(assignment.data.deadline) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteSubmission(assignment.submission.id)
                            }
                            disabled={deleting}
                            className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Upload Ulang
                            (Hapus)
                          </Button>
                        ) : (
                          <p className="text-xs text-red-500 italic">
                            Deadline telah berakhir, tidak dapat upload ulang.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : // UPLOAD STATE
                  assignment?.data?.deadline &&
                    new Date() > new Date(assignment.data.deadline) ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="font-bold text-lg text-red-900 mb-2">
                        Waktu Pengumpulan Habis
                      </h3>
                      <p className="text-red-700 text-sm max-w-sm">
                        Maaf, batas waktu pengumpulan tugas ini telah berakhir
                        pada{" "}
                        {new Date(assignment.data.deadline).toLocaleString(
                          "id-ID"
                        )}
                        . Anda tidak dapat mengunggah file lagi.
                      </p>
                    </div>
                  ) : (
                    // NORMAL UPLOAD
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <FileUp className="w-5 h-5 text-indigo-600" /> Upload
                          Pekerjaan Anda
                        </h3>
                      </div>

                      <div className="w-full">
                        <UploadDropzone
                          endpoint="assignmentUploader"
                          onClientUploadComplete={async (res) => {
                            if (res && res[0]) {
                              toast.success(
                                "File berhasil diupload, menyimpan submission..."
                              );
                              const result = await submitAssignment(
                                assignment.data.id,
                                res[0].ufsUrl,
                                classId,
                                materiId
                              );
                              if (result.success) {
                                toast.success("Tugas berhasil dikumpulkan!");
                                router.refresh();
                              } else {
                                toast.error(
                                  "Gagal menyimpan submission tugas."
                                );
                              }
                            }
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`Upload Gagal: ${error.message}`);
                          }}
                          appearance={{
                            container:
                              "border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-8 h-64 hover:bg-indigo-50/50 transition-colors cursor-pointer",
                            label:
                              "text-indigo-600 hover:text-indigo-700 font-medium",
                            button:
                              "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md",
                            allowedContent: "text-slate-400 text-xs mt-2",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* TAB: FLASHCARDS */}
          <TabsContent
            value="flashcards"
            className="flex-1 overflow-y-auto m-0 rounded-xl border bg-slate-50/50 p-4 md:p-8"
          >
            <div className="bg-white rounded-xl border shadow-sm min-h-full">
              <FlashcardDeck
                materiId={materiId}
                materialName={material.name}
                fileUrl={material.fileUrl}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
