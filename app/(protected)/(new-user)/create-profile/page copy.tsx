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
import exp from "constants";



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

    setUploading(true);

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
        setUploading(false);
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
        } else {
          // console.log(uploadResponse);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error during resume upload");
      } finally {
        setUploading(false);
      }

      // Start analysing
      setAnalysing(true);

      const extractedText = await extractTextFromPDF(file)

      try {
        const structuredDataResult = await extractStructuredData(
          extractedText
        );
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
          }

          const res = await createTalentProfile(result.resume.resumeUrl, userData.id);

          if (res.status !== 200) {
            toast.error(res.error);
          } else {
            if (res.data) {
              // console.log("Result from createTalentProfile:: ", res.data.id);
              newTalentProfileId = res.data.id
              dispatch(setResumeUrl(res.data?.resumeUrl ?? ''));
              dispatch(setId(res.data.id));
            }
          }
        } catch (error) {
          toast.error("Failed to upload resume");
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
    // Reset states for new upload
    setUploading(false);
    setAnalysing(false);
    setIsResumeUploaded(false);
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
    <div className="relative">
      <Link href="/" className="absolute top-2 left-4 max-w-[110px]">
        <Image
          src={"/home/navbar/wizelogo.svg"}
          width={180}
          height={100}
          alt="logo"
          className="w-full h-auto drop-shadow-md"
        />
      </Link>
      <ScrollArea className="h-[calc(100vh-96px)]">
        <section
          className={`${step === 1 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-3xl mx-auto flex flex-col justify-center`}
        >
          <div className="flex text-sm gap-4">
            <span>1/10 &nbsp; Create your profile</span>{" "}
            <span className="flex items-center">
              <Clock9 className="w-4 h-4" /> &nbsp; 5-10 min
            </span>
          </div>
          <h2 className="text-2xl font-medium my-4">
            How would you like to tell us about yourself?
          </h2>
          <p className="mb-8">
            We need to get a sense of your education, experience and skills.
            It&apos;s quickest to import your information — you can edit it
            before your profile goes live.
          </p>

          {/* Similar cv uploader like cv reviewer */}
          <div className="flex gap-4 justify-center items-center">
            <div>

              <div className="flex text-center mb-4 mt-3 w-full text-2xl font-bold text-gray-800">
                Upload your latest CV/Resume
              </div>

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
                    ref={fileInputRef}
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
                    className="bg-primary text-base px-8 relative text-white font-semibold py-[6px] rounded-xl hover:bg-primary focus:ring-4 focus:ring-primary-foreground transition"
                    onClick={handleResumeUpload}
                  >
                    {isResumeUploaded
                      ? (<div className="flex gap-2"><Check />Upload again</div>)
                      : uploading
                        ? "Uploading..."
                        : analysing ? (<div className='flex space-x-2 justify-center items-center dark:invert'>
                          <span className=''>AI Analysing</span>
                          <div className="flex gap-1 item-center">
                            <div className='h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                            <div className='h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                            <div className='h-2 w-2 bg-black rounded-full animate-bounce'></div>
                          </div>
                        </div>) : "Upload Resume"}
                  </button>
                </div>
              </div>
            </div>
            {/* <div>
              OR
            </div>
            <div className="items-center justify-center">
              <span>Don&apos;t have Resume? </span>
              <Button
                type="button"
                className="bg-white text-primary border border-primary hover:bg-primary mt-3 hover:text-white"
                onClick={async () => (await handleManualCreateProfile())}
              >
                Manually enter details
              </Button>
            </div> */}
          </div>
        </section>

        <section
          className={`${step === 2 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-4xl mx-auto flex flex-col justify-center overflow-scroll scrollbar-hide`}
        >
          <div className="text-sm">2/10</div>

          <h2 className="text-2xl font-medium my-4">
            Great, so what kind of work are you here to do?
          </h2>
          <p className="mb-8">
            Don&apos;t worry, you can change these choices later on.
          </p>
          <JobCategoriesSelector setStep={setStep} />
        </section>

        <section
          className={`${step === 3 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-3xl mx-auto flex flex-col justify-center`}
        >
          <div className="text-sm">3/10</div>

          <h2 className="text-2xl font-medium my-4">
            Nearly there! What work are you here to do?
          </h2>
          <p className="mb-8">
            Your skills show clients what you can offer, and help us choose
            which jobs to recommend to you. Add or remove the ones we&apos;ve
            suggested, or start typing to pick more. It&apos;s up to you.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 max-w-3xl"
            >
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormDescription>
                      Press &quot;enter&quot; key to add skills
                    </FormDescription>
                    <FormControl>
                      <ArrayInput
                        value={field?.value || []}
                        onChange={field.onChange}
                        placeholder="Enter skills required"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="hover:bg-primary-dark"
                disabled={form.formState.isSubmitting}
              >
                Submit
              </Button>
            </form>
          </Form>
        </section>

        <section
          className={`${step === 4 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-3xl mx-auto flex flex-col justify-center`}
        >
          <div className="text-sm">4/10</div>

          <h2 className="text-2xl font-medium my-4">
            Got it. Now, add a title to tell the world what you do.
          </h2>
          <p className="mb-8">
            It&apos;s the very first thing clients see, so make it count. Stand
            out by describing your expertise in your own words.
          </p>
          <ProfessionalRole setStep={setStep} />
        </section>

        <section
          className={`${step === 5 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-3xl mx-auto flex flex-col justify-center`}
        >
          <div className="text-sm">5/10</div>

          <h2 className="text-2xl font-medium my-4">
            If you have relevant work experience, add it here.
          </h2>
          <p className="mb-8">
            Freelancers who add their experience are twice as likely to win
            work. But if you&apos;re just starting out, you can still create a
            great profile. Just head on to the next page.
          </p>
          <WorkExperiences setStep={setStep} />
        </section>

        <section
          className={`${step === 6 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-3xl mx-auto flex flex-col justify-center`}
        >
          <div className="text-sm">6/10</div>

          <h2 className="text-2xl font-medium my-4">
            Clients like to know what you know - add your education here.
          </h2>
          <p className="mb-8">
            You don&apos;t have to have a degree. Adding any relevant education
            helps make your profile more visible.
          </p>
          <EducationDetails setStep={setStep} />
        </section>

        <section
          className={`${step === 7 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-3xl mx-auto flex flex-col justify-center`}
        >
          <div className="text-sm">7/10</div>

          <h2 className="text-2xl font-medium my-4">
            Looking good. Next, tell us which languages you speak.
          </h2>
          <p className="mb-8">
            Upwork is global, so clients are often interested to know what
            languages you speak. English is a must, but do you speak any other
            languages?
          </p>
          <LanguageSelector setStep={setStep} />
        </section>

        <section
          className={`${step === 8 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-3xl mx-auto flex flex-col justify-center`}
        >
          <div className="text-sm">8/10</div>

          <h2 className="text-2xl font-medium my-4">
            Great. Now write a bio to tell the world about yourself.
          </h2>
          <p className="mb-8">
            Help people get to know you at a glance. What work do you do best?
            Tell them clearly, using paragraphs or bullet points. You can always
            edit later; just make sure you proofread now?
          </p>
          <BioDetails setStep={setStep} />
        </section>

        <section
          className={`${step === 9 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-3xl mx-auto flex flex-col justify-center`}
        >
          <div className="text-sm">9/10</div>

          <h2 className="text-2xl font-medium my-4">
            Now, let&apos;s set your hourly rate.
          </h2>
          <p className="mb-8">
            Clients will see this rate on your profile and in search results
            once you publish your profile. You can adjust your rate every time
            you submit a proposal.
          </p>
          <HourlyRate setStep={setStep} />
        </section>

        <section
          className={`${step === 10 ? "flex" : "hidden"
            } h-[calc(100vh-96px)] max-w-6xl mx-auto flex flex-col justify-center`}
        >
          <div className="text-sm">10/10</div>

          <h2 className="text-2xl font-medium my-4">
            A few last details, then you can check and publish your profile.
          </h2>
          <p className="mb-8">
            A professional photo helps you build trust with your clients. To
            keep things safe and simple, they&apos;ll pay you through us - which
            is why we need your personal information.
          </p>
          <PersonalDetailsForm setStep={setStep} />
        </section>
      </ScrollArea>
      <div className="relative h-24 flex items-center">
        <div className="absolute top-0 bg-gray-300 h-1 w-full">
          <div
            className="h-1 rounded-r-lg bg-primary transition-all"
            style={{
              width: `${step * 10}%`,
            }}
          ></div>
        </div>
        <div className="px-8 flex justify-between w-full">
          <Button
            onClick={() => handleDecStep(step - 1)}
            className={`${step === 1 ? "hidden" : "bg-white border border-primary text-primary px-8"}`}
          >
            Back
          </Button>{" "}
          <Button
            onClick={() => handleIncStep(step + 1)}
            className={`${(step === 1 || step === 10) ? "hidden" : "bg-white border border-primary text-primary hover:bg-primary hover:text-white px-8"}`}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
