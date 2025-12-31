"use server";

import { getAuthUser } from "@/lib/auth/get-user";
import { db } from "@/lib/db";
import {
  kelas,
  kelas_member,
  teachback_submission,
  profile,
  materi,
  materi_kelas,
  assignment,
  assignment_submission,
} from "@/lib/db/schema";
import { count, desc, eq, and, sql, isNotNull, inArray } from "drizzle-orm";

export async function getTeacherDashboardStats() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return null;

    // 1. Get Classes
    const classes = await db
      .select({
        id: kelas.id,
        name: kelas.name,
        studentCount: count(kelas_member.userId),
      })
      .from(kelas)
      .leftJoin(kelas_member, eq(kelas.id, kelas_member.kelasId))
      .groupBy(kelas.id)
      .orderBy(desc(kelas.createdAt));

    const totalClasses = classes.length;
    const totalStudents = classes.reduce(
      (acc, c) => acc + Number(c.studentCount),
      0
    );

    const pendingReviewsQuery = await db
      .select({ count: count() })
      .from(teachback_submission)
      .innerJoin(kelas, eq(teachback_submission.kelasId, kelas.id))
      .where(
        and(
          isNotNull(teachback_submission.score),
          eq(teachback_submission.status, "PENDING")
        )
      );

    const pendingReviews = pendingReviewsQuery[0].count;

    const recentPendingReviews = await db
      .select({
        id: teachback_submission.id,
        kelasId: teachback_submission.kelasId,
        materiId: teachback_submission.materiId,
        studentId: teachback_submission.studentId,
        studentName: profile.name,
        className: kelas.name,
        topic: materi.name,
        submittedAt: teachback_submission.updatedAt,
      })
      .from(teachback_submission)
      .innerJoin(profile, eq(teachback_submission.studentId, profile.id))
      .innerJoin(kelas, eq(teachback_submission.kelasId, kelas.id))
      .innerJoin(materi, eq(teachback_submission.materiId, materi.id))
      .where(
        and(
          isNotNull(teachback_submission.score),
          eq(teachback_submission.status, "PENDING")
        )
      )
      .orderBy(desc(teachback_submission.updatedAt))
      .limit(5);


    const classStats = await Promise.all(
      classes.map(async (c) => {
        const mats = await db
          .select({
            id: materi.id,
            flags: materi.flags,
          })
          .from(materi)
          .innerJoin(materi_kelas, eq(materi.id, materi_kelas.materiId))
          .where(eq(materi_kelas.kelasId, c.id));

        const teachbackMatIds = mats
          .filter((m) => m.flags?.teachback)
          .map((m) => m.id);
        const assignmentMatIds = mats
          .filter((m) => m.flags?.assignment)
          .map((m) => m.id);

        if (teachbackMatIds.length === 0 && assignmentMatIds.length === 0) {
          return { ...c, incompleteCount: 0 };
        }

        const students = await db
          .select({ id: kelas_member.userId })
          .from(kelas_member)
          .where(eq(kelas_member.kelasId, c.id));

        if (students.length === 0) return { ...c, incompleteCount: 0 };

        let incompleteStudentCount = 0;
        const tbSubs = await db
          .select({
            sid: teachback_submission.studentId,
            mid: teachback_submission.materiId,
          })
          .from(teachback_submission)
          .where(eq(teachback_submission.kelasId, c.id));

        let assignSubs: any[] = [];
        if (assignmentMatIds.length > 0) {
          try {
            const assigns = await db
              .select({ id: assignment.id, mid: assignment.materiId })
              .from(assignment)
              .where(inArray(assignment.materiId, assignmentMatIds));
            const assignIds = assigns.map((a) => a.id);

            if (assignIds.length > 0) {
              const asRes = await db
                .select({
                  sid: assignment_submission.studentId,
                  aid: assignment_submission.assignmentId,
                })
                .from(assignment_submission)
                .where(inArray(assignment_submission.assignmentId, assignIds));

              assignSubs = asRes.map((sub) => {
                const linkedAssign = assigns.find((a) => a.id === sub.aid);
                return { sid: sub.sid, mid: linkedAssign?.mid };
              });
            }
          } catch (e) {
            console.error("Error fetching assignment subs", e);
          }
        }

        // Check each student
        for (const s of students) {
          let missing = false;

          // Check Teachbacks
          for (const tid of teachbackMatIds) {
            if (!tbSubs.find((sub) => sub.sid === s.id && sub.mid === tid)) {
              missing = true;
              break;
            }
          }
          if (missing) {
            incompleteStudentCount++;
            continue;
          }

          // Check Assignments
          for (const aid of assignmentMatIds) {
            if (
              !assignSubs.find((sub) => sub.sid === s.id && sub.mid === aid)
            ) {
              missing = true;
              break;
            }
          }
          if (missing) incompleteStudentCount++;
        }

        return {
          ...c,
          incompleteCount: incompleteStudentCount,
        };
      })
    );

    // Sort classes by highest incompletion
    classStats.sort((a, b) => b.incompleteCount - a.incompleteCount);

    console.log(classStats);

    return {
      totalClasses,
      totalStudents,
      pendingReviews,
      recentPendingReviews,
      classStats: classStats.slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching teacher dashboard stats:", error);
    return null;
  }
}
