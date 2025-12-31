"use server";
import { getAuthUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db";
import {
  profile,
  kelas_member,
  teachback_submission,
  quiz_attempt,
  assignment_submission,
  kelas,
  materi,
  materi_kelas,
  assignment,
  quiz,
} from "@/lib/db/schema";
import { eq, avg, desc, sql, and, isNotNull } from "drizzle-orm";

export async function getSingleClass(classId: string) {
  try {
    const response = await db.query.kelas.findFirst({
      where: eq(kelas.id, classId),
    });
    return response;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function getSiswaWithStats(classId: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return [];

    const classMaterials = await db
      .select({
        id: materi.id,
        flags: materi.flags,
      })
      .from(materi)
      .innerJoin(materi_kelas, eq(materi.id, materi_kelas.materiId))
      .where(eq(materi_kelas.kelasId, classId));

    let totalActivities = 0;
    classMaterials.forEach((m) => {
      if (m.flags?.teachback) totalActivities++;
      if (m.flags?.quiz) totalActivities++;
      if (m.flags?.assignment) totalActivities++;
    });

    const students = await db
      .select({
        id: profile.id,
        name: profile.name,
      })
      .from(kelas_member)
      .innerJoin(profile, eq(kelas_member.userId, profile.id))
      .where(eq(kelas_member.kelasId, classId));

    if (students.length === 0) return [];

    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const teachbackStats = await db
          .select({
            score: avg(teachback_submission.score),
            count: sql<number>`count(distinct ${teachback_submission.materiId})`,
          })
          .from(teachback_submission)
          .where(
            sql`${teachback_submission.studentId} = ${student.id} AND ${teachback_submission.kelasId} = ${classId}`
          );

        // Quiz Stats & Count
        const quizStats = await db
          .select({
            score: avg(quiz_attempt.score),
            count: sql<number>`count(distinct ${quiz_attempt.quizId})`,
          })
          .from(quiz_attempt)
          .where(eq(quiz_attempt.studentId, student.id));

        // Assignment Stats & Count
        const assignmentStats = await db
          .select({
            score: avg(assignment_submission.grade),
            count: sql<number>`count(distinct ${assignment_submission.assignmentId})`,
          })
          .from(assignment_submission)
          .where(eq(assignment_submission.studentId, student.id));

        const avgTeachback = Number(teachbackStats[0]?.score) || 0;
        const avgQuiz = Number(quizStats[0]?.score) || 0;
        const avgAssignment = Number(assignmentStats[0]?.score) || 0;

        const completedCount =
          Number(teachbackStats[0]?.count || 0) +
          Number(quizStats[0]?.count || 0) +
          Number(assignmentStats[0]?.count || 0);

        const pendingCount = Math.max(0, totalActivities - completedCount);

        const components = [avgTeachback, avgQuiz, avgAssignment].filter(
          (s) => s > 0
        );
        const finalScore =
          components.length > 0
            ? components.reduce((a, b) => a + b, 0) / components.length
            : 0;
        let status = "Perlu Perhatian";
        let statusColor = "destructive";
        if (finalScore >= 85) {
          status = "Sangat Baik";
          statusColor = "primary";
        } else if (finalScore >= 70) {
          status = "Baik";
          statusColor = "success";
        } else if (finalScore >= 50) {
          status = "Cukup";
          statusColor = "warning";
        } else if (finalScore > 0) {
          status = "Beresiko";
          statusColor = "destructive";
        } else {
          status = "-";
          statusColor = "secondary";
        }

        // Fetch Last Activity Dates
        const tbDateRes = await db
          .select({ date: teachback_submission.updatedAt })
          .from(teachback_submission)
          .where(
            sql`${teachback_submission.studentId} = ${student.id} AND ${teachback_submission.kelasId} = ${classId}`
          )
          .orderBy(desc(teachback_submission.updatedAt))
          .limit(1);

        const qDateRes = await db
          .select({ date: quiz_attempt.startedAt })
          .from(quiz_attempt)
          .where(eq(quiz_attempt.studentId, student.id))
          .orderBy(desc(quiz_attempt.startedAt))
          .limit(1);

        const aDateRes = await db
          .select({ date: assignment_submission.submittedAt })
          .from(assignment_submission)
          .where(eq(assignment_submission.studentId, student.id))
          .orderBy(desc(assignment_submission.submittedAt))
          .limit(1);

        const dates = [
          tbDateRes[0]?.date ? new Date(tbDateRes[0].date) : null,
          qDateRes[0]?.date ? new Date(qDateRes[0].date) : null,
          aDateRes[0]?.date ? new Date(aDateRes[0].date) : null,
        ].filter((d) => d !== null) as Date[];

        let lastActivity = "-";
        if (dates.length > 0) {
          dates.sort((a, b) => b.getTime() - a.getTime());
          const maxDate = dates[0];
          lastActivity = maxDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        return {
          ...student,
          averageScore: Math.round(finalScore),
          status,
          statusColor,
          lastActivity,
          pendingCount,
        };
      })
    );

    return studentsWithStats;
  } catch (error) {
    console.error("Error fetching student stats:", error);
    return [];
  }
}

export async function getAssignedMaterials(classId: string) {
  try {
    const materials = await db
      .select({
        id: materi.id,
        name: materi.name,
        fileUrl: materi.fileUrl,
        flags: materi.flags,
        createdAt: materi.createdAt,
      })
      .from(materi)
      .innerJoin(materi_kelas, eq(materi.id, materi_kelas.materiId))
      .where(eq(materi_kelas.kelasId, classId))
      .orderBy(desc(materi.createdAt));

    return materials;
  } catch (error) {
    console.error("Error fetching assigned materials:", error);
    return [];
  }
}

export async function getAvailableMaterialsForClass(classId: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return [];

    const allMaterials = await db
      .select({
        id: materi.id,
        name: materi.name,
        createdAt: materi.createdAt,
        type: materi.flags,
      })
      .from(materi)
      .orderBy(desc(materi.createdAt));

    const assigned = await db
      .select({ materiId: materi_kelas.materiId })
      .from(materi_kelas)
      .where(eq(materi_kelas.kelasId, classId));

    const assignedIds = new Set(assigned.map((a) => a.materiId));

    return allMaterials.filter((m) => !assignedIds.has(m.id));
  } catch (error) {
    console.error("Error fetching available materials:", error);
    return [];
  }
}

export async function assignMaterialToClass(classId: string, materiId: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    await db.insert(materi_kelas).values({
      id: crypto.randomUUID(),
      kelasId: classId,
      materiId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error assigning material:", error);
    return { success: false, error: "Gagal menambahkan materi ke kelas" };
  }
}

export async function removeMaterialFromClass(
  classId: string,
  materiId: string
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    await db
      .delete(materi_kelas)
      .where(
        and(
          eq(materi_kelas.kelasId, classId),
          eq(materi_kelas.materiId, materiId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error removing material from class:", error);
    return { success: false, error: "Gagal menghapus materi dari kelas" };
  }
}

export async function getStudentDetailedStats(
  classId: string,
  studentId: string
) {
  try {
    const student = await db.query.profile.findFirst({
      where: eq(profile.id, studentId),
    });

    if (!student) return null;

    const teachbacks = await db
      .select({
        id: teachback_submission.id,
        score: teachback_submission.score,
        updatedAt: teachback_submission.updatedAt,
        title: materi.name,
        type: sql<string>`'Teachback'`,
      })
      .from(teachback_submission)
      .leftJoin(materi, eq(teachback_submission.materiId, materi.id))
      .where(
        and(
          eq(teachback_submission.studentId, studentId),
          eq(teachback_submission.kelasId, classId),
          isNotNull(teachback_submission.score)
        )
      );

    const quizzes = await db
      .select({
        id: quiz_attempt.id,
        score: quiz_attempt.score,
        updatedAt: quiz_attempt.startedAt,
        title: materi.name,
        type: sql<string>`'Kuis'`,
      })
      .from(quiz_attempt)
      .leftJoin(quiz, eq(quiz_attempt.quizId, quiz.id))
      .leftJoin(materi, eq(quiz.materiId, materi.id))
      .where(eq(quiz_attempt.studentId, studentId));

    const assignments = await db
      .select({
        id: assignment_submission.id,
        score: assignment_submission.grade,
        updatedAt: assignment_submission.submittedAt,
        title: assignment.title,
        type: sql<string>`'Tugas'`,
      })
      .from(assignment_submission)
      .leftJoin(
        assignment,
        eq(assignment_submission.assignmentId, assignment.id)
      )
      .where(eq(assignment_submission.studentId, studentId));

    const classMaterials = await db
      .select({
        id: materi.id,
        flags: materi.flags,
      })
      .from(materi)
      .innerJoin(materi_kelas, eq(materi.id, materi_kelas.materiId))
      .where(eq(materi_kelas.kelasId, classId));

    const totalTeachbackAvailable = classMaterials.filter(
      (m) => m.flags?.teachback
    ).length;
    const totalQuizAvailable = classMaterials.filter(
      (m) => m.flags?.quiz
    ).length;
    const totalAssignmentAvailable = classMaterials.filter(
      (m) => m.flags?.assignment
    ).length;

    const activities = [
      ...teachbacks.map((t) => ({
        ...t,
        updatedAt: t.updatedAt || new Date(),
      })),
      ...quizzes.map((q) => ({
        ...q,
        title: q.title ? `Kuis: ${q.title}` : "Kuis",
        updatedAt: q.updatedAt || new Date(),
      })),
      ...assignments.map((a) => ({
        ...a,
        updatedAt: a.updatedAt || new Date(),
      })),
    ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const gradedActivities = activities.filter((a) => a.score !== null);
    const totalScore = gradedActivities.reduce(
      (acc, curr) => acc + (curr.score || 0),
      0
    );
    const avgScore =
      gradedActivities.length > 0
        ? Math.round(totalScore / gradedActivities.length)
        : 0;

    const teachbackCount = activities.filter(
      (a) => a.type === "Teachback"
    ).length;
    const quizCount = activities.filter((a) => a.type === "Kuis").length;
    const assignmentCount = activities.filter((a) => a.type === "Tugas").length;

    return {
      student,
      stats: {
        avgScore,
        totalActivities: activities.length,
        teachbackCount,
        totalTeachbackAvailable,
        quizCount,
        totalQuizAvailable,
        assignmentCount,
        totalAssignmentAvailable,
        lastActivity: activities[0]?.updatedAt,
      },
      activities,
    };
  } catch (error) {
    console.error("Error fetching detailed student stats:", error);
    return null;
  }
}
