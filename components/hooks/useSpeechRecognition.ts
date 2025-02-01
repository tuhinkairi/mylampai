import { useState, useCallback, useRef, useEffect } from 'react';
import { TranscriptResult } from '@/types/transcript';
import { useWebSocketContext } from '@/hooks/interviewersocket/webSocketContext';


interface UseSpeechRecognitionProps {
  onTranscriptUpdate?: (transcript: TranscriptResult) => void;
  onError?: (error: Error) => void;
}

export const useSpeechRecognition = ({
  onTranscriptUpdate,
  onError
}: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState<TranscriptResult | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<TranscriptResult | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');

  
  // const websocketRef = useRef<WebSocket | null>(null);
  const { ws } = useWebSocketContext();
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);


  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionStatus(status.state);
        
        status.addEventListener('change', () => {
          setPermissionStatus(status.state);
        });
        
        return () => {
          status.removeEventListener('change', () => {
            setPermissionStatus(status.state);
          });
        };
      } catch (error) {
        console.error("Permission check failed:", error);
        setPermissionStatus('prompt');
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
        audio: true 
      });
      
      // Stop initial stream immediately
      initialStream.getTracks().forEach(track => track.stop());
      
      // Now request with actual constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16
        }
      });
      
      console.log("Microphone access granted");
      return stream;
      
    } catch (error) {
      console.error("Microphone access error:", error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('Microphone access was denied. Please check your browser settings and try again.');
      }
      throw error;
    }
  }, []);

  const initializeAudioProcessing = useCallback(async () => {
    try {
      const stream = await requestMicrophoneAccess();
      mediaStreamRef.current = stream;
      console.log("MediaStream initialized");

      const audioContext = new AudioContext({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });
      audioContextRef.current = audioContext;
      console.log("AudioContext created with sample rate:", audioContext.sampleRate);

      console.log("Loading audio worklet module");
      await audioContext.audioWorklet.addModule('/audioProcessor.js');
      console.log("Audio worklet module loaded");

      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        processorOptions: {
          bufferSize: 1024
        }
      });
      console.log("AudioWorkletNode created");

      workletNode.port.onmessage = (event) => {
        if (!ws) return;
        console.log("Received message from AudioWorklet:", event.data.audioData);
        
        const audioData = event.data.audioData;
        if (audioData && audioData.byteLength > 0) {
            // Convert the audio buffer to Int16Array
            const audioArray = new Int16Array(audioData);
            
            // Verify the data before sending
            if (audioArray.length > 0) {
                console.log("Sending audio data, samples:", audioArray);
                
                try {
                    ws.send(JSON.stringify({
                        type: "speech_to_text",
                        audioData: Array.from(audioArray) // Convert to regular array for JSON serialization
                    }));
                } catch (error) {
                    console.error("Error sending audio data:", error);
                }
            }
        }
    };

      workletNode.port.onmessageerror = (error) => {
        console.error('AudioWorklet message error:', error);
        onError?.(new Error('Audio processing error'));
      };

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(workletNode);
      workletNode.connect(audioContext.destination);
      console.log("Audio nodes connected");

      workletNodeRef.current = workletNode;

      if (audioContext.state === 'suspended') {
        console.log("Resuming suspended audio context");
        await audioContext.resume();
        console.log("Audio context resumed");
      }

    } catch (error) {
      console.error('Audio initialization error:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        onError?.(new Error('Microphone access was denied. Please grant permission to use the microphone.'));
      } else {
        onError?.(error as Error);
      }
      throw error;
    }
  }, [isRecording, onError]);

  const startRecording = useCallback(async () => {
    if (!isRecording) {
      await initializeAudioProcessing();
    };

    try {
      if(ws){
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log(data);
          switch (data.type) {
            case "get_transcript":
              const transcript: TranscriptResult = JSON.parse(event.data.message);
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
          
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          onError?.(new Error('WebSocket error'));
        };
      }

      // websocketRef.current = ws;
    } catch (error) {
      console.error('Recording start error:', error);
      onError?.(error as Error);
    }
  }, [ws, isRecording, initializeAudioProcessing, onTranscriptUpdate, onError]);

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
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
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
    permissionStatus
  };
};