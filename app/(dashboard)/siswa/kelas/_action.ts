"use server";

import { db } from "@/lib/db";
import { kelas, kelas_member, profile } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

export async function joinClass(code: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return { success: false, error: "Unauthorized" };

    const profileUser = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!profileUser) return { success: false, error: "Unauthorized" };

    const targetClass = await db.query.kelas.findFirst({
      where: eq(kelas.kode, code),
    });

    if (!targetClass) {
      return {
        success: false,
        error: "Kelas tidak ditemukan dengan kode tersebut.",
      };
    }

    const existingMember = await db.query.kelas_member.findFirst({
      where: and(
        eq(kelas_member.kelasId, targetClass.id),
        eq(kelas_member.userId, authUser.id)
      ),
    });

    if (existingMember) {
      return { success: false, error: "Anda sudah bergabung di kelas ini." };
    }

    await db.insert(kelas_member).values({
      kelasId: targetClass.id,
      userId: profileUser.id,
    });

    revalidatePath("/siswa/kelas");
    return { success: true, message: "Berhasil bergabung ke kelas!" };
  } catch (error) {
    console.error("Error joining class:", error);
    return { success: false, error: "Gagal bergabung ke kelas" };
  }
}

export async function getStudentClasses() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return [];

    const profileUser = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!profileUser) return { success: false, error: "Unauthorized" };

    const myClasses = await db
      .select({
        id: kelas.id,
        name: kelas.name,
        kode: kelas.kode,
        teacherName: profile.name, // Guru
        joinedAt: kelas_member.createdAt,
      })
      .from(kelas_member)
      .innerJoin(kelas, eq(kelas_member.kelasId, kelas.id))
      .innerJoin(profile, eq(kelas.createdBy, profile.id))
      .where(eq(kelas_member.userId, profileUser.id));

    return myClasses;
  } catch (error) {
    console.error("Error fetching student classes:", error);
    return [];
  }
}
