"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import * as pdfJSLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import { IoDocumentAttach, IoCloudUploadOutline } from "react-icons/io5";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocketContext } from "@/hooks/interviewersocket/webSocketContext";
import InterviewPage from "./InterviewPage";
import { Input } from "@/components/ui/input";
import { generateSasToken } from "@/actions/azureActions";
import { useParams } from "next/navigation";
import {
  handleCVUpload,
  handleJDTextUpload,
  updateInterviewStarted,
} from "@/actions/interviewActions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FullScreenLoader from "@/components/global/FullScreenLoader";

pdfJSLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJSLib.version}/pdf.worker.min.js`;

function generateFileName(
  interviewId: string,
  originalFileName: string,
  filetype: string,
) {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  const fileExtension = originalFileName.split(".").pop();
  return `${interviewId}_${timestamp}_${filetype}.${fileExtension}`;
}

const InterviewComponent = () => {
  const form = useForm<{ jobProfile: string }>({
    defaultValues: {
      jobProfile: "",
    },
  });

  const params = useParams();
  const interviewId = params.interviewId as string;

  const { ws } = useWebSocketContext();
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJDFile] = useState<File | null>(null);

  const [selectedJobProfile, setSelectedJobProfile] = useState("");
  const [cvText, setCvText] = useState("");
  const [JD, setJD] = useState("");

  const [loading, setLoading] = useState(false);

  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const jobProfiles = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "Business Analyst",
    "DevOps Engineer",
    "System Administrator",
    "Other",
  ];

  const uploadCVText = useCallback(
    async (cvText: string) => {
      try {
        const res = await handleCVUpload({ cvText, interviewId });

        if (res.status === "success") {
          toast.success("Resume analysed successfully");
          setCvText(cvText);
          setStep(2);
          return;
        } else {
          toast.error("Failed to analyse resume");
          return;
        }
      } catch (error) {
        toast.error("Failed to upload Resume");
        console.error("Error during PDF extraction or upload:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [interviewId],
  );

  const handleSubmit = form.handleSubmit((data) => {
    handleJDSubmit(data.jobProfile);
  });

  const startInterview = useCallback(
    async (JD: string) => {
      if (!cvText || !JD) {
        toast.error("Upload CV and Job Description");
        return;
      }

      setLoading(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        stream.getTracks().forEach((track) => track.stop());

        ws?.send(
          JSON.stringify({
            type: "start_interview",
            pdf_text: cvText,
            job_description: JD,
          }),
        );
      } catch (err) {
        toast.error("Failed to access microphone and camera.");
        setLoading(false);
      }
    },
    [ws, cvText],
  );

  const uploadJDText = useCallback(
    async (jdText: string) => {
      try {
        const res = await handleJDTextUpload({ jdText, interviewId });

        if (res.status === "success") {
          toast.success("Job Description analysed successfully");
          setJD(jdText);
          startInterview(jdText);
          return;
        } else {
          toast.error("Failed to analyse Job description");
          return;
        }
      } catch (error) {
        toast.error("Failed to uplaod JD");
        console.error("Error during upload:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [interviewId, startInterview],
  );

  useEffect(() => {
    if (ws) {
      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "cv_uploaded":
            uploadCVText(data.cv_text);
            break;

          case "interview_started":
            const res = await updateInterviewStarted(interviewId);

            if (res.status === "success") setIsInterviewStarted(true);
            else {
              toast.error("Internal Server Error");
            }

            break;

          case "jd_analyzed":
            uploadJDText(data.job_description);
            break;

          default:
            break;
        }
      };
    }
  }, [ws, uploadCVText, uploadJDText, startInterview, interviewId]);

  const handleResumeAnalysis = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setResumeFile(file);

      const reader = new FileReader();

      reader.onload = async (e) => {
        const binaryData = e.target?.result as ArrayBuffer;

        if (binaryData && ws) {
          try {
            ws?.send(
              JSON.stringify({
                type: "upload_cv",
                cv_data: Array.from(new Uint8Array(binaryData)),
              }),
            );
          } catch (error) {
            setIsUploading(false);
            setResumeFile(null);
            console.log("Socket is not initialised");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        } else {
          setIsUploading(false);
        }
      };

      reader.readAsArrayBuffer(file);

      const blobName = generateFileName(interviewId, file.name, "cv");
      const sasUrl = await generateSasToken(blobName);

      if (!sasUrl) {
        toast.error("Error uploading resume");
        return;
      }

      try {
        const uploadResponse = await fetch(sasUrl, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          toast.error("Resume Upload Failed");
        }
      } catch (error) {
        console.error(error);
      }
    },
    [ws, interviewId],
  );

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    console.log("Resume upload started");
    const file = event.target.files?.[0];

    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("File size should be 1 MB or less");
      return;
    }

    handleResumeAnalysis(file);
  };

  const handleResumeDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("File size should be 1 MB or less");
      return;
    }

    handleResumeAnalysis(file);
  };

  const extractTextFromPDF = useCallback((file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async function (event) {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);

        if (typeof window !== "undefined") {
          const pdf = await pdfJSLib.getDocument(typedArray).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            text += ` ${pageText}`;
          }
          resolve(text.trim());
        } else {
          reject(
            new Error("pdfjs-dist is not available in the server environment"),
          );
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleJDAnalysis = async (file: File) => {
    setJDFile(file);

    const extractedText = await extractTextFromPDF(file);

    if (extractedText && ws) {
      ws.send(
        JSON.stringify({ type: "analyze_jd", job_description: extractedText }),
      );
    } else {
      console.error("websocket is not initialised or no extracted text");
    }

    const blobName = generateFileName(interviewId, file.name, "jd");
    const sasUrl = await generateSasToken(blobName);

    if (!sasUrl) {
      toast.error("Error uploading Job description");
      return;
    }

    try {
      const uploadResponse = await fetch(sasUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        toast.error("Job description Upload Failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleJDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];

    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("File size should be 1 MB or less");
      return;
    }

    await handleJDAnalysis(file);
  };

  const handleJDDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("File size should be 1 MB or less");
      return;
    }

    await handleJDAnalysis(file);
  };

  const handleProfileChange = (profile: string) => {
    setSelectedJobProfile(profile);

    if (profile === "Other") {
      setJD("");
      return;
    }

    ws?.send(
      JSON.stringify({
        type: "analyze_jd",
        job_description: profile,
      }),
    );
  };

  const handleJDSubmit = (jobProfile: string) => {
    if (!jobProfile) {
      return;
    }

    ws?.send(
      JSON.stringify({
        type: "analyze_jd",
        job_description: jobProfile,
      }),
    );
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (isInterviewStarted) {
    return <InterviewPage />;
  }

  return (
    <>
      <div className="min-h-screen bg-primary-foreground flex items-center md:justify-center justify-top w-full relative">
        <div className="absolute top-2 left-0 max-w-[220px]">
          <Link href="/">
            <Image
              src={"/home/logo.svg"}
              width={180}
              height={100}
              alt="logo"
              className="w-full h-auto drop-shadow-md"
            />
          </Link>
        </div>
        <div className="max-w-[1200px] gap-4 w-full flex flex-col items-center md:flex-row justify-between">
          <div className="max-w-[400px] flex flex-col items-center justify-end bg-primary shadow-lg text-white rounded-2xl p-8 gap-8 relative">
            <Image
              src={"/images/Globe.svg"}
              className="w-10/12 h-auto"
              alt="image"
              width={100}
              height={100}
            />
            <div className="relative flex flex-col items-center mt-auto">
              <h2 className="text-xl font-semibold w-full leading-snug">
                Take the wiZe AI mock Interview
              </h2>
              <p className="mt-2 text-sm w-full ">
                You&apos;ll be taking a 20-minute interview to have your skills
                evaluated. Just relax and take the interview.{" "}
                <span className="font-semibold"> All the best!</span>
              </p>
            </div>
          </div>

          <div className="w-full md:max-w-[500px] max-h-[90vh] scrollbar-hide overflow-hidden lg:max-w-[700px] overflow-x-hidden flex flex-col items-center justify-center bg-primary-foreground p-10 md:mr-8 lg:mr-0">
            <div className="text-2xl font-semibold mb-2 text-primary">
              Get Started!
            </div>
            {step === 1 ? (
              <>
                <div className="flex mx-auto items-center max-w-[450px] justify-center w-full">
                  <div className="relative flex-1">
                    <div
                      className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div
                      className={`absolute top-1/2 left-8 h-0.5 transition-all duration-500 ease-in-out bg-slate-500 w-full z-0`}
                    ></div>
                  </div>

                  <div className="relative flex-1">
                    <div
                      className={`w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center`}
                    >
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div
                      className={`absolute top-1/2 left-8 h-0.5 transition-all duration-500 ease-in-out bg-slate-500 w-full z-0`}
                    ></div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center my-4 w-full text-xl font-semibold">
                  Upload your latest CV/Resume
                </div>

                <div className="bg-white py-4 px-8 rounded-2xl w-full md:max-w-[350px] lg:max-w-[400px] shadow-lg text-center">
                  <div className="text-primary flex justify-center mb-2 text-center w-full text-3xl">
                    <IoDocumentAttach />
                  </div>

                  {cvText ? (
                    <div className="text-center text-gray-600 font-semibold relative h-[135px] flex items-center justify-center">
                      Resume Uploaded: {resumeFile?.name}
                      <button
                        className="absolute top-0 right-4 text-gray-600 hover:text-destructive focus:outline-none"
                        onClick={() => setCvText("")}
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-dashed border-2 border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white h-[150px] lg:h-[135px]"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleResumeDrop(e)}
                    >
                      <p className="text-gray-500 mt-2 text-sm lg:text-xs">
                        Drag & Drop or
                      </p>
                      <label
                        htmlFor="resumeUpload"
                        className="text-gray-500 cursor-pointer text-sm lg:text-xs"
                      >
                        Click to{" "}
                        <span className="font-semibold text-primary">
                          Upload Resume
                        </span>
                      </label>
                      <input
                        id="resumeUpload"
                        type="file"
                        name="resumeUpload"
                        accept=".pdf, application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleResumeUpload}
                      />

                      <div className="text-4xl mt-3 text-gray-300">
                        <IoCloudUploadOutline />
                      </div>

                      <p className="text-slate-500 text-sm mt-3 lg:text-xs">
                        Supported file format: PDF. File size limit: 1 MB
                      </p>
                    </div>
                  )}

                  <button
                    className={`flex justify-center items-center mt-2 mx-auto bg-primary text-lg md:w-full relative text-white font-bold py-3 px-3 rounded-xl lg:max-h-[40px]   ${
                      !!cvText
                        ? "cursor-not-allowed bg-slate-500"
                        : "hover:bg-primary focus:ring-4 focus:ring-primary-foreground transition"
                    }`}
                    onClick={handleUploadClick}
                    disabled={cvText !== ""}
                  >
                    {isUploading
                      ? "Uploading..."
                      : cvText !== ""
                        ? "Resume Uploaded"
                        : "Upload Resume"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {loading && <FullScreenLoader message="Starting Interview" />}{" "}
                <div className="flex mx-auto items-center max-w-[450px] justify-center mb-2 w-full">
                  <div className="relative flex-1">
                    <div
                      className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div
                      className={`absolute top-1/2 left-8 h-0.5 transition-all duration-500 ease-in-out bg-primary w-full z-0`}
                    ></div>
                  </div>

                  <div className="relative flex-1">
                    <div
                      className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div
                      className={`absolute top-1/2 left-8 h-0.5 transition-all duration-500 ease-in-out bg-slate-500 w-full z-0`}
                    ></div>
                  </div>

                  <div className="relative flex items-center">
                    <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm xl:text-2xl mb-6 font-bold text-gray-800">
                  Choose your Interview Profile
                </h3>
                <div className="bg-white py-4 px-8 rounded-2xl w-full md:max-w-[450px] lg:max-w-[450px] shadow-lg text-center flex flex-col items-center">
                  <Tabs defaultValue="profile" className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-2 p-2 h-auto">
                      <TabsTrigger className="p-2" value="profile">
                        Choose Profile
                      </TabsTrigger>
                      <TabsTrigger className="p-2" value="jd">
                        Upload JD
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                      <Select
                        value={selectedJobProfile}
                        onValueChange={handleProfileChange}
                      >
                        <SelectTrigger
                          id="jobProfileDropdown"
                          className="w-full p-4 mb-2"
                        >
                          <SelectValue placeholder="Select a profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobProfiles.map((profile) => (
                            <SelectItem key={profile} value={profile}>
                              {profile}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedJobProfile === "Other" && (
                        <Form {...form}>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="jobProfile"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter profile name"
                                      className="text-center"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full">
                              Submit
                            </Button>
                          </form>
                        </Form>
                      )}
                    </TabsContent>
                    <TabsContent value="jd">
                      <div className="border-dashed border-2 border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white h-[160px] mt-4">
                        {JD !== "" ? (
                          <div className="text-center text-gray-600 font-semibold relative h-[150px] flex items-center justify-center">
                            Job Description Uploaded: {jdFile?.name}
                            <button
                              className="absolute top-[44%] right-6 text-gray-600 hover:text-red-600 focus:outline-none"
                              onClick={() => setJD("")}
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onDragOver={handleDragOver}
                            onDrop={handleJDDrop}
                          >
                            <p className="text-gray-500 mt-2 text-sm">
                              Drag & Drop or
                            </p>
                            <label
                              htmlFor="jdUpload"
                              className="text-gray-500 cursor-pointer text-sm"
                            >
                              Click to{" "}
                              <span className="font-semibold text-primary">
                                Upload Job Description
                              </span>
                            </label>
                            <input
                              id="jdUpload"
                              type="file"
                              accept=".doc,.docx,.pdf"
                              className="hidden"
                              onChange={handleJDUpload}
                            />

                            <div className="text-4xl mt-3 flex justify-center text-gray-300">
                              <IoCloudUploadOutline />
                            </div>

                            <p className="text-slate-500 text-sm mt-3">
                              Supported file format: PDF. File size limit: 1 MB
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewComponent;
