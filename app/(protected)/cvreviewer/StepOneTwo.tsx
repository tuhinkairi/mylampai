"use client";
import {
  useState,
  DragEvent,
  ChangeEvent,
  useCallback,
} from "react";
import { IoDocumentAttach, IoCloudUploadOutline } from "react-icons/io5";
import Image from "next/image";
import { useInterviewStore } from "@/utils/store";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import { useUserStore } from "@/utils/userStore";
import {
  BlobServiceClient,
  ContainerSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { generateSasToken } from "@/actions/azureActions";

const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT
// console.log(baseUrl)

interface StepOneTwoProps {
  step: number;
  handleResumeUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  triggerFileInput: (inputId: string) => void;
  handleNextClick: () => void;
  handleBackClick: () => void;
  handleJobDescriptionUpload: (
    event: ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleManualEntryToggle: () => void;
  handleUploadJDToggle: () => void;
  handleManualJDUpload: () => void;
  isManualEntry: boolean;
  manualJobDescription: string;
  setManualJobDescription: React.Dispatch<React.SetStateAction<string>>;
  profile: string | null;
  setProfile: React.Dispatch<React.SetStateAction<string | null>>;
  cvId: string;
  setCvId: React.Dispatch<React.SetStateAction<string>>; // Updated type
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
  triggerFileInput,
  handleNextClick,
  handleBackClick,
  setProfile,
  profile,
  manualJobDescription,
  setManualJobDescription,
  setCvId
}) => {
  const {
    setResumeFile,
    setExtractedText,
    setStructuredData,
    structuredData,
    setResumeId,
    resumeId
  } = useInterviewStore();

  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [otherProfile, setOtherProfile] = useState("");
  const [next,Setnext] = useState<boolean>(false)

  const { token } = useUserStore();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };


  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    setUploading(true);

    if (file && file.type === "application/pdf") {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("File size should be less than 1MB");
        setUploading(false);
        return;
      }
      const blobName = generateFileName(file.name, "cv");
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
        } else {
          // console.log(uploadResponse);

        }
      } catch (error) {
        console.error(error);
      }

      setResumeFile(file);

      const fileReader = new FileReader();
      let extractedText = "";

      fileReader.onload = async function () {
        const typedArray = new Uint8Array(this.result as ArrayBuffer);

        // Load the PDF document
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        // Loop through each page
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();

          // Extract text
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          extractedText += pageText + "\n";
        }

        // Convert the file to base64
        const base64Reader = new FileReader();
        base64Reader.onloadend = async () => {
          const base64String = base64Reader.result?.toString().split(",")[1];

          if (base64String && extractedText) {
            try {
              setExtractedText(extractedText);
              const structuredDataResult = await extractStructuredData(
                extractedText
              );

              // Check if structuredDataResult and structuredDataResult.message exist before accessing
              if (structuredDataResult && structuredDataResult.message) {
                setStructuredData(structuredDataResult.message);
                toast.success("extracted structured data");
              } else {
                toast.error("Failed to extract structured data");
              }

              // Trigger the upload of CV and Job Description with base64 string and extracted text
              // await uploadCVAndJobDescription(base64String, extractedText);
            } catch (err) {
              toast.error("Failed to process the PDF");
              console.error("Error:", err);
            }
          } else {
            toast.error("Error converting file to base64 or extracting text");
          }
        };

        base64Reader.readAsDataURL(file); // Start reading the file as a data URL
      };

      fileReader.readAsArrayBuffer(file);
    } else {
      toast.error("Please upload a PDF file");
      setUploading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const file = event.target.files?.[0];

    setUploading(true);

    if (file && file.type === "application/pdf") {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("File size should be less than 1MB");
        setUploading(false);
        return;
      }
      const blobName = generateFileName(file.name, "cv");
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
        } else {
          // console.log(uploadResponse);
        }
      } catch (error) {
        console.error(error);
      }

      setResumeFile(file);

      const fileReader = new FileReader();
      let extractedText = "";

      fileReader.onload = async function () {
        const typedArray = new Uint8Array(this.result as ArrayBuffer);

        // Load the PDF document
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        // Loop through each page
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();

          // Extract text
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          extractedText += pageText + "\n";
        }

        // Convert the file to base64
        const base64Reader = new FileReader();
        base64Reader.onloadend = async () => {
          const base64String = base64Reader.result?.toString().split(",")[1];

          if (base64String && extractedText) {
            try {
              setExtractedText(extractedText);
              const structuredDataResult = await extractStructuredData(
                extractedText
              );

              // Check if structuredDataResult and structuredDataResult.message exist before accessing
              if (structuredDataResult && structuredDataResult.message) {
                setStructuredData(structuredDataResult.message);
                toast.success("extracted structured data");
              } else {
                toast.error("Failed to extract structured data");
              }

              // Trigger the upload of CV and Job Description with base64 string and extracted text
              // await uploadCVAndJobDescription(base64String, extractedText);
            } catch (err) {
              toast.error("Failed to process the PDF");
              console.error("Error:", err);
            }
          } else {
            toast.error("Error converting file to base64 or extracting text");
          }
        };
        base64Reader.readAsDataURL(file); // Start reading the file as a data URL
      };

      fileReader.readAsArrayBuffer(file);
    } else {
      toast.error("Please upload a PDF file");
      setUploading(false);
    }
  };

  const uploadCVAndJobDescription = useCallback(
    async (base64String: string, extractedText: string) => {
      try {
        if (!token) {
          return;
        }
        const response = await fetch("/api/interviewer/post_cv", {

          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Resume: base64String, // Sending base64 string of the PDF
            JobDescription: extractedText || manualJobDescription, // Depending on whether it's a file or manual entry
          }),
        });
        const cvid = await response.json()
        console.log(cvid)
        const tempId: string = cvid.cv.id
        setResumeId(tempId)
        await getSummary(extractedText, tempId)
        console.log(extractedText)
        console.log(resumeId)
        setCvId(cvid.id)

        
      } catch (error) {
        console.error("Error:", error);
        toast.error("summary analysis failed")
        setUploading(false);

      }
    },
    [manualJobDescription,setCvId,token]
  );

  const extractStructuredData = useCallback(async (text: string) => {
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
        setIsResumeUploaded(true);
        toast.success("Resume uploaded successfully");
        // console.log(summary )

        return result;
      }
      toast.error("Error extracting structured data from resume");
      return null;
    } catch (error) {
      toast.error("Error extracting structured data from resume");
      setUploading(false);
      return null;
    }
  }, []);
  const getSummary = useCallback(async (text: string, ResumeId: string) => {
    try {
      const response = await fetch("/api/interviewer/resumeAnalysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cv_text: text, id: ResumeId, structuredData:structuredData }),
      });

      if (!response.ok) {
        toast.error("Error in getSummary")
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Response received:", result);
      
      // Return result if needed
      Setnext(true)
      toast.success("Summary uploaded successfully")
      return result;
    } catch (error) {
      console.error("Error in getSummary:", error);
    }
  }, []);
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
                className={`w-5 h-5 ${profile ? "bg-primary" : "bg-slate-500"
                  } rounded-full flex items-center justify-center`}
              >
                {profile && (
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
              : "Select your Interview profile"}
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
                  htmlFor="resumeUpload"
                  className="text-gray-500 cursor-pointer text-sm"
                >
                  Click to{" "}
                  <span className="font-semibold text-primary ">
                    Upload Resume
                  </span>
                </label>
                <input
                  id="resumeUpload"
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
                  onClick={() => triggerFileInput("resumeUpload")}
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
                className={`w-full p-4 py-2 font-medium outline-none rounded-lg text-md text-center bg-white border-2 ${profile === "other" || profile === null || profile === ""
                  ? "border-slate-500"
                  : "border-primary ring-primary ring-1"
                  }  `}
                value={manualJobDescription}
                onChange={(e) => {
                  setManualJobDescription(e.target.value);
                  if (e.target.value !== "other") setProfile(e.target.value);
                  else setProfile(null);
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
                  className={`w-full p-4 py-2 font-medium outline-none rounded-lg text-md text-center bg-white border-2 ${profile === "other" || profile === null
                    ? "border-slate-500"
                    : "border-primary ring-primary ring-1"
                    }  `}
                  placeholder="Please specify your profile"
                  value={otherProfile}
                  onChange={(e) => {
                    setProfile(e.target.value);
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
                disabled={!next}
                onClick={handleNextClick}
              >
                Next
              </button>
            ) : (
              <>
                <button
                  className={`w-[40vw] xl:w-[32vw] md:max-w-[700px] h-full text-lg font-bold py-4 rounded-lg focus:ring-4 focus:ring-gray-200 transition ${profile
                    ? "bg-gray-600 hover:bg-gray-800 text-white"
                    : "bg-slate-500 text-gray-800 cursor-not-allowed"
                    }`}
                  disabled={!profile }
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