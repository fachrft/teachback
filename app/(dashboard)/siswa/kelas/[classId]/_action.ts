"use server";

import { db } from "@/lib/db";
import {
  kelas,
  profile,
  materi,
  materi_kelas,
  quiz,
  quiz_attempt,
  teachback_submission,
  assignment,
  assignment_submission,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/get-user";

export async function getStudentClassDetail(classId: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return null;

    const profileUser = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });
    if (!profileUser) return null;

    // 1. Get Class Info
    const classData = await db.query.kelas.findFirst({
      where: eq(kelas.id, classId),
      with: {
        profile: true,
      },
    });

    if (!classData) return null;

    // 2. Get Materi in this Class
    const materiList = await db
      .select({
        id: materi.id,
        name: materi.name,
        fileUrl: materi.fileUrl,
        createdAt: materi.createdAt,
        flags: materi.flags,
      })
      .from(materi_kelas)
      .innerJoin(materi, eq(materi_kelas.materiId, materi.id))
      .where(eq(materi_kelas.kelasId, classId));

    // 3. Process Progress for each Materi
    const materialsWithProgress = await Promise.all(
      materiList.map(async (m) => {
        // A. Quiz
        let quizStatus = "Belum";
        let quizScore = null;

        if (m.flags?.quiz) {
          const quizData = await db.query.quiz.findFirst({
            where: eq(quiz.materiId, m.id),
          });
          if (quizData) {
            const attempts = await db.query.quiz_attempt.findFirst({
              where: and(
                eq(quiz_attempt.quizId, quizData.id),
                eq(quiz_attempt.studentId, profileUser.id)
              ),
              orderBy: desc(quiz_attempt.score),
            });
            if (attempts) {
              quizStatus = "Selesai";
              quizScore = attempts.score;
            }
          }
        }

        // B. Teachback
        let teachbackStatus = "Belum";
        if (m.flags?.teachback) {
          const tb = await db.query.teachback_submission.findFirst({
            where: and(
              eq(teachback_submission.materiId, m.id),
              eq(teachback_submission.studentId, profileUser.id),
              eq(teachback_submission.kelasId, classId)
            ),
          });
          if (tb) {
            teachbackStatus = tb.status === "REVIEWED" ? "Ditinjau" : "Dikirim";
          }
        }

        // C. Assignment
        let assignmentStatus = "Belum";
        if (m.flags?.assignment) {
          const assign = await db.query.assignment.findFirst({
            where: eq(assignment.materiId, m.id),
          });
          if (assign) {
            const sub = await db.query.assignment_submission.findFirst({
              where: and(
                eq(assignment_submission.assignmentId, assign.id),
                eq(assignment_submission.studentId, profileUser.id)
              ),
            });
            if (sub) assignmentStatus = "Dikumpulkan";
          }
        }

        return {
          ...m,
          progress: {
            quiz: { status: quizStatus, score: quizScore },
            teachback: { status: teachbackStatus },
            assignment: { status: assignmentStatus },
          },
        };
      })
    );

    return {
      kelas: classData,
      materials: materialsWithProgress,
    };
  } catch (error) {
    console.error("Error fetching student class detail:", error);
    return null;
  }
}
