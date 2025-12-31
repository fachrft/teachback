"use server";

import { db } from "@/lib/db";
import {
  kelas_member,
  materi_kelas,
  materi,
  teachback_submission,
  quiz_attempt,
  assignment_submission,
  quiz,
  assignment,
  profile,
} from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth/get-user";
import { and, eq, inArray, isNotNull } from "drizzle-orm";

export interface DashboardTask {
  id: string;
  title: string;
  type: "teachback" | "quiz" | "assignment";
  className: string;
  classId: string;
  url: string;
}

export interface DashboardData {
  userName: string;
  activeClassesCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
  pendingTasks: DashboardTask[];
}

export async function getStudentDashboardData(): Promise<DashboardData> {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.user_id, authUser.id),
  });

  if (!userProfile) throw new Error("User not found");

  const userId = userProfile.id;

  const joinedClasses = await db.query.kelas_member.findMany({
    where: eq(kelas_member.userId, userId),
    with: {
      kelas: true,
    },
  });

  const activeClassesCount = joinedClasses.length;

  if (activeClassesCount === 0) {
    return {
      userName: userProfile.name || "Siswa",
      activeClassesCount: 0,
      pendingTasksCount: 0,
      completedTasksCount: 0,
      pendingTasks: [],
    };
  }

  const classIds = joinedClasses.map((jc) => jc.kelasId);

  const materialsInClasses = await db.query.materi_kelas.findMany({
    where: inArray(materi_kelas.kelasId, classIds),
    with: {
      materi: true,
      kelas: true,
    },
  });

  const materialIds = materialsInClasses.map((mk) => mk.materiId);

  if (materialIds.length === 0) {
    return {
      userName: userProfile?.name || "Siswa",
      activeClassesCount,
      pendingTasksCount: 0,
      completedTasksCount: 0,
      pendingTasks: [],
    };
  }

  const [tbSubmissions, qAttempts, aSubmissions] = await Promise.all([
    db.query.teachback_submission.findMany({
      where: and(
        eq(teachback_submission.studentId, userId),
        isNotNull(teachback_submission.score)
      ),
    }),
    db.query.quiz_attempt.findMany({
      where: eq(quiz_attempt.studentId, userId),
    }),
    db.query.assignment_submission.findMany({
      where: eq(assignment_submission.studentId, userId),
    }),
  ]);

  const [quizzes, assignments] = await Promise.all([
    db.query.quiz.findMany({
      where: inArray(quiz.materiId, materialIds),
    }),
    db.query.assignment.findMany({
      where: inArray(assignment.materiId, materialIds),
    }),
  ]);

  const tbSet = new Set(tbSubmissions.map((s) => s.materiId));
  console.log(tbSet);
  const userQuizAttemptIds = new Set(qAttempts.map((q) => q.quizId));
  const userAssignSubmitIds = new Set(aSubmissions.map((a) => a.assignmentId));

  const materiQuizMap = new Map<string, string[]>();
  quizzes.forEach((q) => {
    if (!q.materiId) return;
    if (!materiQuizMap.has(q.materiId)) materiQuizMap.set(q.materiId, []);
    materiQuizMap.get(q.materiId)?.push(q.id);
  });

  const materiAssignMap = new Map<string, string[]>();
  assignments.forEach((a) => {
    if (!a.materiId) return;
    if (!materiAssignMap.has(a.materiId)) materiAssignMap.set(a.materiId, []);
    materiAssignMap.get(a.materiId)?.push(a.id);
  });

  let pendingTasksCount = 0;
  let completedTasksCount = 0;
  const pendingTasks: DashboardTask[] = [];

  materialsInClasses.sort((a, b) => {
    return (
      new Date(b.materi.createdAt).getTime() -
      new Date(a.materi.createdAt).getTime()
    );
  });

  for (const mk of materialsInClasses) {
    const m = mk.materi;
    const c = mk.kelas;
    const flags = m.flags as {
      quiz: boolean;
      teachback: boolean;
      assignment: boolean;
    };

    // Check Teachback
    if (flags?.teachback) {
      if (tbSet.has(m.id)) {
        completedTasksCount++;
      } else {
        pendingTasksCount++;
        pendingTasks.push({
          id: `${m.id}-tb`,
          title: `Teachback: ${m.name}`,
          type: "teachback",
          className: c.name,
          classId: c.id,
          url: `/siswa/kelas/${c.id}/materi/${m.id}`,
        });
      }
    }

    // Check Quiz
    if (flags?.quiz) {
      const qIds = materiQuizMap.get(m.id) || [];
      if (qIds.length > 0) {
        const isDone = qIds.some((qid) => userQuizAttemptIds.has(qid));
        if (isDone) {
          completedTasksCount++;
        } else {
          pendingTasksCount++;
          pendingTasks.push({
            id: `${m.id}-qz`,
            title: `Kuis: ${m.name}`,
            type: "quiz",
            className: c.name,
            classId: c.id,
            url: `/siswa/kelas/${c.id}/materi/${m.id}`,
          });
        }
      }
    }

    // Check Assignment
    if (flags?.assignment) {
      const aIds = materiAssignMap.get(m.id) || [];
      if (aIds.length > 0) {
        const isDone = aIds.some((aid) => userAssignSubmitIds.has(aid));
        if (isDone) {
          completedTasksCount++;
        } else {
          pendingTasksCount++;
          pendingTasks.push({
            id: `${m.id}-as`,
            title: `Tugas: ${m.name}`,
            type: "assignment",
            className: c.name,
            classId: c.id,
            url: `/siswa/kelas/${c.id}/materi/${m.id}`,
          });
        }
      }
    }
  }

  return {
    userName: userProfile?.name || "Siswa",
    activeClassesCount,
    pendingTasksCount,
    completedTasksCount,
    pendingTasks: pendingTasks.slice(0, 5), // Top 5 urgent
  };
}
