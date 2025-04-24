"use client";

import { useEffect, useRef } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../../context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../../context/MicrophoneContextProvider";

interface SpeechRecognitionProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  isMicrophoneStopped: boolean;
  onTranscriptionChange: (transcript: string) => void;
  finalTranscript: string;
  onTranscriptionComplete: (finalTranscript: string) => void;
}

const SpeechRecognition = ({
  isRecording,
  onStart,
  onStop,
  onPause,
  onTranscriptionChange,
  isMicrophoneStopped,
  finalTranscript,
  onTranscriptionComplete
}: SpeechRecognitionProps): JSX.Element => {
  const { connection, connectToDeepgram, connectionState, disconnectFromDeepgram } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, pauseMicrophone, microphoneState } = useMicrophone();

  const keepAliveInterval = useRef<any>();
  const voiceActivityCheckInterval = useRef<any>();
  const lastVoiceActivity = useRef<number>(Date.now());
  const isInitialized = useRef<boolean>(false);


  // Initialize recording setup
  const initializeRecording = async () => {
    if (isInitialized.current) return;

    try {
      console.log("🎤 Initializing new recording session");
      await setupMicrophone();
      lastVoiceActivity.current = Date.now();
      isInitialized.current = true;
    } catch (error) {
      console.error("❌ Error initializing recording:", error);
      onStop();
    }
  };

  useEffect(() => {
    if (!isRecording) {
      console.log("🔚 Pausing recording session");
      pauseMicrophone()
    }
  }, [isRecording])

  useEffect(() => {
    if (isMicrophoneStopped) {
      console.log("🔚 Stopping recording session");
      disconnectFromDeepgram();
      // stopMicrophone();
    }
  }, [isMicrophoneStopped])

  useEffect(() => {
    if (isRecording) {
      lastVoiceActivity.current = Date.now();
      initializeRecording();

      voiceActivityCheckInterval.current = setInterval(() => {
        const timeSinceLastVoice = Date.now() - lastVoiceActivity.current;
        // console.log("⏲️ Time since last voice activity:", Math.round(timeSinceLastVoice / 1000), "seconds");
        // console.log("finalTranscript len:: ",finalTranscript.length)
        if (finalTranscript.length > 0 && timeSinceLastVoice > 3000) {
          // console.log("🔇 No voice activity detected for 3 seconds and has existing transcription");
          onTranscriptionComplete(finalTranscript);
        }
      }, 1000);
    }

    return () => {
      clearInterval(voiceActivityCheckInterval.current);
    };
  }, [isRecording, finalTranscript, onTranscriptionComplete]);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready && isRecording) {
      console.log("🎙️ Microphone Ready - Connecting to Deepgram");
      lastVoiceActivity.current = Date.now();
      connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }

    console.log("🔊 Microphone State:", microphoneState);
  }, [microphoneState, isRecording]);

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal } = data;
      let thisTranscript = data.channel.alternatives[0].transcript;
      // console.log("thisCaption: ",thisTranscript)
      if (thisTranscript.trim() !== "") {
        lastVoiceActivity.current = Date.now();
        console.log("🗣️ Voice activity detected");

        if (isFinal) {
          // console.log("✅ Final Transcript:", thisTranscript);
          onTranscriptionChange(thisTranscript);
        }
      }
    };

    if (connectionState === LiveConnectionState.OPEN && isRecording) {
      // console.log("🔌 Connection Open - Starting Transcription");
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();
    }

    return () => {
      // console.log("🔇 Cleaning up transcription listeners");
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
    };
  }, [connectionState, isRecording]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN &&
      isRecording
    ) {
      console.log("💫 Keeping connection alive");
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
  }, [microphoneState, connectionState, isRecording]);

  return <div />;
};

export default SpeechRecognition;