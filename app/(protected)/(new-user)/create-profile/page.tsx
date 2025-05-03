"use client";
import Link from "next/link";
import Image from "next/image";
import { addProfiles, addSkills, createEducation, createExperiences, createManualProfile, createTalentProfile, updateBio, updateProfile, updateTitle } from "@/actions/setupProfileActions";
import { Check, Clock9 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCategoriesSelector } from "@/components/create-profile/job-specialites";
import { ArrayInput } from "@/components/misc/ArrayInput";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ProfessionalRole } from "@/components/create-profile/job-role";
import { WorkExperiences } from "@/components/create-profile/work-experiences";
import { EducationDetails } from "@/components/create-profile/education-details";
import { LanguageSelector } from "@/components/create-profile/language-selector";
import { BioDetails } from "@/components/create-profile/bio-details";
import { HourlyRate } from "@/components/create-profile/hourly-rate";
import { PersonalDetailsForm } from "@/components/create-profile/personal-details-form";
import { useState, useRef, useCallback, DragEvent, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/utils/userStore";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { generateSasToken } from "@/actions/azureActions";
import { IoCloudUploadOutline, IoDocumentAttach } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  setId,
  setResumeUrl,
  setTitle,
  setBio,
  setRate,
  setSkills,
  setProfiles,
  setHours,
  setExperiences,
  setEducations,
  setLanguages,
} from '@/lib/features/talent_profile/talentProfileSlice';
import CreateProfileDialog from "./createProfileDialog";



const formSchema = z.object({
  skills: z.array(z.string()).min(1, "At least one skill is required"),
});

// const baseUrl = "https://optim-cv-judge.onrender.com";
const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT


function generateFileName(originalFileName: string, filetype: string) {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  const fileExtension = originalFileName.split(".").pop();
  return `${timestamp}_${filetype}.${fileExtension}`;
}

interface ExperiencesData {
  company: string;
  position: string;
  location?: string;
  skills: string[];
  startDate?: Date;
  endDate?: Date;
  description: string;
}


interface EducationData {
  school: string;
  degree: string;
  field?: string;
  grade?: string;
  skills: string[];
  startDate: Date;
  endDate?: Date;
  description?: string;
};

interface StructuredResult {
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  street: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  workCategory: string;
  profiles: string[];
  skills: string[];
  jobRole: string;
  experience: ExperiencesData[];
  education: EducationData[];
  bio: string;
}

interface UserInfo {
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export default function CreateProfile() {
  const { userData, token } = useUserStore();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysing, setAnalysing] = useState(false)
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.talentProfile);
  const id = profile?.id
  const [resumeText, setResumeText] = useState<string>("")
  // const [userInfo, setuserInfo] = useState<UserInfo>({
  //   name: "",
  //   first_name: "",
  //   last_name: "",
  //   phone: "",
  //   street: "",
  //   city: "",
  //   state: "",
  //   country: "",
  //   zipCode: ""
  // })

  // const [profiles, setProfiles] = useState<string[]>([])
  // const [skills, setSkills] = useState<string[]>([])
  // const [jobTitle, setJobTitle] = useState<string>("")
  // const [experiences, setExperiences] = useState<ExperienceData[]>([])
  // const [educations, setEducations] = useState<EducationData[]>([])
  // const [userBio, setUserBio] = useState<string>("")
  // const user = await auth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: [],
    },
  });

  const handleResumeUpload = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    await processResume(file)
  };

  const mapStructuredResultToUserInfo = (structuredResult: StructuredResult): UserInfo => {
    return {
      name: structuredResult.name || "",
      first_name: structuredResult.first_name || "",
      last_name: structuredResult.last_name || "",
      phone: structuredResult.phone || "",
      street: structuredResult.street || "",
      city: structuredResult.city || "",
      state: structuredResult.state || "",
      country: structuredResult.country || "",
      zipCode: structuredResult.zipCode || ""
    }
  }

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



  const processResume = async (file: File) => {

    // Reset states for new upload
    setUploading(false);
    setAnalysing(false);
    setIsResumeUploaded(false);

    if (file && file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (!userData) {
      toast.error("Unknown error occurred");
      return;
    }

    if (file && file.type === "application/pdf") {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("File size should be less than 1MB");
        return;
      }

      setUploading(true);

      const blobName = generateFileName("resume.pdf", "cv");
      const sasUrl = await generateSasToken(blobName);

      if (!sasUrl) {
        toast.error("Error uploading resume");
        setUploading(false);
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
          setUploading(false); // Reset upload state on failure
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Error during resume upload");
        setUploading(false);
      }

      setUploading(false);

      // Start analysing
      setAnalysing(true);

      const extractedText = await extractTextFromPDF(file)

      try {
        const structuredDataResult = await extractStructuredData(
          extractedText
        );

        if (!structuredDataResult) {
          toast.error("Failed to extract structured data");
          setAnalysing(false);
          return;
        }

        let newTalentProfileId = null
        try {
          const formData = new FormData();
          formData.append("resumeFile", file);
          formData.append("resumeFileText", JSON.stringify(structuredDataResult.message))
          const response = await fetch("/api/resume/add_new", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: (formData),
          });

          const result = await response.json();

          if (result.status === 409 || result.status === 200) {
            dispatch(setResumeUrl(result.resume.resumeUrl))
            dispatch(setId(result.resume.id))
          } else {
            toast.error("Failed to save resume information");
            setAnalysing(false);
            return;
          }

          const res = await createTalentProfile(result.resume.resumeUrl, userData.id);

          if (res.status !== 200) {
            toast.error(res.error);
            setAnalysing(false);
            return;
          } else {
            if (res.data) {
              newTalentProfileId = res.data.id;
              dispatch(setResumeUrl(res.data?.resumeUrl ?? ''));
              dispatch(setId(res.data.id));
            } else {
              toast.error("Failed to create talent profile");
              setAnalysing(false);
              return;
            }
          }
        } catch (error) {
          toast.error("Failed to upload resume");
          setAnalysing(false);
          return;
        }
        // Check if structuredDataResult and structuredDataResult.message exist before accessing

        if (structuredDataResult && structuredDataResult.message && newTalentProfileId) {
          // console.log("userId::", userData.id, " talentProfileId:: ", newTalentProfileId)
          await processAndSaveData(
            structuredDataResult,
            userData?.id,
            newTalentProfileId
          );
          setIsResumeUploaded(true);
        } else {
          toast.error("Failed to extract structured data");
        }
      } catch (err) {
        toast.error("Failed to process the PDF");
        console.error("Error:", err);
      } finally {
        setAnalysing(false);
      }
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

    if (!file) {
      toast.error("No file selected");
      return;
    }

    await processResume(file);
  };

  const extractStructuredData = useCallback(async (text: string) => {
    try {
      // console.log("debug in extractSD")
      const response = await fetch(`${baseUrl}/extract_profile_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cv_text: text }),
      });

      const result = await response.json();
      if (response.ok) {
        // setIsResumeUploaded(true);
        // toast.success("Resume uploaded successfully");
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!id) return;
      const res = await addSkills(values.skills, id);
      if (res.status === 200) {
        dispatch(setSkills(values.skills))
        setStep(4);
      } else {
        console.error("Error adding skills:", res.error);
        toast.error("Error adding skills");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create job");
    }
  }

  const handleIncStep = (val: number) => {
    if (step < 10) setStep(val);
  };

  const handleDecStep = (val: number) => {
    if (step > 1) setStep(val);
  };

  //manual createTalentProfile without resume

  const handleManualCreateProfile = async () => {
    try {
      if (!userData) {
        toast.error("Unknown error occurred");
        return;
      }
      const res = await createManualProfile(userData?.id)
      if (res.status !== 200) {
        toast.error(res.error);
      } else {
        if (res.data) {
          // console.log("Result from createTalentProfile:: ", res.data.id);
          dispatch(setId(res.data.id));
          handleIncStep(step + 1);
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  //hooks for calling actions
  const processAndSaveData = async (structuredDataResult: any, userId: string, talentProfileId: string) => {
    if (!structuredDataResult || !structuredDataResult.message) {
      console.error("Invalid data received.");
      return;
    }

    // Destructure the message
    const {
      profiles,
      skills,
      jobRole,
      experience,
      education,
      bio
    } = structuredDataResult.message;

    // Map and transform data as needed
    const userInfo = mapStructuredResultToUserInfo(structuredDataResult.message);



    const experienceData = experience.map((exp: ExperiencesData): ExperiencesData => ({
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate) : undefined,
      endDate: exp.endDate ? new Date(exp.endDate) : undefined
    }));

    const educationData = education.map((edu: EducationData): EducationData => ({
      ...edu,
      startDate: new Date(edu.startDate),
      endDate: edu.endDate ? new Date(edu.endDate) : undefined
    }))

    // Define update functions
    // console.log("updating details for : ", talentProfileId, "userId: ", userId)
    const updateUserInfo = () => updateProfile(userInfo, userId);
    const updateUserProfiles = () => addProfiles(profiles, talentProfileId);
    const updateUserSkills = () => addSkills(skills, talentProfileId);
    const updateUserJobTitle = () => updateTitle(jobRole, talentProfileId);
    const updateUserExperiences = () => createExperiences(experienceData, talentProfileId);
    const updateUserEducations = () => createEducation(educationData, talentProfileId);
    const updateUserBio = () => updateBio(bio, talentProfileId);

    // Perform updates in parallel
    try {
      const results = await Promise.allSettled([
        updateUserInfo(),
        updateUserProfiles(),
        updateUserSkills(),
        updateUserJobTitle(),
        updateUserExperiences(),
        updateUserEducations(),
        updateUserBio()
      ]);

      // Handle results
      // results.forEach((result, index) => {
      //     if (result.status === "fulfilled") {
      //         console.log(`Update ${index + 1} succeeded.`);
      //     } else {
      //         console.error(`Update ${index + 1} failed:`, result.reason);
      //     }
      // });

      const allFulfilled = results.every((result) => result.status === "fulfilled")

      if (allFulfilled) {
        dispatch(setBio(bio))
        dispatch(setTitle(jobRole))
        dispatch(setEducations(educationData.map((edu: any) => ({
          ...edu,
          startDate: edu.startDate.toISOString(),
          endDate: edu.endDate ? edu.endDate.toISOString() : undefined
        }))))
        dispatch(setExperiences(experienceData.map((exp: any) => ({
          ...exp,
          startDate: exp.startDate.toISOString(),
          endDate: exp.endDate ? exp.endDate.toISOString() : undefined
        })
        )))
        dispatch(setProfiles(profiles))
        // console.log("All updates succeeded. Redirecting to /talentmatch...");
        router.push("/talentmatch");
      } else {
        console.error("Some updates failed. Please check the logs.");
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Update ${index + 1} failed:`, result.reason);
          }
        });
      }

    } catch (error) {
      console.error("Error while updating data:", error);
    }
  };


  return (
    <div className="relative h-screen w-screen bg-white/25 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl p-8 bg-primary/10 rounded-lg shadow-lg z-50 flex flex-col md:flex-row gap-8">
        {/* Left column */}
        <div className="flex-1">
          <div className="flex items-center mb-6">
            <Link href="/" className="relative">
              <Image
                src="/home/navbar/wizelogo.svg"
                width={120}
                height={40}
                alt="Wize Logo"
                className="h-10 w-auto drop-shadow-md"
              />
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Create New Profile
          </h1>

          <p className="text-gray-600 mb-6">
            Complete your profile to get matched with the perfect opportunities for your skills and experience.
          </p>

          {/* <div className="flex justify-start mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div> */}

          <div className="space-y-4 mb-6">
            <div className="flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Get personalized talent matching</span>
            </div>
            <div className="flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Showcase your skills to employers</span>
            </div>
            <div className="flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Get detailed CV analysis</span>
            </div>
          </div>
        </div>

        {/* Right column - Upload area */}
        <div className="flex-1 border-l pl-8 hidden md:block">
          <div className="flex flex-col items-center justify-center h-full">
            <p className="mb-6 text-center">
              We need to get a sense of your education, experience and skills.
              It's quickest to import your information — you can edit it
              before your profile goes live.
            </p>

            <div className="w-full max-w-md">
              <div className="text-center mb-4 w-full text-xl font-bold text-gray-800">
                Upload your latest CV/Resume
              </div>

              <div className="bg-white py-6 px-6 rounded-xl w-full shadow-md text-center">
                <div className="flex items-center justify-center text-primary mb-4 text-3xl">
                  <IoDocumentAttach />
                </div>

                <div
                  className="border-dashed border-2 border-slate-400 rounded-xl p-6 flex flex-col items-center justify-center"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="text-gray-500 mt-2 text-sm">Drag & Drop or</div>
                  <label
                    htmlFor="resumeUpload"
                    className="text-gray-500 cursor-pointer text-sm"
                  >
                    Click to{" "}
                    <span className="font-semibold text-primary">
                      Upload Resume
                    </span>
                  </label>
                  <input
                    id="resumeUpload"
                    type="file"
                    ref={fileInputRef}
                    accept=".doc,.docx,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="text-4xl mt-4 text-slate-500">
                    <IoCloudUploadOutline />
                  </div>

                  <p className="text-slate-500 text-sm mt-3">
                    Supported file format: .PDF File size limit 1MB.
                  </p>
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    className="bg-primary text-base px-8 text-white font-semibold py-2 rounded-lg hover:bg-primary/90 focus:ring-4 focus:ring-primary/30 transition"
                    onClick={handleResumeUpload}
                  >
                    {isResumeUploaded
                      ? (<div className="flex items-center gap-2"><Check className="w-4 h-4" />Upload again</div>)
                      : uploading
                        ? "Uploading..."
                        : analysing ? (
                          <div className="flex space-x-2 justify-center items-center">
                            <span>AI Analysing</span>
                            <div className="flex gap-1 items-center">
                              <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                            </div>
                          </div>
                        ) : "Upload Resume"}
                  </button>
                </div>
              </div>

              {/* <div className="text-center mt-6">
                <span className="text-gray-500">Don&apos;t have Resume? </span>
                <button
                  type="button"
                  className="text-primary font-medium hover:underline mt-2"
                  onClick={async () => (await handleManualCreateProfile())}
                >
                  Manually enter details
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Mobile version of upload area */}
        <div className="md:hidden w-full mt-6 border-t pt-6">
          <p className="mb-6 text-center">
            We need to get a sense of your education, experience and skills.
            It's quickest to import your information.
          </p>

          <div className="bg-white py-4 px-4 rounded-xl w-full shadow-md text-center">
            <div className="flex items-center justify-center text-primary mb-2 text-2xl">
              <IoDocumentAttach />
            </div>

            <div
              className="border-dashed border-2 border-slate-400 rounded-xl p-4 flex flex-col items-center justify-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-gray-500 text-sm">Drag & Drop or</div>
              <label
                htmlFor="resumeUploadMobile"
                className="text-gray-500 cursor-pointer text-sm"
              >
                Click to{" "}
                <span className="font-semibold text-primary">
                  Upload Resume
                </span>
              </label>
              <input
                id="resumeUploadMobile"
                type="file"
                accept=".doc,.docx,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="text-3xl mt-2 text-slate-500">
                <IoCloudUploadOutline />
              </div>

              <p className="text-slate-500 text-xs mt-2">
                Supported file format: .PDF File size limit 1MB.
              </p>
            </div>

            <div className="flex justify-center mt-4">
              <button
                className="bg-primary text-sm px-6 text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition"
                onClick={handleResumeUpload}
              >
                {isResumeUploaded
                  ? (<div className="flex items-center gap-1"><Check className="w-3 h-3" />Upload again</div>)
                  : uploading
                    ? "Uploading..."
                    : analysing ? (
                      <div className="flex space-x-1 justify-center items-center">
                        <span>AI Analysing</span>
                        <div className="flex gap-1 items-center">
                          <div className="h-1 w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-1 w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-1 w-1 bg-white rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    ) : "Upload Resume"}
              </button>
            </div>
          </div>

          {/* <div className="text-center mt-4">
            <span className="text-gray-500 text-sm">Don&apos;t have Resume?  </span>
            <button
              type="button"
              className="text-primary text-sm font-medium hover:underline"
              onClick={async () => (await handleManualCreateProfile())}
            >
              Manually enter details
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
