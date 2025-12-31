"use client";

import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useEffect, useState, use } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Brain,
  User,
  Bot,
  FileText,
  Download,
  Edit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  getStudentWorkDetail,
  changeStatusTeachback,
  updateStudentScore,
  updateTeachbackFeedback,
} from "../../_action";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

export default function StudentWorkDetailPage({
  params,
}: {
  params: Promise<{ classId: string; materiId: string; studentId: string }>;
}) {
  const { classId, materiId, studentId } = use(params);
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editScoreOpen, setEditScoreOpen] = useState(false);
  const [editData, setEditData] = useState<{
    type: "quiz" | "teachback";
    id: string;
    score: number;
  } | null>(null);
  const [updating, setUpdating] = useState(false);

  // Feedback Edit State
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackValue, setFeedbackValue] = useState("");
  const [updatingFeedback, setUpdatingFeedback] = useState(false);

  async function handleUpdateFeedback() {
    if (!data?.teachback?.id) return;
    setUpdatingFeedback(true);
    try {
      const res = await updateTeachbackFeedback(
        data.teachback.id,
        feedbackValue
      );
      if (res.success) {
        toast.success("Feedback berhasil diupdate");
        setIsEditingFeedback(false);
        router.refresh();
        setData((prev: any) => ({
          ...prev,
          teachback: { ...prev.teachback, feedback: feedbackValue },
        }));
      } else {
        toast.error("Gagal update feedback");
      }
    } catch (e) {
      toast.error("Error updating feedback");
    } finally {
      setUpdatingFeedback(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      const result = await getStudentWorkDetail(materiId, classId, studentId);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [classId, materiId, studentId]);

  useEffect(() => {
    if (data?.student) {
      setBreadcrumbs([
        { label: "Kelas Saya", href: "/guru/kelas" },
        { label: data.class.name, href: `/guru/kelas/${classId}` },
        {
          label: data.material.name,
          href: `/guru/kelas/${classId}/materi/${materiId}`,
        },
        { label: data.student.name, href: "#" },
      ]);
    }
  }, [setBreadcrumbs, classId, materiId, data]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!data) return <div className="p-6">Data siswa tidak ditemukan.</div>;

  const { student, quiz, teachback, assignment } = data;

  async function handleReview(teachbackId: string) {
    try {
      toast.loading("Mengubah status...");
      const result = await changeStatusTeachback(teachbackId);
      if (result?.success) {
        toast.success("Review berhasil");
        router.refresh(); // Refresh page to update UI
        // Manually update local state if refresh is slow (optional)
        setData((prev: any) => ({
          ...prev,
          teachback: { ...prev.teachback, status: "REVIEWED" },
        }));
      }
      toast.dismiss();
    } catch (error) {
      console.error("Error changing teachback status:", error);
      toast.error("Gagal mengubah status review");
      toast.dismiss();
    }
  }

  async function handleUpdateScore() {
    if (!editData) return;
    setUpdating(true);
    try {
      const res = await updateStudentScore(
        editData.type,
        editData.id,
        editData.score
      );
      if (res.success) {
        toast.success("Nilai berhasil diupdate");
        setEditScoreOpen(false);
        router.refresh();
        // Optimistic update
        setData((prev: any) => {
          if (editData.type === "quiz") {
            return {
              ...prev,
              quiz: {
                ...prev.quiz,
                attempt: { ...prev.quiz.attempt, score: editData.score },
              },
            };
          } else {
            return {
              ...prev,
              teachback: { ...prev.teachback, score: editData.score },
            };
          }
        });
      } else {
        toast.error("Gagal update nilai");
      }
    } catch (e) {
      toast.error("Error updating score");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6 pt-4 md:p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={student.image} />
            <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm">
              Detail Pengerjaan Siswa
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="quiz" disabled={!quiz?.meta}>
            Quiz
          </TabsTrigger>
          <TabsTrigger value="teachback" disabled={!teachback}>
            Teachback
          </TabsTrigger>
          <TabsTrigger value="assignment" disabled={!assignment?.meta}>
            Tugas
          </TabsTrigger>
        </TabsList>

        {/* QUIZ TAB */}
        {quiz?.meta && (
          <TabsContent value="quiz" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Hasil Quiz</span>
                  {quiz.attempt ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          quiz.attempt.score >= 70
                            ? "bg-green-600"
                            : "bg-red-500"
                        }
                      >
                        Nilai: {quiz.attempt.score}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditData({
                            type: "quiz",
                            id: quiz.attempt.id,
                            score: quiz.attempt.score,
                          });
                          setEditScoreOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline">Belum Mengerjakan</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {quiz.attempt ? (
                  quiz.meta.questions.map((q: any, i: number) => {
                    const answerRecord = quiz.attempt.answers.find(
                      (a: any) => a.questionId === q.id
                    );
                    const isCorrect = answerRecord?.isCorrect;
                    const studentAns =
                      answerRecord?.answer || "(Tidak menjawab)";

                    return (
                      <div
                        key={q.id}
                        className="border p-4 rounded-lg bg-slate-50"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <span className="font-bold text-slate-500">
                            {i + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">
                              {q.question}
                            </p>
                          </div>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                          )}
                        </div>

                        <div className="ml-7 space-y-2 text-sm">
                          <div
                            className={`p-2 rounded ${
                              isCorrect
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            } border`}
                          >
                            <span className="font-semibold block text-xs uppercase mb-1">
                              Jawaban Siswa:
                            </span>
                            {studentAns}
                          </div>
                          {!isCorrect && q.type !== "essay" && (
                            <div className="p-2 rounded bg-slate-200 text-slate-700 border border-slate-300">
                              <span className="font-semibold block text-xs uppercase mb-1">
                                Kunci Jawaban:
                              </span>
                              {q.correctAnswer}
                            </div>
                          )}
                          {q.type === "essay" && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              *Dinilai oleh AI (Bobot Essay)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Siswa belum mengerjakan kuis ini.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TEACHBACK TAB */}
        {teachback && (
          <TabsContent value="teachback" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Transcript */}
              <Card className="col-span-2 md:h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" /> Rekaman Sesi
                    AI
                  </CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                  <div className="space-y-4">
                    {(teachback.transcript as any[])?.map((msg, idx) => {
                      if (msg.role === "system_context") return null;
                      const isBot = msg.role === "model";
                      return (
                        <div
                          key={idx}
                          className={`flex gap-4 ${
                            isBot
                              ? "items-start"
                              : "items-start flex-row-reverse"
                          }`}
                        >
                          <Avatar className="h-8 w-8 border-0">
                            {isBot ? (
                              <div className="h-full w-full bg-emerald-100 flex items-center justify-center rounded-full">
                                <Brain className="h-4 w-4 text-emerald-600" />
                              </div>
                            ) : (
                              <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                S
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div
                            className={`p-3 rounded-xl text-sm max-w-[85%] ${
                              isBot
                                ? "bg-emerald-50 text-slate-800"
                                : "bg-white border text-slate-700"
                            }`}
                          >
                            <p className="font-bold text-xs mb-1 text-slate-400">
                              {isBot ? "Coach AI" : "Siswa"}
                            </p>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Result */}
              <Card className="h-fit">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Hasil Review AI</CardTitle>
                  <Button
                    onClick={() => handleReview(teachback.id)}
                    disabled={teachback.status === "REVIEWED"}
                  >
                    {teachback.status === "REVIEWED"
                      ? "Review Teachback"
                      : "Selesai"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center relative">
                    <div className="text-5xl font-black text-slate-800 mb-2">
                      {teachback.score || 0}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => {
                        setEditData({
                          type: "teachback",
                          id: teachback.id,
                          score: teachback.score || 0,
                        });
                        setEditScoreOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Badge
                      variant={
                        teachback.status === "REVIEWED" ? "default" : "outline"
                      }
                    >
                      {teachback.status === "REVIEWED"
                        ? "Selesai Dinilai"
                        : "Belum Selesai"}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-700 leading-relaxed group">
                    <div className="flex justify-between items-center mb-2 border-b pb-1">
                      <span className="font-bold text-slate-900">
                        Feedback:
                      </span>
                      {!isEditingFeedback && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setFeedbackValue(teachback.feedback || "");
                            setIsEditingFeedback(true);
                          }}
                        >
                          <Edit className="h-3 w-3 text-slate-500" />
                        </Button>
                      )}
                    </div>

                    {isEditingFeedback ? (
                      <div className="space-y-3 pt-2">
                        <Textarea
                          value={feedbackValue}
                          onChange={(e) => setFeedbackValue(e.target.value)}
                          className="bg-white min-h-[120px]"
                          placeholder="Tulis feedback untuk siswa..."
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingFeedback(false)}
                            disabled={updatingFeedback}
                          >
                            Batal
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleUpdateFeedback}
                            disabled={updatingFeedback}
                          >
                            {updatingFeedback && (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            Simpan
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {teachback.feedback || "Belum ada feedback."}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    Terakhir update:{" "}
                    {new Date(teachback.updatedAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* ASSIGNMENT TAB */}
        {assignment?.meta && (
          <TabsContent value="assignment" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengumpulan Tugas</CardTitle>
              </CardHeader>
              <CardContent>
                {assignment.submission ? (
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">File Tugas</p>
                        <p className="text-sm text-muted-foreground">
                          Dikumpulkan:{" "}
                          {new Date(
                            assignment.submission.submittedAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Link href={assignment.submission.fileUrl} target="_blank">
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Lihat Tugas
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                    Siswa belum mengumpulkan tugas.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={editScoreOpen} onOpenChange={setEditScoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Nilai {editData?.type === "quiz" ? "Kuis" : "Teachback"}
            </DialogTitle>
            <DialogDescription>
              Ubah nilai secara manual. Perubahan ini akan langsung terlihat
              oleh sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right">
                Nilai (0-100)
              </Label>
              <Input
                id="score"
                type="number"
                value={editData?.score || 0}
                onChange={(e) =>
                  setEditData((prev: any) =>
                    prev
                      ? { ...prev, score: parseInt(e.target.value) || 0 }
                      : null
                  )
                }
                className="col-span-3"
                min={0}
                max={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditScoreOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateScore} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
