"use server";

import { db } from "@/lib/db";
import {
  materi,
  profile,
  kelas,
  materi_kelas,
  quiz,
  quiz_question,
  assignment,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/get-user";
import { UTApi } from "uploadthing/server";
import { uploadToGemini, ai } from "@/lib/gemini";

const utApi = new UTApi();

interface Material {
  id: string;
  name: string;
  fileUrl: string | null;
  flags: {
    quiz: boolean;
    teachback: boolean;
    assignment: boolean;
  } | null;
  createdAt: Date;
}

export async function getMaterials(): Promise<Material[]> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!userProfile) return [];

    const materials = await db
      .select()
      .from(materi)
      .where(eq(materi.createdBy, userProfile.id))
      .orderBy(desc(materi.createdAt));

    return materials;
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
}

export async function createMaterial(data: {
  name: string;
  fileUrl?: string;
  flags: {
    quiz: boolean;
    teachback: boolean;
    assignment: boolean;
  };
  assignmentDetails?: {
    title: string;
    instructions: string;
    deadline?: string;
  };
}) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!userProfile) throw new Error("User profile not found");

    // 1. Insert Material
    const newMaterial = await db
      .insert(materi)
      .values({
        name: data.name,
        fileUrl: data.fileUrl,
        createdBy: userProfile.id,
        flags: data.flags,
      })
      .returning();

    const createdMaterial = newMaterial[0];

    if (data.flags.assignment) {
      await db.insert(assignment).values({
        materiId: createdMaterial.id,
        title: data.assignmentDetails?.title || `Tugas: ${data.name}`,
        instructions:
          data.assignmentDetails?.instructions ||
          "Silakan kerjakan tugas sesuai instruksi yang diberikan oleh guru.",
        deadline: data.assignmentDetails?.deadline
          ? new Date(data.assignmentDetails.deadline)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      });
    }

    if (data.flags.quiz && data.fileUrl) {
      await generateAIQuiz(
        createdMaterial.id,
        createdMaterial.name,
        data.fileUrl
      );
    }

    return { success: true, data: createdMaterial };
  } catch (error) {
    console.error("Error creating material:", error);
    return { success: false, error: "Failed to create material" };
  }
}

export async function updateMaterial(
  id: string,
  data: {
    name: string;
    fileUrl?: string;
    flags: {
      quiz: boolean;
      teachback: boolean;
      assignment: boolean;
    };
  }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!userProfile) throw new Error("User profile not found");

    const existingMaterial = await db.query.materi.findFirst({
      where: and(eq(materi.id, id), eq(materi.createdBy, userProfile.id)),
    });

    if (!existingMaterial) throw new Error("Material not found");

    const shouldGenerateQuiz =
      data.flags.quiz &&
      data.fileUrl &&
      (!existingMaterial.flags?.quiz ||
        existingMaterial.fileUrl !== data.fileUrl);

    if (data.flags.assignment && !existingMaterial.flags?.assignment) {
      const existingAss = await db.query.assignment.findFirst({
        where: eq(assignment.materiId, id),
      });

      if (!existingAss) {
        await db.insert(assignment).values({
          materiId: id,
          title: `Tugas: ${data.name}`,
          instructions:
            "Silakan kerjakan tugas sesuai instruksi yang diberikan oleh guru.",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    // Update material
    const updatedMaterial = await db
      .update(materi)
      .set({
        name: data.name,
        fileUrl: data.fileUrl,
        flags: data.flags,
      })
      .where(and(eq(materi.id, id), eq(materi.createdBy, userProfile.id)))
      .returning();

    if (shouldGenerateQuiz) {
      await db.delete(quiz).where(eq(quiz.materiId, id));
      await generateAIQuiz(id, data.name, data.fileUrl!);
    }

    return { success: true, data: updatedMaterial[0] };
  } catch (error) {
    console.error("Error updating material:", error);
    return { success: false, error: "Failed to update material" };
  }
}

async function generateAIQuiz(
  materialId: string,
  materialName: string,
  fileUrl: string
) {
  try {
    let geminiContents: any[] = [];
    const quizDescription = "Generated by AI";
    const fileRef = await uploadToGemini(fileUrl, "application/pdf");

    if (fileRef) {
      geminiContents = [
        {
          parts: [
            {
              fileData: {
                mimeType: fileRef.mimeType,
                fileUri: fileRef.uri,
              },
            },
            {
              text: `Buatkan 5 soal kuis yang BERKUALITAS berdasarkan materi file ini dengan komposisi:
                  - 4 Soal Pilihan Ganda (type: 'multiple_choice')
                  - 1 Soal Essay/Uraian (type: 'essay')

                  Ketentuan:
                  - Soal harus menantang pemahaman konsep (HOTS).
                  - Gunakan Bahasa Indonesia yang baik dan gunakan bahasa yang dasar banget yang mudah di pahami oleh pelajar di kelasnya atau tingkatanya, dan yg asik soalnya jangan yg terlalu kaku.
                  - 'options': Untuk Pilihan Ganda isi dengan 4 pilihan [A,B,C,D]. Untuk Essay isi array kosong [].
                  - 'correctAnswer': Untuk PG isi jawaban benarnya. Untuk Essay isi poin-poin jawaban singkat yang diharapkan.
                  `,
            },
          ],
        },
      ];
    } else {
      throw new Error("Failed to upload file to Gemini");
    }

    // Generate Content
    if (geminiContents.length > 0) {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: geminiContents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY" as any,
            items: {
              type: "OBJECT" as any,
              properties: {
                question: { type: "STRING" as any },
                type: {
                  type: "STRING" as any,
                  enum: ["multiple_choice", "essay"],
                },
                options: {
                  type: "ARRAY" as any,
                  items: { type: "STRING" as any },
                },
                correctAnswer: { type: "STRING" as any },
              },
              required: ["question", "type", "options", "correctAnswer"],
            },
          },
        },
      });

      const responseText = result.text;
      const quizData = JSON.parse(responseText || "[]");

      // Save Quiz to Database
      const newQuiz = await db
        .insert(quiz)
        .values({
          materiId: materialId,
          title: `Kuis: ${materialName}`,
          description: quizDescription,
        })
        .returning();

      if (newQuiz[0] && Array.isArray(quizData)) {
        await db.insert(quiz_question).values(
          quizData.map((q: any, index: number) => ({
            quizId: newQuiz[0].id,
            question: q.question,
            type: q.type || "multiple_choice",
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: index + 1,
          }))
        );
        console.log("✅ AI Quiz Generated & Saved Successfully!");
      }
    }
  } catch (aiError) {
    console.error("❌ AI Generation Failed:", aiError);
  }
}

export async function deleteMaterial(id: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!userProfile) throw new Error("User profile not found");

    const materialToDelete = await db.query.materi.findFirst({
      where: and(eq(materi.id, id), eq(materi.createdBy, userProfile.id)),
    });

    if (!materialToDelete) throw new Error("Material not found");

    if (materialToDelete.fileUrl) {
      await deleteFile(materialToDelete.fileUrl);
    }

    await db
      .delete(materi)
      .where(and(eq(materi.id, id), eq(materi.createdBy, userProfile.id)));

    return { success: true };
  } catch (error) {
    console.error("Error deleting material:", error);
    return { success: false, error: "Failed to delete material" };
  }
}

export async function deleteFile(fileUrl: string) {
  try {
    const fileKey = fileUrl.split("/f/")[1];
    await utApi.deleteFiles(fileKey);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: "Failed to delete file" };
  }
}

export async function getClasses(materiId?: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    const userProfile = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });

    if (!userProfile) throw new Error("User profile not found");

    const classesData = await db
      .select()
      .from(kelas)
      .where(eq(kelas.createdBy, userProfile.id))
      .orderBy(desc(kelas.createdAt));

    if (!materiId) {
      return classesData.map((c) => ({ ...c, isAssigned: false }));
    }

    const assignments = await db
      .select()
      .from(materi_kelas)
      .where(eq(materi_kelas.materiId, materiId));

    const assignedClassIds = new Set(assignments.map((a) => a.kelasId));

    return classesData.map((c) => ({
      ...c,
      isAssigned: assignedClassIds.has(c.id),
    }));
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

export async function assignMateriToClass(idKelas: string, idMateri: string) {
  try {
    await db.insert(materi_kelas).values({
      kelasId: idKelas,
      materiId: idMateri,
    });

    return { success: true };
  } catch (error) {
    console.error("Error assigning material to class:", error);
    return { success: false, error: "Failed to assign material to class" };
  }
}

export async function getMaterialDetail(id: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    // Debugging: Fetch profile using standard select
    const userProfiles = await db
      .select()
      .from(profile)
      .where(eq(profile.user_id, authUser.id))
      .limit(1);

    const userProfile = userProfiles[0];

    if (!userProfile) {
      console.error("Profile not found for user:", authUser.id);
    }

    if (!userProfile) throw new Error("User profile not found");

    const material = await db.query.materi.findFirst({
      where: and(eq(materi.id, id), eq(materi.createdBy, userProfile.id)),
    });

    return material;
  } catch (error) {
    console.error("Error fetching material detail:", error);
    return null;
  }
}

export async function getQuizByMaterialId(materiId: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    const quizData = await db.query.quiz.findFirst({
      where: eq(quiz.materiId, materiId),
    });

    if (!quizData) return null;

    const questions = await db.query.quiz_question.findMany({
      where: eq(quiz_question.quizId, quizData.id),
      orderBy: (questions, { asc }) => [asc(questions.order)],
    });

    return {
      ...quizData,
      questions,
    };
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return null;
  }
}

export async function updateQuizQuestion(
  questionId: string,
  data: {
    question: string;
    options: string[] | null;
    correctAnswer: string;
  }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) throw new Error("Unauthorized");

    await db
      .update(quiz_question)
      .set({
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
      })
      .where(eq(quiz_question.id, questionId));

    return { success: true };
  } catch (error) {
    console.error("Error updating quiz question:", error);
    return { success: false, error: "Failed to update quiz question" };
  }
}
