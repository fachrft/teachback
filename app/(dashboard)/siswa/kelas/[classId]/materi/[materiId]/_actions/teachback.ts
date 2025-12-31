"use server";

import { db } from "@/lib/db";
import { teachback_submission, profile, materi } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth/get-user";
import { ai, uploadToGemini } from "@/lib/gemini";


export async function startTeachbackSession(
  materiId: string,
  classId: string,
  materialName: string,
  contextText: string,
  fileUrl: string | null
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return { success: false, error: "Unauthorized" };

    const profileUser = await db.query.profile.findFirst({
      where: eq(profile.user_id, authUser.id),
    });
    if (!profileUser) return { success: false, error: "Profile Not Found" };

    const existingSession = await db.query.teachback_submission.findFirst({
      where: and(
        eq(teachback_submission.materiId, materiId),
        eq(teachback_submission.studentId, profileUser.id),
        eq(teachback_submission.kelasId, classId)
      ),
    });

    if (existingSession) {
      return { success: true, session: existingSession };
    }

    let extractedContext = contextText || materialName;

    if (fileUrl) {
      try {
        const fileRef = await uploadToGemini(fileUrl, "application/pdf");
        if (fileRef) {
          const summaryRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              {
                parts: [
                  {
                    fileData: {
                      mimeType: fileRef.mimeType,
                      fileUri: fileRef.uri,
                    },
                  },
                  {
                    text: "Analisis dokumen ini. Buatlah ringkasan komprehensif yang mencakup konsep utama, definisi penting, dan fakta kunci. Ringkasan ini akan digunakan sebagai 'Kunci Jawaban' atau referensi bagi AI Guru untuk menilai pemahaman siswa.",
                  },
                ],
              },
            ],
          });
          const text = summaryRes.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            extractedContext = text;
          }
        }
      } catch (e) {
        console.error("Failed to process PDF for teachback context:", e);
      }
    }

    const initialMessage = {
      role: "model",
      text: `Waduh ${profileUser.name}, jujur aja gue masih agak bingung sama materi "${materialName}" ini. Tadi lu nyimak kan? Coba dong jelasin ke gue pake bahasa santai, intinya tentang apa sih?`,
    };

    const transcript = [
      { role: "system_context", text: extractedContext },
      initialMessage,
    ];

    const [newSession] = await db
      .insert(teachback_submission)
      .values({
        materiId,
        studentId: profileUser.id,
        kelasId: classId,
        transcript: transcript,
        status: "PENDING",
      })
      .returning();

    return { success: true, session: newSession };
  } catch (error) {
    console.error("Error starting teachback:", error);
    return { success: false, error: "Failed to start session" };
  }
}

export async function sendTeachbackMessage(
  sessionId: string,
  userMessage: string,
  currentTranscript: any[],
  materiContext: string
) {
  try {
    const systemContextMsg = currentTranscript.find(
      (m) => m.role === "system_context"
    );
    const realContext = systemContextMsg
      ? systemContextMsg.text
      : materiContext;

    const chatHistory = currentTranscript
      .filter((m) => m.role === "user" || m.role === "model")
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

    // Add current user message
    const updatedChatHistory = [
      ...chatHistory,
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const systemInstruction = `Kamu bermain peran sebagai teman sekelas pengguna yang sedang bingung. 
                              Tujuanmu: Meminta pengguna (yang berperan sebagai "Guru" dadakan) untuk menjelaskan materi ini kepadamu sampai kamu paham.
                              
                              PEGANGAN MATERI (Ini kunci jawabanmu, jangan bocorkan straight-forward, tapi gunakan untuk memvalidasi penjelasan user):
                              "${realContext}"

                              Instruksi Gaya & Perilaku:
                              1. Gaya Bahasa: Santai, akrab, fun, friendly ala anak sekolah (Gunakan "gue/lu", "aku/kamu", tapi tetap sopan). Jangan kaku seperti robot/guru.
                              2. Jadilah "Siswa yang ingin tahu": Banyak bertanya, minta contoh nyata, dan minta disederhanakan.
                              3. Jika penjelasan user BENAR: Respon antusias ("Ohh gitu maksudnya! Paham gue."), lalu tanya pertanyaan lanjutan yang agak kritis ("Tapi kalau kasusnya X gimana tuh?").
                              4. Jika penjelasan user SALAH: Jangan mengoreksi! Tapi ragukan dia. ("Eh serius? Perasaan tadi di buku bukan gitu deh, bukannya Y ya?").
                              5. Jika penjelasan user SUSAH: ("Aduh pusing, pake bahasa gampang aja dong, contohnya gimana?").
                              6. Teruslah gali sampai pengguna benar-benar menjelaskan inti materinya dengan lengkap.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        {
          role: "model",
          parts: [
            {
              text: "Oke sip, gue siap jadi teman sekelas yang bakal nanya-nanya terus sampe ngerti! Gas!",
            },
          ],
        }, // Priming
        ...updatedChatHistory,
      ],
    });

    const aiResponseText =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Duh, bentar otak gue loading... Gimana tadi?";

    const finalTranscript = [
      ...currentTranscript,
      { role: "user", text: userMessage },
      { role: "model", text: aiResponseText },
    ];

    await db
      .update(teachback_submission)
      .set({ transcript: finalTranscript, updatedAt: new Date() })
      .where(eq(teachback_submission.id, sessionId));

    return { success: true, newTranscript: finalTranscript };
  } catch (error) {
    console.error("Teachback Chat Error:", error);
    return { success: false, error: "Failed to process message" };
  }
}

export async function finishTeachbackSession(
  sessionId: string,
  transcript: any[],
  materiContext: string
) {
  try {
    const gradingPrompt = `
        Analisis sesi Teachback berikut antara Siswa dan AI Guru.
        Materi: "${materiContext}"
        Transcript: ${JSON.stringify(transcript)}

        Berikan penilaian akhir:
        1. score (0-100): Seberapa baik pemahaman siswa?
        2. feedback: Ringkasan singkat kekuatan dan area yang perlu ditingkatkan (maks 3 kalimat).

        Output JSON only: { "score": 85, "feedback": "Penjelasanmu..." }
        `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: gradingPrompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    let score = 0;
    let feedback = "Sesi selesai.";

    if (resultText) {
      const cleanText = resultText.replace(/```json|```/g, "").trim();
      const json = JSON.parse(cleanText);
      score = json.score || 0;
      feedback = json.feedback || "";
    }

    await db
      .update(teachback_submission)
      .set({
        score: score,
        feedback: feedback,
        updatedAt: new Date(),
      })
      .where(eq(teachback_submission.id, sessionId));

    return { success: true, score, feedback };
  } catch (error) {
    console.error("Grading Error:", error);
    return { success: false };
  }
}
