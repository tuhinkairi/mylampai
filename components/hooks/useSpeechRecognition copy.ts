import { useState, useCallback, useRef, useEffect } from "react";
import { TranscriptResult } from "@/types/transcript";
import { useWebSocketContext } from "@/hooks/interviewersocket/webSocketContext";
import { readBlobAsBase64 } from "@/utils/readBlobAsBase64";

interface UseSpeechRecognitionProps {
  onTranscriptUpdate?: (transcript: TranscriptResult) => void;
  onError?: (error: Error) => void;
}

export const useSpeechRecognition = ({
  onTranscriptUpdate,
  onError,
}: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] =
    useState<TranscriptResult | null>(null);
  const [interimTranscript, setInterimTranscript] =
    useState<TranscriptResult | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState>("prompt");

  // const websocketRef = useRef<WebSocket | null>(null);
  const { ws, connectWebSocket, disconnectWebSocket } = useWebSocketContext();
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        const status = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        setPermissionStatus(status.state);

        status.addEventListener("change", () => {
          setPermissionStatus(status.state);
        });

        return () => {
          status.removeEventListener("change", () => {
            setPermissionStatus(status.state);
          });
        };
      } catch (error) {
        console.error("Permission check failed:", error);
        setPermissionStatus("prompt");
      }
    };

    checkPermissionStatus();
  }, []);

  const requestMicrophoneAccess = useCallback(async () => {
    console.log("Starting microphone access request");

    // Force a permission prompt by requesting media access first
    try {
      // Request with minimal constraints to trigger permission prompt
      const initialStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Stop initial stream immediately
      initialStream.getTracks().forEach((track) => track.stop());

      // Now request with actual constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16
        },
      });

      console.log("Microphone access granted");
      return stream;
    } catch (error) {
      console.error("Microphone access error:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        throw new Error(
          "Microphone access was denied. Please check your browser settings and try again."
        );
      }
      throw error;
    }
  }, []);

  // function convertFloat32ToInt16(buffer:any) {
  //   let l = buffer.length;
  //   const buf = new Int16Array(l);
  //   while (l--) {
  //     buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
  //   }
  //   return buf.buffer;
  // }

  // function downsampleBuffer(buffer:any, inputSampleRate:number, outputSampleRate:number) {
  //   if (inputSampleRate === outputSampleRate) {
  //     return buffer;
  //   }
  //   var sampleRateRatio = inputSampleRate / outputSampleRate;
  //   var newLength = Math.round(buffer.length / sampleRateRatio);
  //   var result = new Float32Array(newLength);
  //   var offsetResult = 0;
  //   var offsetBuffer = 0;
  //   while (offsetResult < result.length) {
  //     var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
  //     var accum = 0, count = 0;
  //     for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
  //       accum += buffer[i];
  //       count++;
  //     }
  //     result[offsetResult] = accum / count;
  //     offsetResult++;
  //     offsetBuffer = nextOffsetBuffer;
  //   }
  //   return result;
  // }

  // function processAudio(data:any) {
  //   const inputSampleRate = 48000;
  //   const outputSampleRate = 16000;

  //   const downsampledBuffer = downsampleBuffer(data, inputSampleRate, outputSampleRate);
  //   const audioData = convertFloat32ToInt16(downsampledBuffer);
  //   console.log("debug 123: ",audioData)
  //   const audioArray = new Int16Array(audioData);
  //   try {
  //     if (!ws) return;
  //     ws.send(JSON.stringify({
  //         type: "speech_to_text",
  //         audioData:Array.from(audioArray)
  //     }));
  // } catch (error) {
  //     console.error("Error sending audio data:", error);
  // }

  // }

  const initializeAudioProcessing = useCallback(async () => {
    try {
      // console.log("debug in initializing audio ")
      // Ensure WebSocket is connected before processing audio
      if (!ws) {
        const newWs = connectWebSocket();
        // You might want to wait for the connection to be fully established
        await new Promise<void>((resolve) => {
          newWs.onopen = () => resolve();
        });
      }
      const stream = await requestMicrophoneAccess();
      mediaStreamRef.current = stream;
      console.log("MediaStream initialized");

      const audioContext = new AudioContext({
        sampleRate: 16000,
        latencyHint: "interactive",
      });

      audioContextRef.current = audioContext;
      console.log(
        "AudioContext created with sample rate:",
        audioContext.sampleRate
      );

      console.log("Loading audio worklet module");
      await audioContext.audioWorklet.addModule("/audioProcessor.js");
      console.log("Audio worklet module loaded");

      const workletNode = new AudioWorkletNode(
        audioContext,
        "audio-processor",
        {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          processorOptions: {
            bufferSize: 1024,
          },
        }
      );
      console.log("AudioWorkletNode created");

      workletNode.port.onmessage = (event) => {
        // if (!ws) return;
        console.log(
          "Received message from AudioWorklet:",
          event.data.audioData
        );

        const audioData = event.data.audioData;
        if (audioData && audioData.byteLength > 0) {
          // Convert the audio buffer to Int16Array
          const audioArray = new Int16Array(audioData);
          // const audioArray = audioData;
          // processAudio(audioData)
          // Verify the data before sending
          if (audioArray.length > 0) {
            console.log("Sending audio data, samples:", audioArray);

            try {
              // Ensure WebSocket is open before sending
              if (ws?.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: "speech_to_text",
                    audioData: Array.from(audioArray),
                  })
                );
              } else {
                console.warn("WebSocket is not open");
              }
            } catch (error) {
              console.error("Error sending audio data:", error);
            }
          }
        }
      };

      workletNode.port.onmessageerror = (error) => {
        console.error("AudioWorklet message error:", error);
        onError?.(new Error("Audio processing error"));
      };

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(workletNode);
      workletNode.connect(audioContext.destination);
      console.log("Audio nodes connected");

      workletNodeRef.current = workletNode;

      if (audioContext.state === "suspended") {
        console.log("Resuming suspended audio context");
        await audioContext.resume();
        console.log("Audio context resumed");
      }

      // //TODO

      // if (
      //   mediaRecorder.current &&
      //   mediaRecorder.current.state === "recording"
      // ) {
      //   mediaRecorder.current.stop();
      // }
      // if (!audioStream.current) {
      //   audioStream.current = await navigator.mediaDevices.getUserMedia({
      //     audio: true,
      //   });
      // }

      // mediaRecorder.current = new MediaRecorder(audioStream.current, {
      //   mimeType: "audio/webm; codecs=opus",
      //   audioBitsPerSecond: 16000,
      // });

      // mediaRecorder.current.ondataavailable = (e: BlobEvent) => {
      //   if (e.data.size > 0) {
      //     audioChunks.current.push(e.data);
      //   }
      // };

      // mediaRecorder.current.onstop = async () => {
      //   const recordedBlob = new Blob(audioChunks.current, {
      //     type: "audio/webm",
      //   });

      //   audioChunks.current = [];

      //   if (recordedBlob.size === 0) {
      //     return;
      //   }

      //   if (!ws) return;

      //   console.log("sendig audio data:: ", recordedBlob);

      //   ws?.send(
      //     JSON.stringify({
      //       type: "speech_to_text",
      //       audioData: recordedBlob,
      //     })
      //   );
      // };
    } catch (error) {
      console.error("Audio initialization error:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        onError?.(
          new Error(
            "Microphone access was denied. Please grant permission to use the microphone."
          )
        );
      } else {
        onError?.(error as Error);
      }
      throw error;
    }
  }, [isRecording, onError]);

  const startRecording = useCallback(async () => {
    // if (!isRecording) {
    //   // console.log("debug wdjqwji")
    //   await initializeAudioProcessing();
    // }

    // try {
    //   if (ws) {
    //     ws.onmessage = (event) => {
    //       const data = JSON.parse(event.data);
    //       console.log(data);
    //       switch (data.type) {
    //         case "get_transcript":
    //           const transcript: TranscriptResult = JSON.parse(
    //             event.data.message
    //           );
    //           onTranscriptUpdate?.(transcript);

    //           if (transcript.is_final) {
    //             console.log("Final Transcript: ", transcript.text);
    //             setFinalTranscript(transcript);
    //           } else {
    //             setInterimTranscript(transcript);
    //           }
    //           break;
    //         default:
    //           break;
    //       }
    //     };

    //     ws.onerror = (error) => {
    //       console.error("WebSocket error:", error);
    //       onError?.(new Error("WebSocket error"));
    //     };
    //   }
    if (!isRecording) {
      try {
        await initializeAudioProcessing();

        // Only connect WebSocket if not already connected
        if (!ws) {
          const newWs = connectWebSocket();

          // Setup message handling
          newWs.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log(data);

              switch (data.type) {
                case "get_transcript":
                  const transcript: TranscriptResult = JSON.parse(
                    event.data.message
                  );
                  onTranscriptUpdate?.(transcript);

                  if (transcript.is_final) {
                    console.log("Final Transcript: ", transcript.text);
                    setFinalTranscript(transcript);
                  } else {
                    setInterimTranscript(transcript);
                  }
                  break;
                default:
                  break;
              }
            } catch (parseError) {
              console.error("Error parsing WebSocket message:", parseError);
            }
          };

          newWs.onerror = (error) => {
            console.error("WebSocket error:", error);
            onError?.(new Error("WebSocket error"));
          };
        }

        // Your existing recording start logic
        setIsRecording(true);
        // websocketRef.current = ws;
      } catch (error) {
        console.error("Recording start error:", error);
        onError?.(error as Error);
      }
    }
  }, [
    ws,
    connectWebSocket,
    disconnectWebSocket,
    isRecording,
    initializeAudioProcessing,
    onTranscriptUpdate,
    onError,
  ]);

  const stopRecording = useCallback(() => {
    // if (!isRecording) return;

    // Close WebSocket connection
    // if (websocketRef.current) {
    //   websocketRef.current.close();
    //   websocketRef.current = null;
    // }

    // Stop and cleanup audio processing
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    finalTranscript,
    interimTranscript,
    permissionStatus,
  };
};
