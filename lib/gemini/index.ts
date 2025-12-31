import { GoogleGenAI } from "@google/genai";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY!,
});

export async function uploadToGemini(fileUrl: string, mimeType: string) {
  let filePath = "";
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("gagal di fetch");

    const buffer = Buffer.from(await response.arrayBuffer());
    const tempDir = os.tmpdir();

    const fileName = `gemini_${Date.now()}_${Math.random()}_${path.basename(
      fileUrl
    )}`;
    filePath = path.join(tempDir, fileName);

    await fs.writeFile(filePath, buffer);

    const uploadResult = await ai.files.upload({
      file: filePath,
      config: {
        mimeType,
      },
    });

    return uploadResult;
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    await fs.unlink(filePath).catch((err) => {
      console.log(err);
    });
  }
}
