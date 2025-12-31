"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { submitQuizAttempt } from "../_action";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

interface QuizRunnerProps {
  quizId: string;
  questions: any[];
  classId: string;
  materiId: string;
}

export function QuizRunner({
  quizId,
  questions,
  classId,
  materiId,
}: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSelectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      toast.error(`Masih ada ${unansweredCount} soal yang belum dijawab.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitQuizAttempt(
        quizId,
        answers,
        classId,
        materiId
      );

      if (result.success) {
        toast.success(`Kuis selesai! Nilai kamu: ${result.score}`);
        router.refresh();
      } else {
        toast.error("Gagal mengirim jawaban kuis.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {questions.map((q, index) => {
        let options: string[] = [];
        try {
          options =
            typeof q.options === "string" ? JSON.parse(q.options) : q.options;
        } catch (e) {
          options = [];
        }

        return (
          <Card key={q.id} className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="mb-4">
                <h4 className="font-semibold text-base mb-2">
                  <span className="mr-2 text-primary">No. {index + 1}</span>
                </h4>
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {q.question}
                </p>
              </div>

              {q.type === "essay" ? (
                <Textarea
                  placeholder="Tulis jawaban esai Anda di sini..."
                  value={answers[q.id] || ""}
                  onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                  className="min-h-[120px] bg-slate-50 focus:bg-white transition-colors"
                />
              ) : (
                <RadioGroup
                  value={answers[q.id] || ""}
                  onValueChange={(val) => handleSelectAnswer(q.id, val)}
                  className="space-y-3 pl-4"
                >
                  {options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        answers[q.id] === opt
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      <RadioGroupItem
                        value={opt}
                        id={`q-${q.id}-opt-${optIndex}`}
                        className="text-primary"
                      />
                      <Label
                        htmlFor={`q-${q.id}-opt-${optIndex}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="pt-6 border-t">
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
            </>
          ) : (
            "Kirim Jawaban"
          )}
        </Button>
      </div>
    </div>
  );
}
