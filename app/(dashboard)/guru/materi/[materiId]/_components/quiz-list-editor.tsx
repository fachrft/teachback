"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit2,
  Save,
  X,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { updateQuizQuestion } from "../../_action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Question {
  id: string;
  quizId: string;
  question: string;
  type: string;
  options: any; // jsonb type comes as any/unknown usually, expecting string[]
  correctAnswer: string | null;
  order: number | null;
}

interface QuizListEditorProps {
  quizData: {
    id: string;
    questions: Question[];
  };
}

export function QuizListEditor({ quizData }: QuizListEditorProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    question: string;
    options: string[];
    correctAnswer: string;
  } | null>(null);

  const handleEditClick = (q: Question) => {
    setEditingId(q.id);
    setEditValues({
      question: q.question,
      options: Array.isArray(q.options) ? [...q.options] : [],
      correctAnswer: q.correctAnswer || "",
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const handleSaveClick = async (questionId: string) => {
    if (!editValues) return;

    const toastId = toast.loading("Menyimpan perubahan...");

    try {
      const result = await updateQuizQuestion(questionId, {
        question: editValues.question,
        options: editValues.options.length > 0 ? editValues.options : null,
        correctAnswer: editValues.correctAnswer,
      });

      if (result.success) {
        toast.success("Berhasil memperbarui soal", { id: toastId });
        setEditingId(null);
        setEditValues(null);
        router.refresh();
      } else {
        toast.error("Gagal menyimpan perubahan", { id: toastId });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan", { id: toastId });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!editValues) return;
    const newOptions = [...editValues.options];
    newOptions[index] = value;
    setEditValues({ ...editValues, options: newOptions });
  };

  return (
    <div className="space-y-4">
      {quizData.questions.map((q, idx) => (
        <Card
          key={q.id}
          className={`transition-all duration-200 ${
            editingId === q.id
              ? "ring-2 ring-primary ring-offset-2"
              : "hover:border-primary/50"
          }`}
        >
          {editingId === q.id && editValues ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Edit Soal No. {idx + 1}</Badge>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelClick}
                    className="h-8 text-muted-foreground"
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveClick(q.id)}
                    className="h-8"
                  >
                    Simpan
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pertanyaan
                </label>
                <Textarea
                  value={editValues.question}
                  onChange={(e) =>
                    setEditValues({ ...editValues, question: e.target.value })
                  }
                  rows={2}
                  className="resize-none font-medium"
                />
              </div>

              {q.type === "multiple_choice" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Pilihan Jawaban
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editValues.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2 rounded-md border ${
                          editValues.correctAnswer === opt
                            ? "border-primary bg-primary/5"
                            : "border-input"
                        }`}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            setEditValues({
                              ...editValues,
                              correctAnswer: opt,
                            })
                          }
                        >
                          {editValues.correctAnswer === opt ? (
                            <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <Input
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(i, e.target.value)
                          }
                          className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-8 px-0"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    *Klik lingkaran untuk menandai kunci jawaban
                  </p>
                </div>
              )}

              {q.type === "essay" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Kunci Jawaban / Poin Penting
                  </label>
                  <Textarea
                    value={editValues.correctAnswer || ""}
                    onChange={(e) =>
                      setEditValues({
                        ...editValues,
                        correctAnswer: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={q.type === "essay" ? "secondary" : "outline"}
                      >
                        {q.type === "essay" ? "Essay" : "Pilihan Ganda"}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-mono">
                        No. {idx + 1}
                      </span>
                    </div>
                    <p className="font-medium text-base leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(q)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Soal
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus Soal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-6">
                  {q.type === "multiple_choice" && Array.isArray(q.options) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt: string, i: number) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-colors relative ${
                            q.correctAnswer &&
                            (opt === q.correctAnswer ||
                              opt.toLowerCase().trim() ===
                                q.correctAnswer.toLowerCase().trim() ||
                              opt.includes(q.correctAnswer) ||
                              q.correctAnswer.includes(opt))
                              ? "bg-green-50 border-green-500 ring-1 ring-green-500"
                              : "bg-muted/30 border-transparent"
                          }`}
                        >
                          <span
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium shrink-0 ${
                              q.correctAnswer &&
                              (opt === q.correctAnswer ||
                                opt.toLowerCase().trim() ===
                                  q.correctAnswer.toLowerCase().trim() ||
                                opt.includes(q.correctAnswer) ||
                                q.correctAnswer.includes(opt))
                                ? "bg-green-600 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span
                            className={
                              q.correctAnswer &&
                              (opt === q.correctAnswer ||
                                opt.toLowerCase().trim() ===
                                  q.correctAnswer.toLowerCase().trim() ||
                                opt.includes(q.correctAnswer) ||
                                q.correctAnswer.includes(opt))
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {/* Strip "A. ", "B. ", etc if present to avoid double lettering */}
                            {opt.replace(/^[A-D]\.\s*/, "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "essay" && (
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Kunci Jawaban
                      </span>
                      <p className="text-sm">{q.correctAnswer || "-"}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
