"use server";

import { db } from "@/lib/db";
import {
  kelas_member,
  profile,
  materi,
  quiz,
  quiz_attempt,
  teachback_submission,
  assignment,
  assignment_submission,
  kelas,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/get-user";

export async function getClassMaterialMonitoring(
  classId: string,
  materiId: string
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    // Get Class Info
    const classData = await db.query.kelas.findFirst({
      where: eq(kelas.id, classId),
    });

    if (!classData) return null;

    // 1. Get Material Info
    const materialData = await db.query.materi.findFirst({
      where: eq(materi.id, materiId),
    });

    if (!materialData) return null;

    // 2. Get Students in Class
    const students = await db
      .select({
        id: profile.id,
        name: profile.name,
      })
      .from(kelas_member)
      .innerJoin(profile, eq(kelas_member.userId, profile.id))
      .where(eq(kelas_member.kelasId, classId));

    // 3. Get Student Progress
    const progressData = await Promise.all(
      students.map(async (student) => {
        const quizData = await db.query.quiz.findFirst({
          where: eq(quiz.materiId, materiId),
        });

        let quizScore = null;
        let quizStatus = "Belum";

        if (quizData) {
          const attempts = await db
            .select()
            .from(quiz_attempt)
            .where(
              and(
                eq(quiz_attempt.quizId, quizData.id),
                eq(quiz_attempt.studentId, student.id)
              )
            )
            .orderBy(desc(quiz_attempt.score)); // Get best score

          if (attempts.length > 0) {
            quizScore = attempts[0].score;
            quizStatus = "Selesai";
          }
        }

        const tbSubmission = await db.query.teachback_submission.findFirst({
          where: and(
            eq(teachback_submission.materiId, materiId),
            eq(teachback_submission.studentId, student.id),
            eq(teachback_submission.kelasId, classId)
          ),
        });

        const teachbackStatus = tbSubmission ? tbSubmission.status : "Belum";
        const teachbackScore = tbSubmission ? tbSubmission.score : null;

        const assignmentData = await db.query.assignment.findFirst({
          where: eq(assignment.materiId, materiId),
        });

        let assignmentStatus = "Tidak Ada";
        let assignmentGrade = null;

        if (assignmentData) {
          const sub = await db.query.assignment_submission.findFirst({
            where: and(
              eq(assignment_submission.assignmentId, assignmentData.id),
              eq(assignment_submission.studentId, student.id)
            ),
          });

          if (sub) {
            assignmentStatus = "Dikumpulkan";
            assignmentGrade = sub.grade;
          } else {
            assignmentStatus = "Belum";
          }
        }

        return {
          student,
          quiz: {
            exists: !!quizData,
            score: quizScore,
            status: quizStatus,
          },
          teachback: {
            exists: materialData.flags?.teachback,
            status: teachbackStatus,
            score: teachbackScore,
            id: tbSubmission?.id,
          },
          assignment: {
            exists: !!assignmentData,
            status: assignmentStatus,
            grade: assignmentGrade,
          },
        };
      })
    );

    return {
      material: materialData,
      kelas: classData,
      students: progressData,
    };
  } catch (error) {
    console.error("Error fetching class material monitoring:", error);
    return null;
  }
}

export async function getStudentWorkDetail(
  materiId: string,
  classId: string,
  studentId: string
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    const materialData = await db.query.materi.findFirst({
      where: eq(materi.id, materiId),
    });

    if (!materialData) return null;

    const classData = await db.query.kelas.findFirst({
      where: eq(kelas.id, classId),
    });

    if (!classData) return null;

    // 1. Get Student Info
    const studentData = await db.query.profile.findFirst({
      where: eq(profile.id, studentId),
    });
    if (!studentData) return null;

    // 2. Get Quiz Data & Submission (Full Details)
    const quizData = await db.query.quiz.findFirst({
      where: eq(quiz.materiId, materiId),
      with: {
        questions: true,
      },
    });

    let quizResult = null;
    if (quizData) {
      const attempt = await db.query.quiz_attempt.findFirst({
        where: and(
          eq(quiz_attempt.quizId, quizData.id),
          eq(quiz_attempt.studentId, studentId)
        ),
        orderBy: desc(quiz_attempt.score),
        with: {
          answers: true,
        },
      });
      quizResult = {
        meta: quizData,
        attempt: attempt,
      };
    }

    // 3. Get Teachback Submission
    const teachbackResult = await db.query.teachback_submission.findFirst({
      where: and(
        eq(teachback_submission.materiId, materiId),
        eq(teachback_submission.studentId, studentId),
        eq(teachback_submission.kelasId, classId)
      ),
    });

    // 4. Get Assignment Submission
    const assignmentData = await db.query.assignment.findFirst({
      where: eq(assignment.materiId, materiId),
    });

    let assignmentResult = null;
    if (assignmentData) {
      const sub = await db.query.assignment_submission.findFirst({
        where: and(
          eq(assignment_submission.assignmentId, assignmentData.id),
          eq(assignment_submission.studentId, studentId)
        ),
      });
      assignmentResult = {
        meta: assignmentData,
        submission: sub,
      };
    }

    return {
      student: studentData,
      quiz: quizResult,
      class: classData,
      material: materialData,
      teachback: teachbackResult,
      assignment: assignmentResult,
    };
  } catch (error) {
    console.error("Error fetching student work detail:", error);
    return null;
  }
}

export async function changeStatusTeachback(teachbackId: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    const teachbackData = await db.query.teachback_submission.findFirst({
      where: eq(teachback_submission.id, teachbackId),
    });

    if (!teachbackData) return null;

    await db.update(teachback_submission).set({
      status: "REVIEWED",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error changing teachback status:", error);
    return null;
  }
}

export async function updateStudentScore(
  type: "quiz" | "teachback",
  id: string,
  score: number
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    if (type === "quiz") {
      await db
        .update(quiz_attempt)
        .set({ score: score })
        .where(eq(quiz_attempt.id, id));
    } else {
      await db
        .update(teachback_submission)
        .set({ score: score })
        .where(eq(teachback_submission.id, id));
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating score:", error);
    return { success: false, error: "Failed to update score" };
  }
}

export async function updateTeachbackFeedback(
  teachbackId: string,
  newFeedback: string
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    await db
      .update(teachback_submission)
      .set({
        feedback: newFeedback,
        updatedAt: new Date(),
      })
      .where(eq(teachback_submission.id, teachbackId));

    return { success: true };
  } catch (error) {
    console.error("Error updating feedback:", error);
    return { success: false, error: "Failed to update feedback" };
  }
}
