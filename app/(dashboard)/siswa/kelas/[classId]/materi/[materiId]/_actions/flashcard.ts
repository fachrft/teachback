"use server";

import { ai, uploadToGemini } from "@/lib/gemini";
import { db } from "@/lib/db";
import { flashcard } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface Flashcard {
  front: string;
  back: string;
}

export async function getFlashcards(materiId: string) {
  try {
    const existingCards = await db.query.flashcard.findMany({
      where: eq(flashcard.materiId, materiId),
      orderBy: (cards, { asc }) => [asc(cards.order)],
    });

    return {
      success: true,
      flashcards: existingCards.map((c) => ({
        front: c.front,
        back: c.back,
      })),
    };
  } catch (error) {
    console.error("Get Flashcards Error:", error);
    return { success: false, flashcards: [] };
  }
}

export async function generateFlashcards(
  materiId: string,
  materialName: string,
  contextText: string,
  fileUrl: string | null
) {
  try {
    const existingCards = await db.query.flashcard.findMany({
      where: eq(flashcard.materiId, materiId),
      orderBy: (cards, { asc }) => [asc(cards.order)],
    });

    if (existingCards.length > 0) {
      return {
        success: true,
        flashcards: existingCards.map((c) => ({
          front: c.front,
          back: c.back,
        })),
      };
    }

    let extractedContext = contextText || materialName;

    if (fileUrl) {
      try {
        const fileRef = await uploadToGemini(fileUrl, "application/pdf");
        if (fileRef) {
          const prompt = `
            Analisis dokumen materi "${materialName}" ini. 
            Buatlah 5-8 Flashcards (Kartu Belajar) berkualitas tinggi untuk membantu siswa menghapal konsep kunci.
            
            Kriteria:
            - Front: Pertanyaan ringkas, Istilah, atau Konsep.
            - Back: Jawaban padat, Definisi jelas, atau Penjelasan inti (Maks 2 kalimat).
            - Jangan buat pertanyaan yang jawabannya terlalu panjang.
            - Bahasa: Indonesia (santai tapi edukatif).

            Output WAJIB JSON Array:
            [
                { "front": "Apa itu Fotosintesis?", "back": "Proses tumbuhan mengubah cahaya matahari jadi makanan." },
                ...
            ]
            `;

          const result = await ai.models.generateContent({
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
                  { text: prompt },
                ],
              },
            ],
            config: { responseMimeType: "application/json" },
          });

          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleanText = text.replace(/```json|```/g, "").trim();
            const cards = JSON.parse(cleanText);

            if (cards.length > 0) {
              await db.insert(flashcard).values(
                cards.map((c: any, idx: number) => ({
                  materiId,
                  front: c.front,
                  back: c.back,
                  order: idx,
                }))
              );
            }

            return { success: true, flashcards: cards };
          }
        }
      } catch (e) {
        console.error("PDF Processing Error:", e);
      }
    }
    const textPrompt = `
        Materi: "${extractedContext}"
        Judul: "${materialName}"

        Buatlah 5-8 Flashcards (Kartu Belajar) berdasarkan materi di atas.
        
        Kriteria:
        - Front: Pertanyaan/Istilah.
        - Back: Jawaban/Definisi (Pendek & Jelas).
        
        Output WAJIB JSON Array:
        [ { "front": "...", "back": "..." } ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: textPrompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("No response from AI");

    const cleanText = resultText.replace(/```json|```/g, "").trim();
    const flashcardsAI = JSON.parse(cleanText);

    if (flashcardsAI.length > 0) {
      await db.insert(flashcard).values(
        flashcardsAI.map((c: any, idx: number) => ({
          materiId,
          front: c.front,
          back: c.back,
          order: idx,
        }))
      );
    }

    return { success: true, flashcards: flashcardsAI };
  } catch (error) {
    console.error("Generate Flashcards Error:", error);
    return { success: false, error: "Gagal membuat flashcards" };
  }
}
