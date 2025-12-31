"use server";

import { db } from "@/lib/db";
import {
  materi,
  quiz,
  quiz_question,
  quiz_attempt,
  quiz_answer,
  teachback_submission,
  assignment,
  assignment_submission,
  profile,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";
import { ai } from "@/lib/gemini";

export async function deleteAssignmentSubmission(
  submissionId: string,
  classId: string,
  materiId: string
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return { success: false, error: "Unauthorized" };

    const profileUser = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });
    if (!profileUser) return { success: false, error: "Unauthorized" };

    // Delete submission (Ensure student owns it)
    await db
      .delete(assignment_submission)
      .where(
        and(
          eq(assignment_submission.id, submissionId),
          eq(assignment_submission.studentId, profileUser.id)
        )
      );

    revalidatePath(`/siswa/kelas/${classId}/materi/${materiId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting assignment submission:", error);
    return { success: false, error: "Failed to delete submission" };
  }
}

export async function submitAssignment(
  assignmentId: string,
  fileUrl: string,
  classId: string,
  materiId: string
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return { success: false, error: "Unauthorized" };

    const profileUser = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });
    if (!profileUser) return { success: false, error: "Unauthorized" };

    await db.insert(assignment_submission).values({
      assignmentId,
      studentId: profileUser.id,
      fileUrl: fileUrl,
    });

    revalidatePath(`/siswa/kelas/${classId}/materi/${materiId}`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return { success: false, error: "Failed to submit assignment" };
  }
}

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>,
  classId: string,
  materiId: string
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return { success: false, error: "Unauthorized" };

    const profileUser = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });
    if (!profileUser) return { success: false, error: "Unauthorized" };

    const quizData = await db.query.quiz.findFirst({
      where: eq(quiz.id, quizId),
      with: {
        questions: true,
      },
    });

    if (!quizData || !quizData.questions) {
      return { success: false, error: "Quiz not found" };
    }

    const existingAttempt = await db.query.quiz_attempt.findFirst({
      where: and(
        eq(quiz_attempt.quizId, quizId),
        eq(quiz_attempt.studentId, profileUser.id)
      ),
    });

    if (existingAttempt) {
      return { success: false, error: "Anda sudah mengerjakan kuis ini." };
    }

    let earnedPoints = 0;
    const essayQuestionsArray: {
      id: string;
      question: string;
      key: string;
      answer: string;
    }[] = [];

    for (const q of quizData.questions) {
      const userAnswer = answers[q.id];

      if (q.type === "essay") {
        if (userAnswer && userAnswer.trim().length > 0) {
          essayQuestionsArray.push({
            id: q.id,
            question: q.question,
            key: q.correctAnswer || "",
            answer: userAnswer,
          });
        }
      } else {
        if (userAnswer && userAnswer === q.correctAnswer) {
          earnedPoints += 1;
        }
      }
    }

    const aiScoresMap: Record<string, number> = {};
    if (essayQuestionsArray.length > 0) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              parts: [
                {
                  text: `You are an expert teacher grading student essay answers.
                          Your task is to rate each student answer from 0.0 to 1.0 based on the provided Correct Answer Key.

                          Scoring Criteria:
                          - 1.0: Accurate, complete, and demonstrates good understanding.
                          - 0.75: Mostly correct but missing minor details.
                          - 0.5: Partially correct, captures some key points.
                          - 0.25: Mostly incorrect or very vague.
                          - 0.0: Completely wrong or irrelevant.

                          Input Data (JSON):
                          ${JSON.stringify(
                            essayQuestionsArray.map((e) => ({
                              id: e.id,
                              question: e.question,
                              correct_key: e.key,
                              student_answer: e.answer,
                            }))
                          )}

                          Output Requirement:
                          Return ONLY a valid JSON object where keys are the question IDs and values are the numeric scores (float). Do not include markdown formatting or explanations.
                          Example: {"uuid-1": 1.0, "uuid-2": 0.5}`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });

        const textRaw = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textRaw) {
          const scores = JSON.parse(textRaw);
          for (const item of essayQuestionsArray) {
            const aiScore = scores[item.id];
            if (typeof aiScore === "number") {
              earnedPoints += aiScore;
              aiScoresMap[item.id] = aiScore;
            }
          }
        }
      } catch (err) {
        console.error("AI Grading Exception:", err);
      }
    }

    const totalQuestions = quizData.questions.length;
    const finalScore =
      totalQuestions > 0
        ? Math.round((earnedPoints / totalQuestions) * 100)
        : 0;

    const [savedAttempt] = await db
      .insert(quiz_attempt)
      .values({
        quizId: quizId,
        studentId: profileUser.id,
        score: finalScore,
        startedAt: new Date(),
        finishedAt: new Date(),
      })
      .returning({ id: quiz_attempt.id });

    if (savedAttempt) {
      const answerRecords = quizData.questions.map((q) => {
        const uAnswer = answers[q.id] || "";
        let isCorrect = false;

        if (q.type === "essay") {
          const score = aiScoresMap[q.id] || 0;
          isCorrect = score >= 0.7;
        } else {
          isCorrect = uAnswer === q.correctAnswer;
        }

        return {
          attemptId: savedAttempt.id,
          questionId: q.id,
          answer: uAnswer,
          isCorrect: isCorrect,
        };
      });

      if (answerRecords.length > 0) {
        await db.insert(quiz_answer).values(answerRecords);
      }
    }

    revalidatePath(`/siswa/kelas/${classId}/materi/${materiId}`);

    return { success: true, score: finalScore };
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return { success: false, error: "Failed to submit quiz" };
  }
}

export async function getStudentMaterialDetail(
  materiId: string,
  classId: string
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return null;

    const profileUser = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });
    if (!profileUser) return null;

    // 1. Get Material Info
    const materialData = await db.query.materi.findFirst({
      where: eq(materi.id, materiId),
    });

    if (!materialData) return null;

    // A. Quiz
    let quizDataRaw = null;
    let studentQuizAttempt = null;

    if (materialData.flags?.quiz) {
      const q = await db.query.quiz.findFirst({
        where: eq(quiz.materiId, materiId),
        with: {
          questions: true,
        },
      });

      if (q) {
        quizDataRaw = q;
        const attempt = await db.query.quiz_attempt.findFirst({
          where: and(
            eq(quiz_attempt.quizId, q.id),
            eq(quiz_attempt.studentId, profileUser.id)
          ),
          orderBy: desc(quiz_attempt.startedAt),
        });
        studentQuizAttempt = attempt;
      }
    }

    // B. Teachback
    let teachbackData = null;
    if (materialData.flags?.teachback) {
      const tb = await db.query.teachback_submission.findFirst({
        where: and(
          eq(teachback_submission.materiId, materiId),
          eq(teachback_submission.studentId, profileUser.id),
          eq(teachback_submission.kelasId, classId)
        ),
      });
      teachbackData = tb;
    }

    // C. Assignment
    let assignmentDataRaw = null;
    let studentAssignmentSubmission = null;
 
    if (materialData.flags?.assignment) {
      const assign = await db.query.assignment.findFirst({
        where: eq(assignment.materiId, materiId),
      });

      if (assign) {
        assignmentDataRaw = assign;
        const sub = await db.query.assignment_submission.findFirst({
          where: and(
            eq(assignment_submission.assignmentId, assign.id),
            eq(assignment_submission.studentId, profileUser.id)
          ),
        });
        studentAssignmentSubmission = sub;
      }
    }

    return {
      material: materialData,
      quiz: {
        data: quizDataRaw,
        attempt: studentQuizAttempt,
      },
      teachback: {
        submission: teachbackData,
      },
      assignment: {
        data: assignmentDataRaw,
        submission: studentAssignmentSubmission,
      },
      user: profileUser,
    };
  } catch (error) {
    console.error("Error fetching student material detail:", error);
    return null;
  }
}
