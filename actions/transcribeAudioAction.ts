"use server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import speech from "@google-cloud/speech";

async function saveFileToDisk(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join("./tmp", `${uuidv4()}_${file.name}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function handleAudioTranscribe(formData: FormData) {
  let inputFilePath: string | null = null;
  let monoFilePath: string | null = null;

  try {
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return {
        status: "failed",
        message: "Audio File Required",
      };
    }

    inputFilePath = await saveFileToDisk(audioFile);

    const audioBuffer = fs.readFileSync(inputFilePath);

    const audio = { content: audioBuffer.toString("base64") };
    const config = {
      encoding: "WEBM_OPUS" as const,
      languageCode: "en-IN",
    };

    const request = { audio, config };

    const speechClient = new speech.SpeechClient();

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0].transcript)
      .join("\n")
      .trim();

    return {
      status: "success",
      transcript: transcription,
    };
  } catch (error) {
    console.log(error);
    return { status: "failed" };
  } finally {
    if (inputFilePath && fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }
    if (monoFilePath && fs.existsSync(monoFilePath)) {
      fs.unlinkSync(monoFilePath);
    }
  }
}