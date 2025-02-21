// this file is not in use, it is the previous design of the talent match page which may be used in the future

"use client";
import { useEffect, useState } from "react";
import { getTalentPoolProfiles } from "@/actions/talentMatchActions";
import { useUserStore } from "@/utils/userStore";
import { Lock, FileText, TvMinimal } from "lucide-react";
import { TalentProfileCard } from "./TalentProfileCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TalentProfile } from "@prisma/client";
import TalentMatchCSS from "./Talent.module.css";
import CreateTalentPoolProfileDialog from "./CreateTalentPoolProfile";
// import * as pdfjsLib from "pdfjs-dist";
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// type TalentMatchType = {
//   id: string;
//   skills: string[];
//   profiles: string[];
//   salary: string;
//   locationPref: string;
//   isMatched: boolean;
//   matchId: string;
// };

// const baseUrl = "https://optim-cv-judge.onrender.com";

// type StructuredData = {
//   "Personal Information": {
//     [key: string]: string;
//   };
//   Description: string[];
//   Skills: {
//     HARD: string[];
//     SOFT: string[];
//   };
//   Education: {
//     [key: string]: string;
//   }[];
//   Sections: string[];
//   Interests: string[];
//   Projects: {
//     [key: string]: string | string[];
//   }[];
//   "Work Experience": {
//     [key: string]: string | string[];
//   }[];
// };

export default function TalentMatchPage() {
  const { userData } = useUserStore();
  const [selectedProfieIndex, setSelectedProfileIndex] = useState<
    number | null
  >(null);
  // const [talentMatches, setTalentMatches] = useState<TalentMatchType[]>([]);
  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>([]);
  // const [resumeIds, setResumeIds] = useState<IdsType[]>([]);
  // const [interviewIds, setInterviewIds] = useState<IdsType[]>([]);
  // const structuredData = useRef<StructuredData | null>(null);

  // const [profileId, setProfileId] = useState<string | null>(null);

  // const form = useForm<ProfileDataType>({
  //   resolver: zodResolver(profileDataSchema),
  //   defaultValues: {
  //     resumeId: "",
  //     interviewId: "",
  //     skills: [],
  //     profiles: [],
  //     certifications: [],
  //     expectedSalary: "",
  //     locationPref: "onsite",
  //     availability: "FULL_TIME",
  //     experienceYears: "",
  //   },
  // });

  // async function onSubmit(values: ProfileDataType) {
  //   try {
  //     if (!userData || !profileId) return;

  //     const userName = userData.name || "No Name";

  //     const res = await updateTalentProfile(
  //       {
  //         ...values,
  //         userName,
  //       },
  //       profileId
  //     );

  //     if (res === "success") {
  //       form.reset();
  //       toast.success("Talent Profile created Successfully");
  //     } else {
  //       toast.error("Failed to create talent profile");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to create talent profile");
  //   }
  // }

  // const extractStructuredData = useCallback(async (text: string) => {
  //   try {
  //     const response = await fetch(`${baseUrl}/extract_structured_data`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ cv_text: text }),
  //     });

  //     const result = await response.json();

  //     return response.ok ? result.message : null;
  //   } catch (error) {
  //     return null;
  //   }
  // }, []);

  // const handleFileChange = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   event.preventDefault();
  //   const file = event.target.files?.[0];

  //   if (!file || file.type !== "application/pdf") {
  //     toast.error("Please upload a PDF file");
  //     return;
  //   }

  //   if (file.size > 1 * 1024 * 1024) {
  //     toast.error("File size should not exceed 1MB");
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file);
  //     const res = await uploadResumeToAzure(formData);

  //     if (res.status === "failed") {
  //       toast.error(res.message);
  //       return;
  //     }
  //   } catch (error) {
  //     console.error("Error uploading resume:", error);
  //     toast.error("Failed to upload resume");
  //     return;
  //   }

  //   const fileReader = new FileReader();
  //   let extractedText = "";

  //   fileReader.onload = async function () {
  //     const typedArray = new Uint8Array(this.result as ArrayBuffer);

  //     const pdf = await pdfjsLib.getDocument(typedArray).promise;

  //     for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
  //       const page = await pdf.getPage(pageNumber);
  //       const textContent = await page.getTextContent();

  //       const pageText = textContent.items
  //         .map((item: any) => item.str)
  //         .join(" ");
  //       extractedText += pageText + "\n";
  //     }

  //     if (!extractedText) {
  //       toast.error("Error extracting text");
  //       return;
  //     }

  //     const structuredDataResult = await extractStructuredData(extractedText);

  //     if (!structuredDataResult) {
  //       toast.error("Failed to analyse resume");
  //       return;
  //     }

  //     structuredData.current = structuredDataResult;

  //     console.log(structuredDataResult);
  //   };

  //   fileReader.readAsArrayBuffer(file);
  // };

  // const handleConfirmMatch = async (matchId: string) => {
  //   try {
  //     const res = await acceptTalentMatch(matchId);

  //     if (res === "success") {
  //       toast.success("Match confirmed successfully");
  //     } else {
  //       toast.error("Failed to confirm match");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to confirm match");
  //   }
  // };

  useEffect(() => {
    if (!userData || !userData.id) return;

    const fetchData = async (userId: string) => {
      try {
        // const [matches, profiles] = await Promise.all([
        //   getTalentMatches(userId),
        //   getTalentProfiles(userId),
        // ]);

        const profiles = await getTalentPoolProfiles(userId);

        if (profiles) {
          setTalentProfiles(profiles);
        }

        // if (matches && matches.length) {
        //   const talentPoolIds = matches.map((match) => match.talentPoolId);
        //   const talentPoolsData = await getTalentPoolsData(talentPoolIds);

        //   const mergedData = matches.map((match, index) => ({
        //     matchId: match.id,
        //     isMatched: match.isMatched,
        //     ...(talentPoolsData[index] || {}),
        //   }));

        //   setTalentMatches(mergedData);
        // }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(userData.id);
  }, [userData]);

  return (
    <div className="flex">
      <ScrollArea className="h-screen w-[42.5%] border-r">
        <div className="p-4">
          <div className="h-48 flex items-center border rounded-lg">
            <div
              className={`${TalentMatchCSS.verticalText} h-full text-white rounded-lg px-2 text-center bg-primary`}
            >
              Your Matches
            </div>
            <div className="w-full flex justify-center py-2">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="flex flex-col border my-4 rounded-lg min-h-[calc(100vh-256px)]">
            <div className="border-b py-3 px-5 flex  text-sm gap-4 ">
              <div className="font-medium cursor-pointer">Career Profile</div>
              <div className="text-muted-foreground">Work Preference</div>
            </div>
            <div className="p-4 flex flex-col gap-4 flex-1">
              {talentProfiles.map((profile, index) => (
                <>
                  <div
                    key={index}
                    className="border p-4 flex flex-col gap-1 rounded-lg shadow-sm cursor-pointer"
                    onClick={() => setSelectedProfileIndex(index)}
                  >
                    <p className="rounded-lg ">{profile.title}</p>
                    <p className="text-muted-foreground">
                      Availability: Full Time
                    </p>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <FileText className="w-6 h-6" /> Resume
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <TvMinimal className="w-6 h-6" /> Interview
                    </div>
                  </div>
                </>
              ))}
              {talentProfiles.length <= 10 && (
                <div className="m-auto mb-4">
                  <CreateTalentPoolProfileDialog />
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
      <ScrollArea className="h-screen w-[57.5%] ">
        {selectedProfieIndex && (
          <TalentProfileCard profile={talentProfiles[selectedProfieIndex]} />
        )}
      </ScrollArea>
    </div>
  );
}
