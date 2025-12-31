"use server";
import {
  kelas,
  kelas_member,
  teachback_submission,
  materi,
  materi_kelas,
} from "@/lib/db/schema";
import { db } from "@/lib/db";
import { profile } from "@/lib/db/schema";
import { eq, count, and, desc, isNotNull } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/get-user";

export async function getClasses() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      throw new Error("Unauthorized");
    }

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!userProfile) {
      return [];
    }

    const classes = await db
      .select()
      .from(kelas)
      .where(eq(kelas.createdBy, userProfile.id));

    if (!classes || classes.length === 0) {
      return [];
    }

    const classesWithStats = await Promise.all(
      classes.map(async (c) => {
        const studentCountResult = await db
          .select({ count: count() })
          .from(kelas_member)
          .where(eq(kelas_member.kelasId, c.id));
        const students = studentCountResult[0]?.count || 0;

        const pendingReviewsResult = await db
          .select({ count: count() })
          .from(teachback_submission)
          .where(
            and(
              eq(teachback_submission.kelasId, c.id),
              eq(teachback_submission.status, "PENDING"),
              isNotNull(teachback_submission.score)
            )
          );
        const pendingReviews = pendingReviewsResult[0]?.count || 0;

        const latestMateriResult = await db
          .select({
            name: materi.name,
          })
          .from(materi)
          .innerJoin(materi_kelas, eq(materi.id, materi_kelas.materiId))
          .where(eq(materi_kelas.kelasId, c.id))
          .orderBy(desc(materi.createdAt))
          .limit(1);

        const activeTopic = latestMateriResult[0]?.name || "Belum ada materi";

        return {
          ...c,
          students,
          pendingReviews,
          activeTopic,
          code: c.kode,
        };
      })
    );

    return classesWithStats;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

export async function createClass(data: any) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      throw new Error("Unauthorized");
    }
    const user = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });
    if (!user) {
      throw new Error("Unauthorized");
    }
    const newClass = await db
      .insert(kelas)
      .values({ ...data, createdBy: user.id })
      .returning();

    return {
      message: "Class created successfully",
      data: newClass,
    };
  } catch (error) {
    console.error("Error creating class:", error);
    return null;
  }
}

export async function updateClass(id: string, data: any) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      throw new Error("Unauthorized");
    }

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!userProfile) {
      throw new Error("Unauthorized");
    }

    const updatedClass = await db
      .update(kelas)
      .set({ ...data })
      .where(and(eq(kelas.id, id), eq(kelas.createdBy, userProfile.id)))
      .returning();

    return {
      message: "Class updated successfully",
      data: updatedClass,
    };
  } catch (error) {
    console.error("Error updating class:", error);
    return null;
  }
}

export async function deleteClass(id: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      throw new Error("Unauthorized");
    }

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!userProfile) {
      throw new Error("Unauthorized");
    }

    const deletedClass = await db
      .delete(kelas)
      .where(and(eq(kelas.id, id), eq(kelas.createdBy, userProfile.id)))
      .returning();

    return {
      message: "Class deleted successfully",
      data: deletedClass,
    };
  } catch (error) {
    console.error("Error deleting class:", error);
    return null;
  }
}
