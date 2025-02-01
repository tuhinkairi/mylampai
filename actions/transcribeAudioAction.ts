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

// const create_cloud_phrase_set = (self, project_id: str, location: str) => {
//   const phrases = self.load_technical_phrases();

//   const phrase_set_id = `${self.role.value.replace("_", "-")}-${
//     self.experience_level
//   }`.toLowerCase();
//   const phrase_set_name = `projects/${project_id}/locations/${location}/phraseSets/${phrase_set_id}`;

//   const client = new speech.AdaptationClient();

//   try {
//     const existing_phrase_set = client.getPhraseSet({
//       name: phrase_set_name,
//     });
//     console.log(`Using existing phrase set: ${phrase_set_name}`);
//     self.phrase_sets[self.role] = existing_phrase_set.name;
//     return;
//   } catch (e) {
//     console.log(`Phrase set does not exist, creating a new one: {e}`);
//   }

//   const phrase_set = new speech.PhraseSet();

//   const boost_value = {
//     junior: 15.0,
//     mid: 20.0,
//     senior: 25.0,
//     lead: 30.0,
//   }.get(self.experience_level, 20.0);

//   for (const phrase of phrases) {
//     phrase_set.phrases.append(
//       speech.PhraseSet.Phrase((value = phrase), (boost = boost_value))
//     );
//   }
  
//   const request = speech.CreatePhraseSetRequest(
//     (parent = "projects/{project_id}/locations/{location}"),
//     (phrase_set_id = phrase_set_id),
//     (phrase_set = phrase_set)
//   );

//   const phrase_set_result = client.createPhraseSet({
//     request: request,
//   });

//   self.phrase_sets[self.role] = phrase_set_result.name;
//   console.log(`Created new phrase set: ${phrase_set_result.name}`);
// };

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
