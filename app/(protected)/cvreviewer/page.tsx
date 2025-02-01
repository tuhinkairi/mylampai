"use client";
import { useState, ChangeEvent } from "react";
import { useInterviewStore } from "@/utils/store";
import { useUserStore } from "@/utils/userStore";
import StepOneTwo from "./StepOneTwo";
import PDFViewer from "./StepThree";
import { toast } from "sonner";

// const baseUrl = "https://optim-cv-judge.onrender.com";
const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT;

const Page: React.FC = () => {
  const { setResumeFile, setJobDescriptionFile, resumeFile } =
    useInterviewStore();
  const [step, setStep] = useState(1);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualJobDescription, setManualJobDescription] = useState("");
  const [structuredData, setStructuredData] = useState<any>(null);
  const { token } = useUserStore();
  const [profile, setProfile] = useState<string | null>(null);
  const [localResume, setLocalResume] = useState<File | null>(null);
  const [cvId, setCvId] = useState("");
  
  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target?.files?.[0];
    if (file) {
      setResumeFile(file);
      setLocalResume(file);
      const resumeFileBinary = await getBinaryData(file);
      uploadCVAndJobDescription(resumeFileBinary, manualJobDescription);
    }
  };

  const triggerFileInput = (inputId: string) => {
    const inputElement = document.getElementById(
      inputId
    ) as HTMLInputElement | null;
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleNextClick = () => {
    console.log("next triggered : ",step)
    setStep((prevStep) => prevStep + 1);
  };

  const handleBackClick = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleJobDescriptionUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target?.files?.[0];
    if (file) {
      const extractedText = await extractTextFromFile(file);
      if (extractedText) {
        setJobDescriptionFile(extractedText);

        const resumeFileBinary = await getBinaryData(resumeFile);
        await uploadCVAndJobDescription(resumeFileBinary, extractedText);
      }
    }
  };

  const getBinaryData = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read file as binary"));
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${baseUrl}/extract_text_from_file`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      return result.text || ""; // Adjust this depending on your API response structure
    } catch (error) {
      console.error("Error extracting text from file:", error);
      toast.error("Failed to extract text from file");
      return "";
    }
  };

  const handleManualEntryToggle = () => {
    setIsManualEntry(true);
    setJobDescriptionFile(null);
  };

  const handleUploadJDToggle = () => {
    setIsManualEntry(false);
    setManualJobDescription("");
  };

  const handleManualJDUpload = async () => {
    if (manualJobDescription.trim()) {
      const resumeFileBinary = await getBinaryData(resumeFile); // Convert resume to binary
      await uploadCVAndJobDescription(resumeFileBinary, manualJobDescription);
    }
  };

  const uploadCVAndJobDescription = async (
    resumeFileBinary: ArrayBuffer,
    jobDescriptionText: string
  ) => {
    try {
      if (!token) {
        toast.error("Unauthorized");
        return;
      }

      const jobDescriptionBase64 = btoa(jobDescriptionText);

      const resumeBase64 = Buffer.from(resumeFileBinary).toString("base64");

      const response = await fetch("/api/interviewer/post_cv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Resume: resumeBase64,
          JobDescription: jobDescriptionBase64,
        }),
      });

      const result = await response.json();
      setCvId(result.id);

      if (response.ok) {
      } else {
        toast.error(result.error || "Failed to upload CV and Job Description");
      }
    } catch (error) {
      toast.error("An error occurred while uploading CV and Job Description");
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full">
      {step === 1 || step === 2 ? (
        <StepOneTwo
          step={step}
          handleResumeUpload={handleResumeUpload}
          triggerFileInput={triggerFileInput}
          handleNextClick={handleNextClick}
          handleBackClick={handleBackClick}
          handleJobDescriptionUpload={handleJobDescriptionUpload}
          handleManualEntryToggle={handleManualEntryToggle}
          handleUploadJDToggle={handleUploadJDToggle}
          handleManualJDUpload={handleManualJDUpload}
          isManualEntry={isManualEntry}
          manualJobDescription={manualJobDescription}
          setManualJobDescription={setManualJobDescription}
          profile={profile}
          setProfile={setProfile}
          cvId={cvId}
          setCvId={setCvId}
        />
      ) : (
        <PDFViewer
          profile={profile}
          structuredData={structuredData}
          localResume={localResume}
          cvId={cvId}
        />
      )}
    </div>
  );
};

export default Page;
