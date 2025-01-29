"use server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import speech from "@google-cloud/speech";
import { readBlobAsBase64 } from "@/utils/readBlobAsBase64";

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
    const audioBlob = formData.get("audio");
    console.log("audioBlob", audioBlob);

    if (!audioBlob || !(audioBlob instanceof Blob)) {
      return {
        status: "failed",
        message: "Audio File Required",
      };
    }

    // inputFilePath = await saveFileToDisk(audioFile);
    // console.log("inputFilePath", inputFilePath);
    // const audioBuffer = fs.readFileSync(inputFilePath);

    // const audio = { content: audioBuffer.toString("base64") };
    let base64Uri = "";
    const foundBase64 = (await readBlobAsBase64(audioBlob)) as string;
        // Example: data:audio/wav;base64,asdjfioasjdfoaipsjdf
        const removedPrefixBase64 = foundBase64.split("base64,")[1];
        base64Uri = removedPrefixBase64;

    const config = {
      encoding: "WEBM_OPUS" as const,
      languageCode: "en-IN",
    };

    const request = { base64Uri, config };

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




