"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Analysis from "./Analysis";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import OnlineCompiler from "./OnlineCompiler";
import {
  handleMessageUpload,
  submitFeedback,
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
import { handleAudioTranscribe } from "@/actions/transcribeAudioAction";
import { generateSasUrlForInterview } from "@/actions/azureActions";
import { useParams } from "next/navigation";
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
import {readBlobAsBase64} from '@/utils/readBlobAsBase64'

type ChatMessage = {
  user: string;
  message: string;
};

const InterviewPage = () => {
  const params = useParams();
  const interviewId = params.interviewId as string;

  const [feedback, setFeedback] = useState("");

  const resTranscript = useRef("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);

  const { ws } = useWebSocketContext();
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

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioStream = useRef<MediaStream | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const emptyTranscribeCnt = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const videoBlobClient = useRef<BlockBlobClient | null>(null);
  const audioBlobClient = useRef<BlockBlobClient | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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

      setAudioURL(audioUrl);
    } catch (error) {
      console.error("Error synthesising speech: ", error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoElement.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!ws) return;
    let res;
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "interview_question":
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

          if (res.status === "failed") toast.error("Message send failed");
          if (setLoading) setLoading(false);

          break;

        case "coding_question":
          setCodingQuestion(data.message);
          setShowCompiler(true);

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

          setShowFeedback(true);
          stopCamera();

          ws?.send(
            JSON.stringify({
              type: "get_analysis",
            }),
          );

          break;

        case "analysis":
          setAnalysisData(data.result);
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { user: "Analysis", message: JSON.stringify(data.result) },
          ]);
          break;
        case "greeting_from_ws":
          console.log("Greeting from ws");
          break;
        case "transcription_result":
          console.log("transcripted text--> ",data.result)  
        default:
          break;
      }
    };
  }, [ws, handleInterviewer, stopCamera, interviewId]);

  const handleInterviewEnd = () => {
    ws?.send(
      JSON.stringify({
        type: "end_interview",
      }),
    );
  };

  const stopAudioRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      mediaRecorder.current?.stop();
      mediaRecorder.current = null;
    }
    emptyTranscribeCnt.current = 0;
    handleSendMessage(resTranscript.current);
    resTranscript.current = "";
  }, [handleSendMessage]);

  const startTranscribing = useCallback(async () => {
    console.log("debug 111")
    if (emptyTranscribeCnt.current >= 6) {
      stopAudioRecording();
      toast.error("Enable mic to continue Interview");
      setIsMuted(true);
    }

    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }

    try {
      if (!audioStream.current) {
        audioStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      mediaRecorder.current = new MediaRecorder(audioStream.current, {
        mimeType: "audio/webm; codecs=opus",
        audioBitsPerSecond: 16000,
      });

      mediaRecorder.current.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const recordedBlob = new Blob(audioChunks.current, {
          type: "audio/webm",
        });

        audioChunks.current = [];

        if (recordedBlob.size === 0) {
          return;
        }
        
        const base64Audio=await readBlobAsBase64(recordedBlob)


        // console.log("Audio recorded:", base64Audio);

        const formData = new FormData();
        formData.append("audio", recordedBlob);
        
        try {

          ws?.send(JSON.stringify({
            type: "speech_to_text",
            audioData: base64Audio,
            contentType: recordedBlob.type // Include the mime type
          }));


          // const res = await handleAudioTranscribe(formData); //trnascribing candidate audio
          const res = await handleAudioTranscribe(formData); //trnascribing candidate audio
          
          if (res.status === "success") {
            if (res.transcript) resTranscript.current += res.transcript;
            else if (resTranscript.current) stopAudioRecording();
            else emptyTranscribeCnt.current += 1;
          } else {
            console.log("Error transcribing audio");
          }
        } catch (error) {
          console.error("Error transcribing audio:", error);
        }
      };

      mediaRecorder.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [stopAudioRecording]);

  const startAudioRecording = useCallback(() => {
    startTranscribing();

    if (isMuted) setIsMuted(false);

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        startTranscribing();
      }, 4400);
    }
  }, [startTranscribing, isMuted]);

  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  const uploadChunk = async (
    client: BlockBlobClient | null,
    chunk: Blob,
    blockIndex: number,
  ) => {
    try {
      if (client) {
        const blockId = btoa(String(blockIndex).padStart(6, "0")); // Padded, consistent ID
        await client.stageBlock(blockId, chunk, chunk.size);
        console.log(`Uploaded block: ${blockId}`);
      }
    } catch (error) {
      console.error("Error uploading chunk:", error);
    }
  };


  //TODO

  //get audio transcript here

  



  // const finalizeUpload = async () => {
  //   try {
  //     stopVideoStream();

  //     const videoBlockList = videoChunksRef.current.map((_, index) =>
  //       btoa(String(index).padStart(6, "0")),
  //     );
  //     const audioBlockList = audioChunksRef.current.map((_, index) =>
  //       btoa(String(index).padStart(6, "0")),
  //     );

  //     if (videoBlobClient.current) {
  //       await videoBlobClient.current.commitBlockList(videoBlockList);
  //       console.log("Video upload complete and finalized.");
  //     }
  //     if (audioBlobClient.current) {
  //       await audioBlobClient.current.commitBlockList(audioBlockList);
  //       console.log("Audio upload complete and finalized.");
  //     }
  //   } catch (error) {
  //     console.error("Error finalizing upload:", error);
  //   }
  // };

  // const stopVideoStream = () => {
  //   if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
  //   if (audioRecorderRef.current) audioRecorderRef.current.stop();
  // };

  const startVideoStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      // const mediaRecorder = new MediaRecorder(stream, {
      //   mimeType: "video/webm",
      // });
      // const audioStream = new MediaStream(stream.getAudioTracks());
      // const audioRecorder = new MediaRecorder(audioStream, {
      //   mimeType: "audio/webm",
      // });
      // let videoBlockIndex = 0;
      // let audioBlockIndex = 0;
      // mediaRecorder.ondataavailable = async (event: BlobEvent) => {
      //   if (event.data.size > 0) {
      //     videoChunksRef.current.push(event.data);
      //     await uploadChunk(
      //       videoBlobClient.current,
      //       event.data,
      //       videoBlockIndex++
      //     );
      //   }
      // };
      // audioRecorder.ondataavailable = async (event: BlobEvent) => {
      //   if (event.data.size > 0) {
      //     audioChunksRef.current.push(event.data);
      //     await uploadChunk(
      //       audioBlobClient.current,
      //       event.data,
      //       audioBlockIndex++
      //     );
      //   }
      // };
      // mediaRecorder.start(3000);
      // audioRecorder.start(3000);
      // mediaRecorderRef.current = mediaRecorder;
      // audioRecorderRef.current = audioRecorder;
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, []);

  useEffect(() => {
    startVideoStream();
  }, [startVideoStream]);

  useEffect(() => {
    const startVideoAudioRecording = async (interviewId: string) => {
      const sasUrl = await generateSasUrlForInterview();

      if (!sasUrl?.sasUrl) {
        return;
      }

      const blobServiceClient = new BlobServiceClient(sasUrl.sasUrl);
      const containerClient =
        blobServiceClient.getContainerClient("mylampai-av");

      const timestamp = Date.now();

      videoBlobClient.current = containerClient.getBlockBlobClient(
        `${interviewId}_${timestamp}_v.webm`,
      );
      audioBlobClient.current = containerClient.getBlockBlobClient(
        `${interviewId}_${timestamp}_a.webm`,
      );
    };

    startVideoAudioRecording(interviewId);
  }, [interviewId]);

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

  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);

      if (!!document.fullscreenElement === false) {
        setDialogOpen(true);
      }
    };

    document.addEventListener("fullscreenchange", fullscreenChangeHandler);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChangeHandler);
    };
  }, []);

  const enableFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      setDialogOpen(false);
    }
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
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
  }, [audioURL]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      audioElement.addEventListener("ended", startAudioRecording);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("ended", startAudioRecording);
      }
    };
  }, [audioURL, startAudioRecording]);

  return (
    <div className="min-h-screen flex items-center flex-col relative w-full h-full">
      {loading && <FullScreenLoader />}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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

      <nav className="sticky top-0 w-full z-10 ">
        <div className="flex items-center justify-between shadow-md px-4 h-[72px] w-full">
          <div className="flex gap-8">
            <Link href={"/"} className="">
              <Image
                src={"/home/logo.svg"}
                width={180}
                height={180}
                alt="wiZe Logo"
                className="h-auto w-48 ml-2"
              />
            </Link>
          </div>

          <div className="font-semibold text-lg flex justify-center items-center ">
            Interview Round
          </div>
          <div className="flex items-center">
            {/* <button
              className="bg-primary font-medium text-white text-sm px-4 py-2 rounded-full"
              onClick={() => setShowCompiler(true)}
            >
              Open Compiler
            </button> */}
            <button
              className="mx-4 bg-primary p-2 rounded-full w-8 h-8 relative"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageSquare className="absolute top-1/2 right-1/2 w-5 -translate-y-1/2 translate-x-1/2 text-white" />
            </button>
            <button
              className="bg-destructive text-white text-sm px-4 py-2 rounded-full"
              onClick={handleInterviewEnd}
            >
              END INTERVIEW
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-col w-full items-center justify-center min-h-[calc(100vh-72px)] relative bg-gray-100">
        <div className="relative w-screen h-[calc(100vh-72px)] overflow-hidden aspect-video rounded-xl shadow-lg">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${
              isVideoOff ? "hidden" : ""
            }`}
            autoPlay
            muted
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <User className="text-white w-24 h-24" />
            </div>
          )}
        </div>
        <div className="mt-4 flex space-x-4 absolute bottom-8 ">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            onClick={startAudioRecording}
            disabled={isMuted}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleVideo}
          >
            {isVideoOff ? (
              <VideoOff className="h-4 w-4" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {audioURL && (
        <audio controls src={audioURL} ref={audioRef} className="hidden">
          Your browser does not support the audio element.
        </audio>
      )}

      {isChatOpen && (
        <div className="absolute top-1/2 -translate-y-1/2 right-6 bg-white border border-slate-500 shadow-lg rounded-xl w-[25vw] h-3/4 flex flex-col">
          <div className="flex justify-between items-center bg-primary text-white p-4 rounded-t-lg">
            <span className="font-semibold text-lg">Prompt Box</span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div>
              {chatMessages.map((chat, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded-md mb-2">
                  <span className="font-semibold">{chat.user}: </span>
                  <span>{chat.message}</span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleChatSubmit}
            className="p-4 bg-gray-100 border-t border-b border-slate-500 rounded-lg"
          >
            <input
              id="answerInput"
              type="text"
              placeholder="Type your answer here"
              className="w-full px-4 py-4 border border-slate-500 rounded-full focus:ring-2 focus:ring-primary focus:outline-none mb-4"
            />

            <div className="flex justify-between">
              <button
                id="sendAnswerButton"
                className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary focus:ring-4 focus:ring-primary-foreground transition"
              >
                Send Answer
              </button>
            </div>
          </form>
        </div>
      )}

      {showFeedback && !feedbackSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-[40vw] min-w-[400px] min-h-[400px]">
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
                  className={`hover:scale-110 hover:translate-y-[-10px] hover:text-primary transition ${
                    clickedIndex === 1 ? "text-primary scale-125" : ""
                  }`}
                  onClick={() => handleButtonClick(1)}
                >
                  <RiEmotionLine />
                </button>
                <button
                  className={`hover:scale-110 hover:translate-y-[-10px] transition hover:text-primary ${
                    clickedIndex === 2 ? "text-primary scale-125" : ""
                  }`}
                  onClick={() => handleButtonClick(2)}
                >
                  <RiEmotionNormalLine />
                </button>
                <button
                  className={`hover:scale-110 hover:translate-y-[-10px] transition hover:text-primary ${
                    clickedIndex === 3 ? "text-primary scale-125" : ""
                  }`}
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
                className={`text-white px-4 py-3 rounded-lg font-semibold transition ${
                  clickedIndex !== 0
                    ? "bg-primary hover:bg-primary"
                    : "bg-slate-500"
                }`}
                disabled={clickedIndex === 0}
                onClick={() => handleFeedbackSubmit(clickedIndex, feedback)}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white w-full min-w-[600px]">
            <Analysis analysisData={analysisData} />
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
  );
};

export default InterviewPage;