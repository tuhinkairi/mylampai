import textToSpeech from "@google-cloud/text-to-speech";

const textClient = new textToSpeech.TextToSpeechClient();

export default textClient;
