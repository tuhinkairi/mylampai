"use client";
import React, { useState, useEffect, useCallback, use } from "react";
import Image from "next/image";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import { IoDocumentAttach, IoCloudUploadOutline } from "react-icons/io5";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocketContext } from "@/hooks/interviewersocket/webSocketContext";
import { Input } from "@/components/ui/input";
import { generateSasToken } from "@/actions/azureActions";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  createInterview,
  handleCVUpload,
  handleInterviewState,
  handleJDTextUpload,
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
import { useAppSelector } from "@/lib/hooks";
import { useUserStore } from "@/utils/userStore";
import { getUserResumesList } from "@/actions/resumeActions";
import { generateInterviewRubrics } from "@/actions/interviewTemplates/createTemplateActions";
import { Circles } from "react-loader-spinner";
import { MediaService } from "@/lib/MediaService";


pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT;

function generateFileName(
  interviewId: string,
  originalFileName: string,
  filetype: string
) {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  const fileExtension = originalFileName.split(".").pop();
  return `${interviewId}_${timestamp}_${filetype}.${fileExtension}`;
}

type ResumeList = {
  id: string;
  resumeName: string | null;
  resumeFileText?: string | null;
  resumeUrl: string | null;
}[];


type Rubric = {
  parameter: string;
  description: string;
  weightage: number;
}


const CreateInterviewComponent = ({ jobDescription, category, rubrics }: { jobDescription: string, category: string, rubrics: Rubric[] }) => {
  const form = useForm<{ jobProfile: string }>({
    defaultValues: {
      jobProfile: "",
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams()
  const interviewType = searchParams.get("type") || "mockInterview";
  const { userData } = useUserStore();


  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJDFile] = useState<File | null>(null);
  const [interviewId, setInterviewId] = useState<string>("");

  const [selectedJobProfile, setSelectedJobProfile] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeList, setResumeList] = useState<ResumeList>([]);
  const [JD, setJD] = useState("");

  const [loading, setLoading] = useState(false);

  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingJD, setIsUploadingJD] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const profile = useAppSelector((state) => state.talentProfile);
  const talentProfileId = profile.id as string;
  const [rubricsList, setRubricsList] = useState<Rubric[]>(rubrics || []);

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

  useEffect(() => {
    if (!userData || !userData.id) return;

    const fetchResumeList = async () => {
      const resumes = await getUserResumesList(userData.id);
      setResumeList(resumes);
    };

    fetchResumeList();
  }, [userData]);

  const handleSubmit = form.handleSubmit((data) => {
    handleJDSubmit(data.jobProfile);
  });


  useEffect(() => {
    if (jobDescription) {
      setJD(jobDescription);
    }
  }, [jobDescription]);


  const handleResumeAnalysis = useCallback(
    async (file: File) => {
      setIsUploadingResume(true);
      setResumeFile(file);

      const resumeText = await extractTextFromPDF(file);
      if (!resumeText) {
        toast.error("Error extracting text from PDF");
        return;
      }
      // console.log("Extracted Resume Text:", resumeText);
      setResumeText(resumeText);
      // if (resumeText) {
      //     const extractStructuredData = async (text: string) => {
      //         try {
      //             const response = await fetch(`${baseUrl}/extract_structured_data`, {
      //                 method: "POST",
      //                 headers: {
      //                     "Content-Type": "application/json",
      //                 },
      //                 body: JSON.stringify({ cv_text: text }),
      //             });

      //             const result = await response.json();
      //             if (response.ok) {
      //                 return result;
      //             }
      //             return null;
      //         } catch (error) {
      //             console.error("Error extracting structured data:", error);
      //             return null;
      //         }
      //     };

      //     const structuredData = await extractStructuredData(resumeText);

      //     if (structuredData) {
      //         console.log("Structured Data:", structuredData);
      //          setResumeText(structuredData.message);
      //     }
      // }

      const blobName = generateFileName("", file.name, "cv");
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
        setIsUploadingResume(false);
      } catch (error) {
        console.error(error);
      }
    },
    [interviewId]
  );

  const extractTextFromPDF = useCallback((file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async function (event) {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);

        if (typeof window !== "undefined") {
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
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
            new Error("pdfjs-dist is not available in the server environment")
          );
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleJDAnalysis = async (file: File) => {
    setJDFile(file);
    setIsUploadingJD(true);
    const extractedText = await extractTextFromPDF(file);

    if (extractedText) {
      const response = await generateInterviewRubrics(extractedText)

      if (response.status !== 200) {
        toast.error("Failed to generate rubrics.");
        return;
      }
      const data = response.result;
      setRubricsList(data.evaluation_criteria);
      setJD(extractedText);
      toast.success("Job Description analysed successfully");
      setIsUploadingJD(false);
    } else {
      console.error("websocket is not initialised or no extracted text");
    }

    // const blobName = generateFileName(interviewId, file.name, "jd");
    // const sasUrl = await generateSasToken(blobName);

    // if (!sasUrl) {
    //     toast.error("Error uploading Job description");
    //     return;
    // }

    // try {
    //     const uploadResponse = await fetch(sasUrl, {
    //         method: "PUT",
    //         headers: {
    //             "x-ms-blob-type": "BlockBlob",
    //         },
    //         body: file,
    //     });

    //     if (!uploadResponse.ok) {
    //         toast.error("Job description Upload Failed");
    //     }
    // } catch (error) {
    //     console.error(error);
    // }
  };


  // File validation helper
  const validateFile = (file: File) => {
    if (!file) {
      toast.error("No file selected");
      return false;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return false;
    }

    if (file.size > 1024 * 1024) {
      toast.error("File size should be 1 MB or less");
      return false;
    }

    return true;
  };

  // Handle resume upload events
  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      handleResumeAnalysis(file);
    }
  };

  const handleResumeDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (validateFile(file)) {
      handleResumeAnalysis(file);
    }
  };

  const handleProfileChange = (profile: string) => {
    setSelectedJobProfile(profile);

    if (profile === "Other") {
      setJD("");
      return;
    }

    setJD(profile);
    toast.success("Job Description analysed successfully");
  };

  const handleJDSubmit = (jobProfile: string) => {
    if (!jobProfile) {
      return;
    }
    setJD(jobProfile);
    toast.success("Job Description analysed successfully");
  };

  const handleJDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setJDFile(file);
      await handleJDAnalysis(file);
    }
  };

  const handleJDDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setJDFile(file);
      await handleJDAnalysis(file);
    }
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

  // useEffect(() => {
  //   console.log("JD11", JD);
  //   console.log("rubrics22", rubricsList);
  // }, [JD, rubricsList]);

  // const { startStream } = useMediaStream();

  const startInterview = useCallback(async () => {
    if (!resumeText || !JD) {
      toast.error("Upload CV and Job Description");
      return;
    }

    setLoading(true);

    // Create interview first
    try {
      const res = await createInterview(talentProfileId);

      if (res.status === "success" && res.interviewId) {
        setInterviewId(res.interviewId);

        try {

          if (res.status === "success" && res.interviewId) {
            // Store interview data in sessionStorage
            sessionStorage.setItem('interviewData', JSON.stringify({
              pdf_text: resumeText,
              job_description: JD,
              interview_id: res.interviewId,
              rubrics: rubricsList,
            }));
            // Navigate to interview page
            await MediaService.initializeStream();
            if (category) {
              router.push(`/interview/${res.interviewId}?type=${interviewType}&c=${category}`);
            } else {
              router.push(`/interview/${res.interviewId}?type=${interviewType}`);
            }
          } else {
            toast.error(res.message || "Failed to create interview");
            setLoading(false);
          }
        } catch (err) {
          toast.error("Failed to access microphone and camera. Please check your permissions.");
          setLoading(false);
        }
      } else {
        toast.error(res.message || "Failed to create interview");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating interview");
      setLoading(false);
    }
  }, [resumeText, JD, talentProfileId]);

  return (
    <>
      <div className="flex items-center md:justify-center justify-top w-full relative">
        <div className="max-w-[1200px] w-full flex flex-col items-center">
          <div className="w-full border-t-white border-t-2 md:max-w-[700px] scrollbar-hide overflow-hidden overflow-x-hidden flex flex-col items-center justify-center bg-primary-foreground p-4 rounded-lg">
            <div className="text-2xl font-semibold mb-4 text-primary text-center">
              Upload Your Resume {jobDescription.length == 0 && ("& Job Description")}
            </div>

            <div className="flex justify-center gap-6 w-full">
              {/* Resume Upload Section */}
              <div className="bg-white py-3 px-4 rounded-xl w-full shadow-md">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Resume/CV</h3>

                {/* Existing Resume Selection */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Existing Resume
                  </label>
                  <Select
                    onValueChange={(value) => {
                      const selectedResume = resumeList.find(resume => resume.id === value);
                      if (selectedResume) {
                        setResumeText(selectedResume.resumeFileText || '');
                        // Additional logic to handle selection
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {(resumeList && resumeList.length > 0) ? resumeList.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.resumeName || 'Unnamed Resume'}
                        </SelectItem>
                      )) : "No resumes available"}
                    </SelectContent>
                  </Select>

                  {/* Divider */}
                  <div className="flex items-center my-2">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-3 text-xs text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                </div>


                {/* Upload New Resume */}
                {resumeText !== "" && resumeFile ? (
                  <div className="text-center text-gray-600 font-medium relative h-[80px] flex items-center justify-center border border-gray-200 rounded-md p-2">
                    Resume Uploaded: {resumeFile?.name}
                    <button
                      className="absolute top-2 right-2 text-gray-600 hover:text-destructive focus:outline-none"
                      onClick={() => setResumeText("")}
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-dashed border-2 border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center bg-white h-[100px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleResumeDrop(e)}
                  >
                    <p className="text-gray-500 mt-1 text-xs">
                      Drag & Drop or
                    </p>
                    <label
                      htmlFor="resumeUpload"
                      className="text-gray-500 cursor-pointer text-xs"
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
                    <div className="text-3xl mt-1 text-gray-300">
                      {isUploadingResume ? <Circles
                        height="20"
                        width="20"
                        color="text-gray-400"
                        ariaLabel="circles-loading"
                        visible={true}
                      /> : <IoCloudUploadOutline />}
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      PDF format only. Max 1 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Job Description Section */}
              {
                jobDescription.length == 0 && (

                  <div className="bg-white py-3 px-4 rounded-xl w-full shadow-md">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">Job Description</h3>

                    <div className="w-full mb-3 relative">
                      <textarea
                        id="JD"
                        className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${isUploadingJD ? 'bg-gray-100' : ''}`}
                        rows={4}
                        placeholder="Paste or type job description here..."
                        value={JD || ""}
                        onChange={(e) => setJD(e.target.value)}
                        disabled={isUploadingJD}
                      />

                      {isUploadingJD && (
                        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                          <div className="flex gap-1 items-center">
                            <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 bg-black rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      )}
                    </div>


                    {/* Divider */}
                    <div className="relative w-full py-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs text-gray-500">OR</span>
                      </div>
                    </div>

                    {/* JD File Upload */}
                    {JD !== "" && jdFile ? (
                      <div className="text-center text-gray-600 font-medium mt-2 p-2 border border-gray-200 rounded-md flex items-center justify-between">
                        <span className="text-sm truncate max-w-[85%]">{jdFile?.name}</span>
                        <button
                          className="text-gray-600 hover:text-red-600 focus:outline-none"
                          onClick={() => setJD("")}
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="border border-dashed border-gray-300 rounded-md p-2 mt-2 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onDragOver={handleDragOver}
                        onDrop={handleJDDrop}
                      >
                        <div className="flex items-center text-gray-500 text-xs">
                          <IoCloudUploadOutline className="text-gray-400 mr-1 text-lg" />
                          Drag & Drop Files Here
                        </div>
                        <label
                          htmlFor="jdUpload"
                          className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded text-xs cursor-pointer"
                        >
                          Browse
                        </label>
                        <input
                          id="jdUpload"
                          type="file"
                          accept=".doc,.docx,.pdf"
                          className="hidden"
                          onChange={handleJDUpload}
                        />
                      </div>
                    )}
                    <p className="text-slate-500 text-xs mt-1">
                      Supported file format: PDF. File size limit: 1 MB
                    </p>
                  </div>
                )
              }
            </div>

            {/* Action Button */}
            <div className="mt-6 w-full">
              <Button
                onClick={startInterview}
                disabled={loading || (!resumeText || !JD)}
                className="w-full py-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Preparing Interview...
                  </span>
                ) : (
                  <span>Start Interview</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateInterviewComponent;
