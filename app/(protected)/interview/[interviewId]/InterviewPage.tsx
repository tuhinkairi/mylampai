"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Analysis from "./Analysis";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import OnlineCompiler from "./OnlineCompiler";
import {
  handleInterviewState,
  handleMessageUpload,
  submitFeedback,
  updateInterviewVideo,
} from "@/actions/interviewActions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { generateSasUrlForInterview } from "@/actions/azureActions";
import { redirect, useParams, useRouter, useSearchParams } from "next/navigation";
import FullScreenLoader from "@/components/global/FullScreenLoader";
import { MessageSquare } from "lucide-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from "lucide-react";

import {
  RiEmotionUnhappyLine,
  RiEmotionNormalLine,
  RiEmotionLine,
} from "react-icons/ri";
import { useWebSocketContext } from "@/hooks/interviewersocket/webSocketContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

import SpeechRecognition from "@/components/speech-to-text/speechRecognition";
import axios from "axios";

type ChatMessage = {
  user: string;
  message: string;
};

type TemplateRubric = {
  id?: string;
  parameter: string;
  description: string;
  weightage: number;
};

const InterviewPage = () => {
  const params = useParams();
  const interviewId = params.interviewId as string;
  const searchParams = useSearchParams()
  const interviewType = searchParams.get("type");

  const [feedback, setFeedback] = useState("");
  const router = useRouter()

  const resTranscript = useRef("");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenDialogOpen, setFullscreenDialogOpen] = useState(false);

  const { interviewerWs, connectInterviewer, disconnectInterviewer } = useWebSocketContext();
  const ws = interviewerWs;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [audioURL, setAudioURL] = useState("");
  const [codingQuestion, setCodingQuestion] = useState("");
  const [timer, setTimer] = useState<Number>(0)

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const emptyTranscribeCnt = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const videoBlobClient = useRef<BlockBlobClient | null>(null);
  const audioBlobClient = useRef<BlockBlobClient | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);


  const [isRecording, setIsRecording] = useState(true);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewStage, setInterviewStage] = useState("initializing"); // initializing -> setup -> inProgress -> ending -> completed


  const [isStoppingMicrophone, setIsStoppingMicrophone] = useState(false);

  const recordedChunks = useRef<BlobPart[]>([]);


  const [rubrics, setRubrics] = useState<TemplateRubric[]>([]);

  const [lastInterviewerQuestion, setLastInterviewerQuestion] = useState<string>("");

  useEffect(() => {
    if (feedbackSubmitted) {
      setLoadingAnalysis(true);
    }
  }, [feedbackSubmitted])

  useEffect(() => {
    // Show fullscreen dialog after a short delay for better UX
    const timer = setTimeout(() => {
      if (!isFullscreen) {
        setFullscreenDialogOpen(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const disableFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch(err => {
          console.error("Error disabling fullscreen:", err);
          toast.error("Failed to exit fullscreen mode");
        });
    }
  };

  const setupBlobStorage = async (interviewId: string) => {
    const sasUrl = await generateSasUrlForInterview();

    if (!sasUrl?.sasUrl) {
      return;
    }

    const blobServiceClient = new BlobServiceClient(sasUrl.sasUrl);
    const containerClient =
      blobServiceClient.getContainerClient("interviews");
    // console.log("storing at : ", sasUrl.sasUrl)
    const timestamp = Date.now();

    videoBlobClient.current = containerClient.getBlockBlobClient(
      `${interviewId}_${timestamp}.webm`,
    );
  };

  useEffect(() => {
    const initializeInterview = async () => {
      try {
        setInterviewStage("initializing");

        if (!interviewerWs) {
          await connectInterviewer();
          return; // Wait for next effect cycle after connection
        }

        const storedData = sessionStorage.getItem('interviewData');
        if (!storedData) {
          toast.error("Interview data not found. Please restart setup.");
          return;
        }

        const { pdf_text, job_description, interview_id, rubrics } = JSON.parse(storedData);
        if (interview_id !== interviewId) {
          toast.error("Interview ID mismatch. Please restart setup.");
          return;
        }

        setInterviewStage("setup");
        setRubrics(rubrics);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = async () => {
              try {
                await videoRef.current?.play();
              } catch (playError) {
                console.warn("Video play error:", playError);
              }
            };
          } else {
            toast.error("Failed to access camera or microphone. Please check permissions.");
          }

          // Initialize blob storage for recording
          await setupBlobStorage(interviewId);

          if (!interviewStarted) {
            interviewerWs.send(
              JSON.stringify({
                type: "start_interview",
                cv_text: pdf_text,
                job_description: job_description,
                interview_id: interview_id
              })
            );

            setInterviewStarted(true);

            // setIsChatOpen(true);

            setInterviewStage("inProgress");

            if (interviewType) {
              // console.log("type to update:: ", interviewType)
              await handleInterviewState(interviewId, "In_Progress", interviewType);
            }
          }
        } catch (err) {
          console.error("Media setup error:", err);
          // toast.error("Failed to access camera or microphone. Please check permissions.");
        }
      } catch (error) {
        // console.error("Interview initialization error:", error);
        toast.error("Failed to initialize interview");
      }
    };

    initializeInterview();
  }, [interviewerWs, connectInterviewer, interviewId, interviewType, interviewStarted]);

  useEffect(() => {
    const scrollToBottom = () => {
      const chatContainer = document.getElementById('chat-messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    };

    scrollToBottom();

    // const timeoutId = setTimeout(() => {
    //   scrollToBottom();
    // }, 100);

    // return () => clearTimeout(timeoutId);
  }, [chatMessages]);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (message.trim() !== "") {
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { user: "You", message },
        ]);
        handleMessageUpload({
          interviewId,
          type: "answer",
          sender: "user",
          response: message,
        });
        // console.log("sending to AI: ", message)


        ws?.send(JSON.stringify({ type: "answer", answer: message }));
      }
    },
    [ws, interviewId],
  );

  const handleInterviewer = useCallback(async (text: string) => {
    try {
      const res = await fetch("/api/synthesis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Network response was not okay");
      }

      const { audioResponse } = await res.json();
      const audioBuffer = new Uint8Array(audioResponse.data);
      const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      // console.log("currently here.......")
      // if (loading) setLoading(false);
      setAudioURL(audioUrl);
    } catch (error) {
      console.error("Error synthesising speech: ", error);
    }
  }, []);

  const submitAnalysis = async (analysisData: any) => {
    if (!analysisData || !Array.isArray(analysisData)) {
      console.error("Invalid analysis data:", analysisData);
      return;
    }

    // console.log("Analysis data to be submitted:", analysisData);

    const body = {
      interviewId,
      ...["Introduction", "Project", "Coding", "Technical", "Outro"].reduce(
        (acc: any, section, index) => {
          const data = analysisData[index]?.analysis || {};
          acc[section] = {
            conversationChat: analysisData[index]?.conversation || [],
            analysis: data
          };
          return acc;
        },
        {}
      ),
    };

    // console.log("Final Body:", body);

    try {
      const response = await axios.post("/api/interviewer/post_review", body);
      // console.log("Analysis submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting analysis:", error);
    }
  };

  useEffect(() => {
    if (!ws) return;
    let res;
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "interview_question":
          // console.log("Interview question received from AI:", data.question);
          if (interviewStage !== "inProgress") {
            setInterviewStage("inProgress");
          }
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { user: "Interviewer", message: data.question },
          ]);
          handleInterviewer(data.question);
          res = await handleMessageUpload({
            interviewId,
            sender: "interviewer",
            type: "interview_question",
            response: data.question,
          });

          setLastInterviewerQuestion(data.question);

          if (res.status === "failed") toast.error("Message send failed");
          // if (setLoading) setLoading(false);

          break;

        case "coding_question":
          setCodingQuestion(data.message);
          setShowCompiler(true);
          handlePause();

          res = await handleMessageUpload({
            interviewId,
            sender: "system",
            type: "coding_question",
            response: data.message,
          });

          if (res.status === "failed") toast.error("Message send failed");

          break;

        case "code_evaluation":
          break;

        case "interview_end":
          res = await handleMessageUpload({
            interviewId,
            sender: "system",
            type: "interview_end",
            response: data.message,
          });

          if (res.status === "failed") toast.error("Message send failed");

          // Ensure complete cleanup of all media resources when interview ends
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => {
              track.stop();
            });
            videoRef.current.srcObject = null;
          }

          setInterviewStage("ending");
          setShowFeedback(true);

          if (interviewType) {
            // console.log("type to update:: ", interviewType)
            await handleInterviewState(interviewId, "Completed", interviewType);
          }

          break;

        case "analysis":

          if (data.result && Array.isArray(data.result)) {
            await submitAnalysis(data.result);
          }
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { user: "Analysis", message: JSON.stringify(data.result) },
          ]);
          if (interviewType) {
            // console.log("type to update:: ", interviewType)
            await handleInterviewState(interviewId, "Analysis_Completed", interviewType);
          }
          disconnectInterviewer()
          setTimeout(() => {
            // router.push(`/interview/${interviewId}/analysis`);
            window.location.href = `/interview/${interviewId}/analysis`
          }, 100);
        case "greeting_from_ws":
          console.log("Greeting from ws");
          break;
        default:
          break;
      }
    };
  }, [ws, handleInterviewer, interviewId]);

  const handleInterviewEnd = () => {
    // Immediate cleanup even before receiving the interview_end response
    // cleanupResources();
    audioRef.current?.pause()
    ws?.send(
      JSON.stringify({
        type: "end_interview",
      }),
    );
  };

  const handleStart = () => {
    try {
      // console.log("▶️ Starting Recording");
      setIsRecording(true);
      setFinalTranscript('');  // Reset transcript when starting new recording
    } catch (error) {
      // console.error("❌ Error starting recording:", error);
      setIsRecording(false);
    }
  };

  const handlePause = () => {
    setIsRecording(false);
  };

  const handleMicrophoneStop = () => {
    if (isStoppingMicrophone) return;
    setIsStoppingMicrophone(true);
  }

  const handleTranscriptionChange = (newTranscript: string) => {
    setFinalTranscript(prev => {
      const updatedTranscript = prev ? `${prev} ${newTranscript}` : newTranscript;
      // console.log("📜 Updated Final Transcript:", updatedTranscript);
      return updatedTranscript;
    });
    setLastInterviewerQuestion("")
  };

  useEffect(() => {
    if (finalTranscript.length > 0) {
      // console.log("finaltrans: ", finalTranscript)
      resTranscript.current = finalTranscript
    }
  }, [finalTranscript])

  const handleTranscriptionComplete = useCallback((transcript: string) => {
    if (transcript.trim()) {
      handleSendMessage(transcript);
      setFinalTranscript(''); // Reset the transcript after sending
    }
  }, [handleSendMessage]);

  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  const toggleMic = () => {
    if (isRecording) {
      handlePause();
    } else {
      handleStart();
    }
  };

  const startVideoStream = useCallback(async () => {
    // Don't start video if interview has ended
    if (interviewStage === "ending" || interviewStage === "completed") {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // console.log("Video stream started");

      if (videoRef.current) {
        // console.log("videorefkidkdj")
        videoRef.current.srcObject = stream;

        // Initialize media recorder
        mediaRecorder.current = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
        });

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
          }
        };

        mediaRecorder.current.onstop = () => {
          const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
          setVideoBlob(blob);

          // Upload the video blob to Azure
          // console.log("hereeeee ")
          if (videoBlobClient.current) {
            uploadVideoToStorage(blob);
            recordedChunks.current = []; // Clear the chunks after upload
          }
        };
        mediaRecorder.current.start();
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, [interviewStage]);

  const uploadVideoToStorage = async (blob: Blob) => {
    try {
      if (!videoBlobClient.current) {
        console.error("Video blob client not initialized");
        return;
      }

      // console.log("Starting upload to:", videoBlobClient.current.url);

      // Use uploadBrowserData for browser environments with chunking
      const uploadOptions = {
        blockSize: 4 * 1024 * 1024, // 4MB chunks
        concurrency: 3,
        // onProgress: (ev: any) => console.log(`Upload progress: ${ev.loadedBytes}/${blob.size} bytes`),
      };

      await videoBlobClient.current.uploadBrowserData(blob, uploadOptions);
      // console.log("Video uploaded successfully");

      // Store the video URL in the database
      if (interviewType) {
        await updateInterviewVideo(
          interviewId, videoBlobClient.current.url, interviewType
        );
      }

      // Store in session storage for the analysis page
      sessionStorage.setItem('interviewVideoUrl', videoBlobClient.current.url);

    } catch (error: any) {
      // console.error("Error uploading video:", error);
      // console.error("Error details:", JSON.stringify(error, null, 2));
      toast.error(`Upload failed: ${error.message || "Unknown error"}`);
    }
  };

  useEffect(() => {
    // Only start video stream if not in ending or completed stage
    if (interviewStage !== "ending" && interviewStage !== "completed") {
      startVideoStream();
    }
  }, [startVideoStream, interviewStage]);

  const handleButtonClick = (index: number) => {
    setClickedIndex(index);
  };

  const handleChatSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const answer = (
        document.getElementById("answerInput") as HTMLInputElement
      ).value;
      if (answer) {
        handleSendMessage(answer);
        (document.getElementById("answerInput") as HTMLInputElement).value = "";
      }
    },
    [handleSendMessage],
  );

  const enableFullscreen = () => {
    document.documentElement.requestFullscreen()
      .then(() => {
        setFullscreenDialogOpen(false);
        setIsFullscreen(true);
      })
      .catch(err => {
        // console.error("Error enabling fullscreen:", err);
        toast.error("Failed to enable fullscreen mode");
      });
  };



  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    if (rating === 0) {
      toast.error("Rate the Interview");
      return;
    }

    try {
      const res = await submitFeedback({ interviewId, rating, feedback });
      if (res.status === "success") {
        toast.success("Feedback submitted successfully");
        setShowFeedback(false);
        setFeedbackSubmitted(true);
        // console.log("rubrics for analysis: ", rubrics)
        ws?.send(
          JSON.stringify({
            type: "get_analysis",
            rubrics: rubrics,
          }),
        );
      } else {
        toast.error("Error submitting feedback");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (audioURL && audioRef.current) {
      audioRef.current.src = audioURL;
      if (loading) setLoading(false);
      audioRef.current.play()
        .catch(error => {
          // console.error("Error playing audio:", error);
          // Try to play on user interaction instead
          const playOnInteraction = () => {
            audioRef.current?.play();
            document.removeEventListener('click', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
        });
    }
  }, [audioURL]);

  // Add cleanup effect for audio elements
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  if (loadingAnalysis) {
    return <FullScreenLoader message="Analysing Interview..." />
  }
  const getLoadingMessage = () => {
    switch (interviewStage) {
      case "initializing": return "Setting up your interview...";
      case "setup": return "Preparing your interview environment...";
      default: return "Loading...";
    }
  };

  return (
    <div className="min-h-screen w-full h-screen bg-gray-200 p-0 m-0 overflow-hidden">
      {(interviewStage !== "inProgress" && interviewStage !== "ending" && interviewStage !== "completed" && loading) && (
        <FullScreenLoader message={getLoadingMessage()} />
      )}

      <Dialog open={fullscreenDialogOpen} onOpenChange={setFullscreenDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enable Fullscreen Mode</DialogTitle>
            <DialogDescription>
              Fullscreen mode provides an immersive interview experience. Would
              you like to enable it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="hover:text-primary" onClick={enableFullscreen}>
              Enable Fullscreen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main interview container with centered video */}
      <div className="w-full h-full flex flex-col items-center justify-between min-h-screen bg-gray-200 relative p-0 m-0">
        {/* Container for video and chat */}
        <div className="w-full h-[calc(100vh-80px)] relative">
          {/* Video container div - now with conditional margins */}
          <div
            className={`absolute transition-all duration-300 ease-in-out h-full flex items-center justify-center`}
            style={{
              left: 0,
              right: isChatOpen ? '31vw' : 0
            }}
          >
            <div className="w-[85%] h-[96%] overflow-hidden aspect-video rounded-xl shadow-lg">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isVideoOff ? "hidden" : ""} transform scale-x-[-1] rounded-xl`}
                autoPlay
                muted
              />
              {isVideoOff && (
                <div className="inset-0 w-full h-full bg-gray-800 flex items-center justify-center rounded-xl">
                  <User className="text-white w-24 h-24" />
                </div>
              )}
            </div>
          </div>

          {/* Chat sidebar */}
          <div
            className={`absolute top-2 right-2 bg-white rounded-2xl border-l border-slate-300 shadow-lg h-[calc(100vh-100px)] w-[30vw] transition-all duration-300 ease-in-out transform ${isChatOpen ? 'translate-x-0' : 'translate-x-[110%]'
              } flex flex-col z-0`}
          >
            <div className="flex justify-between items-center bg-primary text-white p-2 rounded-t-2xl">
              <span className="font-semibold text-lg">Prompt Box</span>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white text-2xl hover:bg-primary-dark rounded-full w-8 h-8 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4">
              {chatMessages.map((chat, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded-lg mb-2">
                  <span className="font-semibold">{chat.user}: </span>
                  <span>{chat.message}</span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleChatSubmit}
              className="p-2 bg-gray-100 border-t border-slate-300 rounded-b-2xl"
            >
              <div className="flex items-center">
                <input
                  id="answerInput"
                  type="text"
                  placeholder="Type your message"
                  className="flex-grow px-4 py-2 border border-slate-300 rounded-l-full focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  id="sendAnswerButton"
                  className="bg-primary text-white font-bold py-2 px-4 rounded-r-full hover:bg-primary focus:ring-2 focus:ring-primary-foreground transition"
                >
                  <span className="sr-only">Send</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Speech recognition component */}
        <div className="justify-center hidden w-full absolute bottom-24">
          <SpeechRecognition
            isRecording={isRecording}
            onStart={handleStart}
            onPause={handlePause}
            onStop={handleMicrophoneStop}
            isMicrophoneStopped={isStoppingMicrophone}
            onTranscriptionChange={handleTranscriptionChange}
            finalTranscript={finalTranscript}
            onTranscriptionComplete={handleTranscriptionComplete}
          />
        </div>

        {/* Chat messages - HR and User - with dynamic width */}
        <div
          className="absolute left-3 bottom-16 flex flex-col z-10 transition-all duration-300"
          style={{
            width: isChatOpen ? 'calc(69% - 6px)' : '85%',
            maxWidth: isChatOpen ? 'calc(69% - 6px)' : '85%'
          }}
        >
          {lastInterviewerQuestion && lastInterviewerQuestion.length > 0 ? (
            <div className="bg-gray-100/80 max-h-24 overflow-y-scroll custom-scrollbar p-4 flex gap-3 rounded-xl shadow mb-4">
              <h3 className="font-semibold whitespace-nowrap">HR:</h3>
              <p className="text-gray-800">{lastInterviewerQuestion}</p>
            </div>
          ) : (
            finalTranscript && (
              <div className="bg-white/80 overflow-y-scroll  custom-scrollbar mb-4 max-h-24 p-4 flex gap-3 rounded-xl shadow">
                <h3 className="font-semibold">You:</h3>
                <p className="text-gray-700">{finalTranscript || "No transcript yet"}</p>
              </div>
            )
          )}
        </div>

        {/* Fixed bottom control bar */}
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-primary-foreground p-3 w-full h-20 z-10">
          <div className="bg-blue-600 w-[6rem] h-[4rem] rounded-lg shadow-lg flex items-center justify-center ml-10">
            <div className="relative">
              <User className="text-white w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMic}
              className="border-2 border-gray-200 rounded-lg"
            >
              {isRecording ? (
                <MicOff className="h-4 w-4 animate-pulse" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleVideo}
              className="border-2 border-gray-200 rounded-lg"
            >
              {isVideoOff ? (
                <VideoOff className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center mr-10">
            <button
              className="mx-4 bg-primary p-2 rounded-full w-10 h-10 relative hover:bg-primary-dark transition"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageSquare className="absolute top-1/2 right-1/2 w-5 -translate-y-1/2 translate-x-1/2 text-white" />
            </button>
            <button
              className="bg-destructive text-white font-medium px-6 py-2.5 rounded-lg hover:bg-destructive/90 transition shadow-md"
              onClick={handleInterviewEnd}
            >
              END INTERVIEW
            </button>
          </div>
        </div>

        {audioURL && (
          <audio controls src={audioURL} ref={audioRef} className="hidden">
            Your browser does not support the audio element.
          </audio>
        )}

        {/* Feedback modal */}
        {showFeedback && !feedbackSubmitted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-[40vw] min-w-[400px] min-h-[400px]">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 inline">
                  A quick feedback and we&apos;ll guide you to your interview
                </h2>
                <h2 className="text-2xl font-bold mb-4 inline text-primary">
                  {" "}
                  Analysis!
                </h2>
              </div>
              <div className="flex flex-col justify-evenly">
                <div className="flex justify-evenly p-10 text-6xl">
                  <button
                    className={`hover:scale-110 hover:translate-y-[-10px] hover:text-primary transition ${clickedIndex === 1 ? "text-primary scale-125" : ""}`}
                    onClick={() => handleButtonClick(1)}
                  >
                    <RiEmotionLine />
                  </button>
                  <button
                    className={`hover:scale-110 hover:translate-y-[-10px] transition hover:text-primary ${clickedIndex === 2 ? "text-primary scale-125" : ""}`}
                    onClick={() => handleButtonClick(2)}
                  >
                    <RiEmotionNormalLine />
                  </button>
                  <button
                    className={`hover:scale-110 hover:translate-y-[-10px] transition hover:text-primary ${clickedIndex === 3 ? "text-primary scale-125" : ""}`}
                    onClick={() => handleButtonClick(3)}
                  >
                    <RiEmotionUnhappyLine />
                  </button>
                </div>

                <p className="mb-4">
                  Please provide your feedback about the interview experience.
                </p>
                <textarea
                  className="w-full h-32 p-2 border border-slate-500 rounded-lg resize-none mb-4"
                  placeholder="Your feedback here ..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <button
                  className={`text-white px-4 py-3 rounded-lg font-semibold transition ${clickedIndex !== 0 ? "bg-primary hover:bg-primary" : "bg-slate-500"}`}
                  disabled={clickedIndex === 0}
                  onClick={() => handleFeedbackSubmit(clickedIndex, feedback)}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        <OnlineCompiler
          interviewId={interviewId}
          codingQuestion={codingQuestion}
          showCompiler={showCompiler}
          setShowCompiler={setShowCompiler}
        />
      </div>
    </div>
  );
}
export default InterviewPage;