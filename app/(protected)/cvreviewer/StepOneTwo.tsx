"use client";
import {
  useState,
  DragEvent,
  ChangeEvent,
} from "react";
import { IoDocumentAttach, IoCloudUploadOutline } from "react-icons/io5";
import Image from "next/image";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import { useUserStore } from "@/utils/userStore";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setExtractedText, setJobProfile, setManualJobDescription, setResumeBase64, setResumeId, setResumeName, setStructuredData } from "@/lib/features/cv_reviewer/cvReviewerSlice";

const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface StepOneTwoProps {
  step: number;
  handleNextClick: () => void;
  handleBackClick: () => void;
}


function generateFileName(
  originalFileName: string,
  filetype: string,
) {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  const fileExtension = originalFileName.split(".").pop();
  return `${timestamp}_${filetype}.${fileExtension}`;
}

const StepOneTwo: React.FC<StepOneTwoProps> = ({
  step,
  handleNextClick,
  handleBackClick,
}) => {
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [otherProfile, setOtherProfile] = useState("");
  const dispatch = useAppDispatch();
  const { token } = useUserStore();
  const cvReviewerStorage = useAppSelector((state) => state.cvReviewer);
  const { manualJobDescription, jobProfile, resumeId } = cvReviewerStorage

  // Single unified function to handle resume file processing
  const processResumeFile = async (file: File) => {
    setUploading(true);
    setIsResumeUploaded(false);

    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      setUploading(false);
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("File size should be less than 1MB");
      setUploading(false);
      return;
    }

    try {

      // 2. Save file to Redux
      const resumeBase64 = await fileToBase64(file);
      const resumeName = file.name
      if (resumeBase64) {
        dispatch(setResumeBase64(resumeBase64));
        dispatch(setResumeName(resumeName));
      }
      // 3. Extract text from PDF
      const extractedText = await extractTextFromPdf(file);
      if (!extractedText) {
        toast.error("Failed to extract text from PDF");
        setUploading(false);
        return;
      }

      dispatch(setExtractedText(extractedText));

      // 4. Convert file to base64 for API
      const base64String = await fileToBase64(file);
      if (!base64String) {
        toast.error("Failed to convert file to base64");
        setUploading(false);
        return;
      }

      // 5. Extract structured data
      const structuredDataResult = await extractStructuredData(extractedText);
      if (structuredDataResult && structuredDataResult.message) {
        dispatch(setStructuredData(structuredDataResult.message));
      } else {
        toast.error("Failed to extract structured data");
      }

      // 6. Upload CV and job description to API
      await uploadCVAndJobDescription(file, extractedText);

    } catch (error) {
      console.error("Error processing resume:", error);
      toast.error("Failed to process the resume");
      setUploading(false);
    }
  };

  // Helper functions
  const extractTextFromPdf = async (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      let extractedText = "";

      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;

          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            extractedText += pageText + "\n";
          }

          resolve(extractedText);
        } catch (error) {
          console.error("Error extracting text from PDF:", error);
          reject(error);
        }
      };

      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  };

  const fileToBase64 = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1] || null;
        resolve(base64String);
      };
      reader.onerror = () => reject(null);
      reader.readAsDataURL(file);
    });
  };

  const extractStructuredData = async (text: string) => {
    try {
      const response = await fetch(`${baseUrl}/extract_structured_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cv_text: text }),
      });

      const result = await response.json();
      if (response.ok) {
        return result;
      }
      return null;
    } catch (error) {
      console.error("Error extracting structured data:", error);
      return null;
    }
  };

  const uploadCVAndJobDescription = async (file: File, extractedText: string) => {
    try {
      if (!token) {
        toast.error("Authorization required");
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append("resumeFile", file);
      formData.append("resumeFileText", extractedText);
      const response = await fetch("/api/resume/add_new", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: (formData),
      });

      const res = await response.json();

      // Handle resume ID based on response status
      let tempId: string = "";
      if (res.status == 409 || res.status == 200) {
        tempId = res.resume?.id;
        dispatch(setResumeId(tempId));
        setUploading(false);
        setIsResumeUploaded(true);
        toast.success("Resume uploaded successfully");
      } else if(res.error){
           toast.error("Error Uploading Resume,Try after a while")
      }

    } catch (error) {
      console.error("Error uploading CV:", error);
      toast.error("Resume upload failed");
      setUploading(false);
    }
  };

  // Event handlers
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    await processResumeFile(file);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processResumeFile(file);
    }
  };

  const triggerFileInput = () => {
    const inputElement = document.getElementById("resume-upload") as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  };

  return (
    <div className="md:h-screen bg-primary-foreground min-h-screen p-4 flex items-center md:justify-center justify-top w-full border-[#eeeeee] overflow-hidden">
      <div className="max-w-[1350px] h-full max-h-[570px]  w-full flex flex-col items-stretch md:flex-row justify-evenly">
        <div className="hidden max-w-[450px] w-[90vw] md:w-[50vw] sm:flex flex-col items-center justify-evenly bg-primary shadow-lg text-white rounded-3xl p-8 gap-8 relative">
          <Image
            src={"/images/Globe.svg"}
            className="w-full h-auto px-12"
            alt="image"
            width={100}
            height={100}
          ></Image>
          <div className="relative text-[#eee] flex flex-col items-center">
            <h2 className="text-xl w-full font-bold leading-snug">
              Use the wiZe AI CV Reviewer
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Get your CV analyzed in 30 seconds using different parameters to
              optimize it.
              <span className="font-semibold"> All the best!</span>
            </p>
          </div>
        </div>

        <div className="w-full py-8 md:max-w-[500px] max-h-[89vh] scrollbar-hide overflow-hidden lg:max-w-[600px] overflow-x-hidden flex flex-col items-center justify-center bg-primary-foreground relative">
          <div className="text-lg font-bold text-primary ">
            {step === 1 ? "Get Started!" : "Additional Info!"}
          </div>

          <div className="flex mx-auto items-center max-w-[250px] justify-center mb-2 w-full">
            <div className="relative flex-1">
              <div
                className={`w-5 h-5 bg-primary rounded-full flex items-center justify-center z-10`}
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
                className={`absolute top-1/2 left-5 h-1 -translate-y-1/2 transition-all duration-500 ease-in-out ${isResumeUploaded ? "bg-primary w-full" : "bg-slate-500 w-0"
                  } w-full`}
              ></div>
            </div>
            <div className="relative">
              <div
                className={`w-5 h-5 ${jobProfile ? "bg-primary" : "bg-slate-500"
                  } rounded-full flex items-center justify-center`}
              >
                {jobProfile && (
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
                )}
              </div>
            </div>
          </div>

          <div className="text-center mb-4 mt-3 w-full text-2xl font-bold text-gray-800">
            {step === 1
              ? "Upload your latest CV/Resume"
              : "Select your Interview jobProfile"}
          </div>

          {step === 1 ? (
            <div className="bg-white py-4 px-8 rounded-3xl w-full md:max-w-[350px] lg:max-w-[400px] shadow-lg text-center">
              <div className="flex items-center justify-center text-primary mb-2 relative top-0 text-3xl">
                <IoDocumentAttach />
              </div>

              <div
                className="border-dashed border-2 border-slate-500 rounded-xl p-2 flex flex-col items-center justify-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="text-gray-500 mt-2 text-sm">Drag & Drop or</div>
                <label
                  htmlFor="resume-upload"
                  className="text-gray-500 cursor-pointer text-sm"
                >
                  Click to{" "}
                  <span className="font-semibold text-primary ">
                    Upload Resume
                  </span>
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".doc,.docx,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="text-4xl mt-3 text-slate-500">
                  <IoCloudUploadOutline />
                </div>

                <p className="text-slate-500 text-sm mt-2">
                  Supported file format: .PDF File size limit 1MB.
                </p>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  className="bg-primary text-base px-10 relative text-white font-semibold py-[6px] rounded-xl hover:bg-primary focus:ring-4 focus:ring-primary-foreground transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 inline-block mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isResumeUploaded
                    ? "Upload again"
                    : uploading
                      ? "Uploading..."
                      : "Upload Resume"}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`p-8 gap-4 flex flex-col items-center justify-start bg-white rounded-3xl w-full md:max-w-[350px] lg:max-w-[400px] shadow-lg text-center md:min-h-[250px]`}
            >
              <select
                className={`w-full p-4 py-2 font-medium outline-none rounded-lg text-md text-center bg-white border-2 ${jobProfile === "other" || jobProfile === null || jobProfile === ""
                  ? "border-slate-500"
                  : "border-primary ring-primary ring-1"
                  }  `}
                value={manualJobDescription || ""}
                onChange={(e) => {
                  dispatch(setManualJobDescription(e.target.value));
                  if (e.target.value !== "other") dispatch(setJobProfile(e.target.value));
                  else dispatch(setJobProfile(null));
                }}
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="SOFTWARE">Software</option>
                <option value="DATA">Data</option>
                <option value="CORE">Core</option>
                <option value="CONSULTING">Consulting</option>
                <option value="FINANCE">Finance</option>
                <option value="other">Other&apos;s</option>
              </select>

              {manualJobDescription === "other" && (
                <input
                  type="text"
                  className={`w-full p-4 py-2 font-medium outline-none rounded-lg text-md text-center bg-white border-2 ${jobProfile === "other" || jobProfile === null
                    ? "border-slate-500"
                    : "border-primary ring-primary ring-1"
                    }  `}
                  placeholder="Please specify your jobProfile"
                  value={otherProfile}
                  onChange={(e) => {
                    setJobProfile(e.target.value);
                    setOtherProfile(e.target.value);
                  }}
                />
              )}
            </div>
          )}
          <div className="mt-8 w-full px-4 flex flex-col items-center">
            {step === 1 ? (
              <button
                className={`w-[40vw] xl:w-[32vw] md:max-w-[700px] h-full text-lg font-bold py-4 rounded-lg focus:ring-4 focus:ring-gray-200 transition ${isResumeUploaded
                  ? "bg-gray-600 hover:bg-gray-800 text-white"
                  : "bg-slate-500 text-gray-800 cursor-not-allowed"
                  }`}
                disabled={!isResumeUploaded}
                onClick={handleNextClick}
              >
                Next
              </button>
            ) : (
              <>
                <button
                  className={`w-[40vw] xl:w-[32vw] md:max-w-[700px] h-full text-lg font-bold py-4 rounded-lg focus:ring-4 focus:ring-gray-200 transition ${jobProfile
                    ? "bg-gray-600 hover:bg-gray-800 text-white"
                    : "bg-slate-500 text-gray-800 cursor-not-allowed"
                    }`}
                  disabled={!jobProfile}
                  onClick={handleNextClick}
                >
                  Next
                </button>
              </>
            )}
            <button
              className={`absolute bottom-0 opacity-0 text-primary w-full font-semibold hover:underline cursor-pointer focus:ring-4 focus:ring-gray-200 transition ${step === 1 ? "opacity-0" : "opacity-100"
                }`}
              onClick={handleBackClick}
              disabled={step === 1}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOneTwo;