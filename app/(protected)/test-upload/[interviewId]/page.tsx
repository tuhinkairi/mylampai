"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from "@azure/storage-blob";
import { generateSasUrlForInterview } from "@/actions/azureActions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Video, StopCircle, Upload } from "lucide-react";

const containerName = "interviews";
const SASUrl =
  "https://wizecloud.blob.core.windows.net/interviews?sp=racwd&st=2024-12-16T17:40:44Z&se=2024-12-18T01:40:44Z&sv=2022-11-02&sr=c&sig=yVjNCqBBx6XMkxJM0LJe%2FlGxaVYCoJ7RGukZppNrwwQ%3D";

const RealTimeVideoUploader: React.FC = () => {
  const params = useParams();
  const { interviewId } = params;

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  const containerClientRef = useRef<ContainerClient | null>(null);

  const videoBlockIds = useRef<string[]>([]);

  const streamRef = useRef<MediaStream | null>(null);

  const uploadChunk = async (chunk: Blob, blockId: string) => {
    try {
      const client = containerClientRef.current?.getBlockBlobClient(blockId);
      if (client) {
        await client.uploadData(chunk, {
          blobHTTPHeaders: { blobContentType: "video/webm" },
        });
      }
    } catch (error) {
      console.error("Error uploading chunk:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      let videoBlockIndex = 0;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const rawId = `${interviewId}_${Date.now()}_${videoBlockIndex}`;
          const blockId = btoa(rawId).padEnd(64, "A");

          videoBlockIds.current.push(blockId);
          videoBlockIndex++;

          videoChunksRef.current.push(event.data);
          uploadChunk(event.data, blockId);
        }
      };

      mediaRecorder.start(3000);
      mediaRecorderRef.current = mediaRecorder;

      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) videoRef.current.srcObject = null;

    setIsRecording(false);
  };

  useEffect(() => {
    const generateBlobSasUrls = async () => {
      if (SASUrl) {
        const blobServiceClient = new BlobServiceClient(SASUrl);

        const containerClient =
          blobServiceClient.getContainerClient(containerName);

        containerClientRef.current = containerClient;
      }
    };

    generateBlobSasUrls();
  }, [interviewId]);

  const finalizeUpload = async () => {
    try {
      if (videoBlockIds.current.length) {
        videoBlockIds.current.sort();

        const client = containerClientRef.current?.getBlockBlobClient(
          `${interviewId}_${Date.now()}_v.webm`
        );

        // console.log(videoBlockIds.current);

        if (client) {
          await client.commitBlockList(videoBlockIds.current);
          // console.log("Finalized upload.");
        }
      }
    } catch (error) {
      console.error("Error finalizing upload:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Real-Time Video and Audio Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
            aria-label="Video preview"
          />
        </div>
        <div className="flex justify-center">
          {!isRecording ? (
            <Button onClick={startRecording}>
              <Video className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive">
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>
        {uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Upload Progress</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={finalizeUpload}
          disabled={!videoBlockIds.current.length}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Finalize Upload
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RealTimeVideoUploader;
